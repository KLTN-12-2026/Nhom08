<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Carbon\Carbon;

class SepayWebhookController extends Controller
{
    /**
     * Handle webhook từ SePay (chuyển khoản ngân hàng)
     */
    public function handle(Request $request)
    {
        try {
            // Lấy API Token hoặc Authorization header từ request (tùy theo cấu hình SePay của bạn)
            // Ví dụ ở đây ta check API Token cấu hình trong file config hoặc .env (SEPAY_API_TOKEN)
            $token = env('SEPAY_API_TOKEN');
            $headerToken = $request->header('Authorization');

            if ($token) {
                // SePay thường gửi header dạng "Apikey [token]" hoặc "Bearer [token]"
                $expectedApikey = 'Apikey ' . $token;
                $expectedBearer = 'Bearer ' . $token;
                
                if ($headerToken !== $expectedApikey && $headerToken !== $expectedBearer) {
                    Log::warning('SePay Webhook: Invalid token', ['ip' => $request->ip(), 'header' => $headerToken]);
                    return response()->json(['error' => 'Unauthorized'], 401);
                }
            }

            // Lấy dữ liệu từ Payload của SePay
            $amount = $request->input('transferAmount') ?? $request->input('amount');
            $content = $request->input('transactionContent') ?? $request->input('content');

            if (!$amount || !$content) {
                Log::error('SePay Webhook: Invalid payload format', ['payload' => $request->all()]);
                return response()->json(['error' => 'Invalid payload'], 400);
            }

            // Ghi log giao dịch
            Log::info('SePay Webhook Received:', ['amount' => $amount, 'content' => $content]);

            // KIỂM TRA LOGIC CẤP QUYỀN (VÍ DỤ)
            // Nếu nội dung chuyển khoản có chứa mã đăng ký, ví dụ: "TROVEVIP id_cua_user" hoặc email user
            // Bước 1: Trích xuất ID user từ $content (ví dụ user ghi "TROVEVIP 5")
            // Ở đây là một đoạn Regex thông minh hơn để tìm ID sau chữ TROVEVIP
            // Hỗ trợ cả "TROVEVIP 2", "TROVEVIP GOLD 3", "TROVEVIP DIAMOND 5"
            preg_match('/TROVEVIP.*?(\d+)/i', $content, $matches);
            
            if (!empty($matches[1])) {
                $userId = $matches[1];
                $user = User::find($userId);

                if ($user) {
                    // Bước 2: Phân loại gói dựa trên số tiền chuyển khoản
                    if ($amount >= 199000) {
                        $user->subscription_tier = 'enterprise';
                        $user->save();
                        
                        // Ghi lại lịch sử vào bảng subscriptions dùng chung
                        \App\Models\Subscription::create([
                            'user_id' => $user->id,
                            'revenuecat_customer_id' => 'sepay_' . $user->id . '_' . time(),
                            'product_id' => 'trove_diamond_lifetime',
                            'status' => 'active',
                            'platform' => 'transfer',
                            'expires_at' => null // Gói Diamond vĩnh viễn
                        ]);

                        Log::info("SePay Webhook: Upgraded user {$userId} to DIAMOND (enterprise).");
                    } elseif ($amount >= 59000) {
                        $user->subscription_tier = 'pro';
                        $user->save();
                        
                        // Ghi lại lịch sử vào bảng subscriptions dùng chung
                        \App\Models\Subscription::create([
                            'user_id' => $user->id,
                            'revenuecat_customer_id' => 'sepay_' . $user->id . '_' . time(),
                            'product_id' => 'trove_gold_monthly',
                            'status' => 'active',
                            'platform' => 'transfer',
                            'expires_at' => Carbon::now()->addMonth() // Gói Gold dùng 1 tháng
                        ]);

                        Log::info("SePay Webhook: Upgraded user {$userId} to GOLD (pro).");
                    } else {
                        Log::warning("SePay Webhook: Số tiền không đủ cho gói nào.", ['user_id' => $userId, 'amount' => $amount]);
                    }
                } else {
                    Log::warning("SePay Webhook: Không tìm thấy user ID {$userId}");
                }
            } else {
                Log::warning("SePay Webhook: Không trích xuất được User ID từ nội dung", ['content' => $content]);
            }

            // Trả về 200 OK cho SePay
            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('SePay Webhook Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Internal Error'], 500);
        }
    }
}
