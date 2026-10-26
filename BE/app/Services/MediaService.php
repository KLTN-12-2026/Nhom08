<?php

namespace App\Services;

use App\Models\Media;
use App\Repositories\MediaRepository;
use Cloudinary\Api\Exception\ApiError;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class MediaService extends BaseService
{
    protected $maxFileSize = 10 * 1024 * 1024; // 10MB
    protected $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    protected $maxDimensions = [1200, 1200];
    protected $repository;

    public function __construct(MediaRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Validate uploaded file
     */
    public function validateImage(UploadedFile $file): bool
    {
        // Check file type
        if (!in_array($file->getMimeType(), $this->allowedTypes)) {
            throw new \InvalidArgumentException('Only JPEG, PNG, WebP, GIF files are allowed');
        }

        // Check file size
        if ($file->getSize() > $this->maxFileSize) {
            throw new \InvalidArgumentException('File too large (max 10MB)');
        }

        return true;
    }

    /**
     * Upload single image to Cloudinary
     */
    public function uploadImage(UploadedFile $file, string $folder = 'general'): array
    {
        $this->validateImage($file);

        try {
            // Generate unique public_id
            $publicId = $this->generatePublicId($file, $folder);

            // Upload to Cloudinary with transformations
            $result = Cloudinary::uploadApi()->upload($file->getRealPath(), [
                'public_id' => $publicId,
                'folder' => $folder,
                'transformation' => [
                    ['quality' => 'auto:good'],
                    ['fetch_format' => 'auto']
                ],
                'overwrite' => false,
                'unique_filename' => true,
                'use_filename' => false
            ]);

            Log::info("Successfully uploaded image to Cloudinary: {$publicId}");

            return [
                'url' => $result['secure_url'] ?? null,
                'public_id' => $result['public_id'] ?? $publicId,
                'width' => $result['width'] ?? null,
                'height' => $result['height'] ?? null,
                'format' => $result['format'] ?? null,
                'size' => $result['bytes'] ?? null
            ];

        } catch (ApiError $e) {
            Log::error('Cloudinary upload error: ' . $e->getMessage());
            throw new \RuntimeException('Cloudinary upload error: ' . $e->getMessage(), 0, $e);
        } catch (\Exception $e) {
            Log::error('Unexpected error during upload: ' . $e->getMessage());
            throw new \RuntimeException('Unexpected error during upload: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Upload multiple images
     */
    public function uploadMultipleImages(array $files, string $folder = 'general'): array
    {
        $results = [];
        $uploadedUrls = [];

        foreach ($files as $file) {
            try {
                $result = $this->uploadImage($file, $folder);
                $results[] = $result;
                $uploadedUrls[] = $result['url'];
            } catch (\Exception $e) {
                Log::error("Error uploading {$file->getClientOriginalName()}: " . $e->getMessage());
                
                // Clean up uploaded images if this is a critical failure
                if (empty($results)) {
                    foreach ($uploadedUrls as $url) {
                        $this->deleteImage($url);
                    }
                    throw new \RuntimeException("Failed to upload images: " . $e->getMessage());
                }
                
                continue; // Continue with other files for partial success
            }
        }

        if (empty($results)) {
            throw new \RuntimeException('No images were successfully uploaded');
        }

        return $results;
    }

    /**
     * Delete image from Cloudinary
     */
    public function deleteImage(string $imageUrl): bool
    {
        try {
            $publicId = $this->extractPublicId($imageUrl);
            
            if (!$publicId) {
                Log::warning("Could not extract public_id from URL: {$imageUrl}");
                return false;
            }

            $result = Cloudinary::destroy($publicId);
            
            if ($result['result'] === 'ok') {
                Log::info("Successfully deleted image from Cloudinary: {$publicId}");
                return true;
            } else {
                Log::warning("Failed to delete image from Cloudinary: " . json_encode($result));
                return false;
            }

        } catch (ApiError $e) {
            Log::error('Cloudinary delete error: ' . $e->getMessage());
            return false;
        } catch (\Exception $e) {
            Log::error('Error deleting image: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Save image information to database
     */
    public function saveImageToDatabase(array $imageData, ?int $userId = null, ?int $postId = null, ?int $placeId = null, ?int $reviewId = null): Media
    {
        try {
            $media = Media::create([
                'url' => $imageData['url'],
                'file_name' => $imageData['file_name'] ?? 'unknown.jpg',
                'size' => $imageData['size'] ?? 0,
                'width' => $imageData['width'] ?? null,
                'height' => $imageData['height'] ?? null,
                'format' => $imageData['format'] ?? null,
                'user_id' => $userId,
                'post_id' => $postId,
                'place_id' => $placeId,
                'review_id' => $reviewId,
            ]);

            Log::info("Successfully saved image to database: {$media->id}");
            return $media;

        } catch (\Exception $e) {
            Log::error('Error saving image to database: ' . $e->getMessage());
            throw new \RuntimeException('Failed to save image information');
        }
    }

    /**
     * Upload and save image (complete workflow)
     */
    public function uploadAndSaveImage(UploadedFile $file, string $folder = 'general', ?int $userId = null, ?int $postId = null, ?int $placeId = null, ?int $reviewId = null): Media
    {
        try {
            // Upload to Cloudinary
            $uploadResult = $this->uploadImage($file, $folder);

            // Prepare data for database
            $imageData = [
                'url' => $uploadResult['url'],
                'file_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'width' => $uploadResult['width'],
                'height' => $uploadResult['height'],
                'format' => $uploadResult['format'],
            ];

            // Save to database
            return $this->saveImageToDatabase($imageData, $userId, $postId, $placeId, $reviewId);

        } catch (\Exception $e) {
            // If database save failed but upload succeeded, try to clean up
            if (isset($uploadResult['url'])) {
                $this->deleteImage($uploadResult['url']);
            }
            throw $e;
        }
    }

    /**
     * Upload multiple images and save to database
     */
    public function uploadMultipleAndSave(array $files, string $folder = 'general', ?int $userId = null, ?int $postId = null, ?int $placeId = null, ?int $reviewId = null): array
    {
        $mediaFiles = [];
        $uploadedUrls = [];

        foreach ($files as $file) {
            try {
                $mediaFile = $this->uploadAndSaveImage($file, $folder, $userId, $postId, $placeId, $reviewId);
                $mediaFiles[] = $mediaFile;
                $uploadedUrls[] = $mediaFile->url;
            } catch (\Exception $e) {
                Log::error("Error uploading {$file->getClientOriginalName()}: " . $e->getMessage());
                
                // Clean up uploaded images if this is a critical failure
                if (empty($mediaFiles)) {
                    foreach ($uploadedUrls as $url) {
                        $this->deleteImage($url);
                    }
                    throw new \RuntimeException("Failed to upload images: " . $e->getMessage());
                }
                
                continue;
            }
        }

        if (empty($mediaFiles)) {
            throw new \RuntimeException('No images were successfully uploaded');
        }

        return $mediaFiles;
    }

    /**
     * Save image URLs directly to database (for client-side uploads)
     * URLs are already uploaded to Cloudinary by the client
     * 
     * @param array $imageUrls Array of Cloudinary URLs
     * @param int|null $userId User who uploaded the images
     * @param int|null $postId Post ID if attached to post
     * @param int|null $placeId Place ID if attached to place
     * @param int|null $reviewId Review ID if attached to review
     * @return array Array of Media models
     */
    public function saveImageUrlsToDatabase(array $imageUrls, ?int $userId = null, ?int $postId = null, ?int $placeId = null, ?int $reviewId = null): array
    {
        $mediaFiles = [];

        foreach ($imageUrls as $url) {
            try {
                // Validate URL format
                if (!filter_var($url, FILTER_VALIDATE_URL)) {
                    Log::warning("Invalid URL skipped: {$url}");
                    continue;
                }

                // Extract public_id for record keeping
                $publicId = $this->extractPublicId($url);
                
                // Extract filename from URL or use default
                $urlParts = explode('/', $url);
                $fileName = end($urlParts);
                
                // Try to extract metadata from Cloudinary URL if possible
                // Format: https://res.cloudinary.com/.../upload/v123456/folder/filename.ext
                $format = pathinfo($fileName, PATHINFO_EXTENSION);

                $imageData = [
                    'url' => $url,
                    'file_name' => $fileName,
                    'size' => 0, // Unknown size for client uploads
                    'width' => null, // Could be extracted via Cloudinary API if needed
                    'height' => null,
                    'format' => $format ?: null,
                ];

                $media = $this->saveImageToDatabase($imageData, $userId, $postId, $placeId, $reviewId);
                $mediaFiles[] = $media;

            } catch (\Exception $e) {
                Log::error("Error saving image URL to database: {$url} - " . $e->getMessage());
                continue; // Continue with other URLs
            }
        }

        if (empty($mediaFiles)) {
            Log::warning('No image URLs were successfully saved to database');
        }

        return $mediaFiles;
    }

    /**
     * Generate transformed image URL
     */
    public function generateTransformationUrl(string $imageUrl, array $transformations = []): string
    {
        try {
            $publicId = $this->extractPublicId($imageUrl);
            
            if (!$publicId) {
                return $imageUrl;
            }

            $cloudinaryImage = Cloudinary::getImage($publicId);
            return $cloudinaryImage->resize($transformations)->toUrl();

        } catch (\Exception $e) {
            Log::error('Error generating transformation URL: ' . $e->getMessage());
            return $imageUrl;
        }
    }

    /**
     * Generate unique public_id for Cloudinary
     */
    private function generatePublicId(UploadedFile $file, string $folder): string
    {
        $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $cleanName = preg_replace('/[^a-zA-Z0-9_-]/', '', $filename);
        $cleanName = substr($cleanName, 0, 50);
        
        if (empty($cleanName)) {
            $cleanName = 'image';
        }

        return $folder . '/' . $cleanName . '_' . uniqid();
    }

    /**
     * Extract public_id from Cloudinary URL
     */
    private function extractPublicId(string $imageUrl): ?string
    {
        if (!str_contains($imageUrl, 'cloudinary.com')) {
            return null;
        }

        $urlParts = explode('/', $imageUrl);
        $uploadIndex = array_search('upload', $urlParts);
        
        if ($uploadIndex === false || $uploadIndex + 2 >= count($urlParts)) {
            return null;
        }

        $publicIdParts = array_slice($urlParts, $uploadIndex + 2);
        $publicIdWithExt = implode('/', $publicIdParts);
        
        return pathinfo($publicIdWithExt, PATHINFO_FILENAME);
    }
}