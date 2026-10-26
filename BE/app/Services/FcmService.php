<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    /**
     * Send push notification to multiple device tokens via FCM HTTP v1.
     *
     * @param array  $tokens
     * @param string $title
     * @param string $body
     * @param array  $data Additional custom data payload
     * @return array ['success' => int, 'failure' => int, 'raw' => mixed]
     */
    public function sendToTokens(array $tokens, string $title, string $body, array $data = []): array
    {
        Log::info('FcmService: sendToTokens called', [
            'tokens_count' => count($tokens),
            'title' => $title,
            'body' => $body,
        ]);

        $tokens = array_values(array_filter($tokens));
        if (empty($tokens)) {
            Log::warning('FcmService: No valid tokens after filtering', [
                'original_count' => count($tokens),
            ]);
            return ['success' => 0, 'failure' => 0, 'raw' => null];
        }

        // Try to load from JSON file first, then fallback to config/env
        $fcmConfig = $this->loadFcmConfig();
        $projectId   = $fcmConfig['project_id'] ?? null;
        $clientEmail = $fcmConfig['client_email'] ?? null;
        $privateKey  = $fcmConfig['private_key'] ?? null;

        Log::info('FcmService: Checking FCM config', [
            'has_project_id' => !empty($projectId),
            'has_client_email' => !empty($clientEmail),
            'has_private_key' => !empty($privateKey),
            'project_id' => $projectId ? substr($projectId, 0, 20) . '...' : null,
            'client_email' => $clientEmail ? substr($clientEmail, 0, 30) . '...' : null,
            'private_key_length' => $privateKey ? strlen($privateKey) : 0,
        ]);

        if (!$projectId || !$clientEmail || !$privateKey) {
            Log::error('FCM v1 config missing. Skipping push.', [
                'project_id' => $projectId ? 'SET' : 'MISSING',
                'client_email' => $clientEmail ? 'SET' : 'MISSING',
                'private_key' => $privateKey ? 'SET (' . strlen($privateKey) . ' chars)' : 'MISSING',
                'config_path' => 'services.fcm',
                'env_vars' => [
                    'FCM_PROJECT_ID' => env('FCM_PROJECT_ID') ? 'SET' : 'MISSING',
                    'FCM_CLIENT_EMAIL' => env('FCM_CLIENT_EMAIL') ? 'SET' : 'MISSING',
                    'FCM_PRIVATE_KEY' => env('FCM_PRIVATE_KEY') ? 'SET (' . strlen(env('FCM_PRIVATE_KEY')) . ' chars)' : 'MISSING',
                ],
            ]);
            return ['success' => 0, 'failure' => count($tokens), 'raw' => 'missing_fcm_v1_config'];
        }

        $accessToken = $this->getAccessToken($clientEmail, $privateKey);
        if (!$accessToken) {
            Log::error('FcmService: Failed to get access token');
            return ['success' => 0, 'failure' => count($tokens), 'raw' => 'missing_access_token'];
        }

        Log::info('FcmService: Access token obtained', [
            'token_length' => strlen($accessToken),
        ]);

        // FCM v1: chunk tokens into batches of 500 and send concurrently
        $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";
        $chunks = array_chunk($tokens, 500);
        $result = ['success' => 0, 'failure' => 0, 'raw' => []];

        Log::info('FcmService: Starting to send messages', [
            'total_tokens' => count($tokens),
            'total_chunks' => count($chunks),
        ]);

        foreach ($chunks as $chunkIndex => $chunk) {
            Log::info('FcmService: Processing chunk', [
                'chunk_index' => $chunkIndex + 1,
                'total_chunks' => count($chunks),
                'chunk_size' => count($chunk),
            ]);

            try {
                // Prepare payloads for concurrent sending
                $payloads = [];
                foreach ($chunk as $index => $token) {
                    $payload = [
                        'message' => [
                            'token' => $token,
                            'notification' => [
                                'title' => $title,
                                'body'  => $body,
                            ],
                            'data' => array_map('strval', $data),
                        ],
                    ];
                    
                    $payloads[$token] = $payload;
                    
                    // Log first payload for debugging
                    if ($index === 0) {
                        Log::info('FcmService: Sample payload', [
                            'chunk_index' => $chunkIndex + 1,
                            'payload' => $payload,
                        ]);
                    }
                }

                Log::info('FcmService: Sending chunk requests concurrently', [
                    'chunk_index' => $chunkIndex + 1,
                    'requests_count' => count($payloads),
                ]);

                // Send all requests concurrently using pool
                $responses = Http::pool(function ($pool) use ($accessToken, $url, $payloads) {
                    foreach ($payloads as $token => $payload) {
                        $pool->as($token)
                            ->withToken($accessToken)
                            ->acceptJson()
                            ->post($url, $payload);
                    }
                });

                Log::info('FcmService: Received chunk responses', [
                    'chunk_index' => $chunkIndex + 1,
                    'responses_count' => count($responses),
                ]);

                // Process responses
                foreach ($responses as $token => $response) {
                    if ($response->successful()) {
                        $result['success']++;
                        $result['raw'][] = $response->json();
                    } else {
                        $result['failure']++;
                        $result['raw'][] = [
                            'status' => $response->status(),
                            'body'   => $response->json(),
                        ];
                        Log::warning('FCM v1 send failed', [
                            'chunk' => $chunkIndex + 1,
                            'token' => substr($token, 0, 20) . '...',
                            'status' => $response->status(),
                            'body' => $response->json(),
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                Log::error('FcmService: Error processing chunk', [
                    'chunk_index' => $chunkIndex + 1,
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]);
                $result['failure'] += count($chunk);
            }
        }

        Log::info('FcmService: Completed sending messages', [
            'success' => $result['success'],
            'failure' => $result['failure'],
        ]);

        return $result;
    }

    /**
     * Get OAuth2 access token for FCM v1 using service account.
     */
    private function getAccessToken(string $clientEmail, string $privateKey): ?string
    {
        try {
            // Ensure private key has proper newlines
            $privateKey = str_replace('\\n', "\n", $privateKey);

            $now = time();
            $expires = $now + 3600; // 1 hour
            $scope = 'https://www.googleapis.com/auth/firebase.messaging';
            $aud = 'https://oauth2.googleapis.com/token';

            $header = ['alg' => 'RS256', 'typ' => 'JWT'];
            $payload = [
                'iss' => $clientEmail,
                'scope' => $scope,
                'aud' => $aud,
                'iat' => $now,
                'exp' => $expires,
            ];

            $jwt = $this->encodeJwt($header, $payload, $privateKey);
            if (!$jwt) {
                return null;
            }

            $response = Http::asForm()->post($aud, [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if (!$response->successful()) {
                Log::warning('FCM v1 token request failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);
                return null;
            }

            return $response->json('access_token');
        } catch (\Throwable $e) {
            Log::error('FCM v1 getAccessToken failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Encode JWT with RS256.
     */
    private function encodeJwt(array $header, array $payload, string $privateKey): ?string
    {
        $base64UrlHeader = rtrim(strtr(base64_encode(json_encode($header)), '+/', '-_'), '=');
        $base64UrlPayload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $data = $base64UrlHeader . '.' . $base64UrlPayload;

        $signature = '';
        $success = openssl_sign($data, $signature, $privateKey, 'sha256');
        if (!$success) {
            Log::error('FCM v1 JWT signing failed');
            return null;
        }

        $base64UrlSignature = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
        return $data . '.' . $base64UrlSignature;
    }

    /**
     * Load FCM configuration from JSON file or env/config.
     *
     * @return array
     */
    private function loadFcmConfig(): array
    {
        $jsonPath = config('services.fcm.json_path') 
            ?: storage_path('app/firebase/trove-firebase.json');

        if (file_exists($jsonPath) && is_readable($jsonPath)) {
            try {
                $jsonContent = file_get_contents($jsonPath);
                
                // Log JSON file content
                Log::info('FcmService: Loading from JSON file', [
                    'path' => $jsonPath,
                    'content' => $jsonContent,
                ]);

                $jsonData = json_decode($jsonContent, true);
                
                if (json_last_error() === JSON_ERROR_NONE 
                    && isset($jsonData['project_id'], $jsonData['client_email'], $jsonData['private_key'])) {
                    return [
                        'project_id' => $jsonData['project_id'],
                        'client_email' => $jsonData['client_email'],
                        'private_key' => $jsonData['private_key'],
                    ];
                }
            } catch (\Throwable $e) {
                Log::error('FcmService: Failed to load JSON file', [
                    'path' => $jsonPath,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Fallback to config/env
        return [
            'project_id' => config('services.fcm.project_id') ?: env('FCM_PROJECT_ID'),
            'client_email' => config('services.fcm.client_email') ?: env('FCM_CLIENT_EMAIL'),
            'private_key' => config('services.fcm.private_key') ?: env('FCM_PRIVATE_KEY'),
        ];
    }
}

