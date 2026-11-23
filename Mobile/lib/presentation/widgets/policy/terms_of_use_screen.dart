import 'package:flutter/material.dart';
import 'package:trove/core/config/themes/app_colors.dart';

class TermsOfUseScreen extends StatefulWidget {
  const TermsOfUseScreen({Key? key}) : super(key: key);

  @override
  State<TermsOfUseScreen> createState() => _TermsOfUseScreenState();
}

class _TermsOfUseScreenState extends State<TermsOfUseScreen> {
  bool _isVietnamese = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _isVietnamese ? 'Điều khoản sử dụng' : 'Terms of Use',
          style: const TextStyle(color: textColor),
        ),
        backgroundColor: primaryColor,
        iconTheme: const IconThemeData(color: textColor),
        actions: [
          // Language Toggle
          Container(
            margin: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(_isVietnamese ? '🇻🇳 VI' : '🇺🇸 EN'),
              selected: true,
              onSelected: (_) {
                setState(() => _isVietnamese = !_isVietnamese);
              },
              selectedColor: Colors.amber.shade100,
              labelStyle: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child:
            _isVietnamese ? _buildVietnameseContent() : _buildEnglishContent(),
      ),
    );
  }

  Widget _buildVietnameseContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSection(
          'Chào mừng đến với Trove',
          [
            'Các điều khoản sử dụng này ("Điều khoản") điều chỉnh việc sử dụng ứng dụng di động Trove và các dịch vụ liên quan ("Dịch vụ"). Bằng cách truy cập hoặc sử dụng Dịch vụ, bạn đồng ý bị ràng buộc bởi các Điều khoản này.',
          ],
        ),
        _buildSection(
          '1. Chấp nhận Điều khoản',
          [
            'Bằng cách tạo tài khoản hoặc sử dụng Trove, bạn xác nhận rằng:',
            '',
            '• Bạn đã đọc và hiểu các Điều khoản này',
            '• Bạn đồng ý bị ràng buộc bởi các Điều khoản này',
            '• Bạn ít nhất 13 tuổi',
            '• Bạn có quyền hợp pháp để tham gia vào thỏa thuận ràng buộc này',
          ],
        ),
        _buildSection(
          '2. Dịch vụ của chúng tôi',
          [
            'Trove cung cấp một nền tảng để:',
            '',
            '• Khám phá và chia sẻ địa điểm',
            '• Đánh giá và bình luận về địa điểm',
            '• Kết nối với người dùng khác',
            '• Lưu địa điểm yêu thích',
            '• Lập kế hoạch hẹn hò (với gói Premium)',
          ],
        ),
        _buildSection(
          '3. Đăng ký Premium - Thông tin quan trọng',
          [
            '📌 THÔNG TIN ĐĂNG KÝ TỰ ĐỘNG GIA HẠN',
            '',
            'Gói Premium cung cấp:',
            '• AI gợi ý địa điểm thông minh',
            '• Lưu không giới hạn địa điểm yêu thích',
            '• Lập kế hoạch hẹn hò chi tiết',
            '• Không quảng cáo',
            '• Hỗ trợ ưu tiên',
            '',
            'Các gói đăng ký:',
            '• Gói 1 tháng: Tự động gia hạn hàng tháng',
            '• Gói 1 năm: Tự động gia hạn hàng năm',
            '',
            'Giá:',
            '• Giá hiển thị trong ứng dụng tại thời điểm mua',
            '• Giá có thể thay đổi tùy theo quốc gia và loại tiền tệ',
            '• Giá bao gồm thuế áp dụng',
            '',
            'Thanh toán và Gia hạn:',
            '• Thanh toán được tính vào tài khoản iTunes của bạn khi xác nhận mua hàng',
            '• Đăng ký tự động gia hạn trừ khi tắt tự động gia hạn ít nhất 24 giờ trước khi kết thúc chu kỳ hiện tại',
            '• Tài khoản sẽ bị tính phí gia hạn trong vòng 24 giờ trước khi kết thúc chu kỳ hiện tại',
            '• Phí gia hạn sẽ được xác định và hiển thị trước khi thanh toán',
            '',
            'Quản lý và Hủy:',
            '• Bạn có thể quản lý đăng ký và tắt tự động gia hạn trong Cài đặt tài khoản iTunes sau khi mua',
            '• Hủy có hiệu lực sau khi chu kỳ đăng ký hiện tại kết thúc',
            '• Không hoàn tiền cho phần chưa sử dụng của chu kỳ đăng ký',
            '',
            'Dùng thử miễn phí (nếu có):',
            '• Thời gian dùng thử miễn phí sẽ bị mất khi bạn mua đăng ký',
            '• Sau khi hết thời gian dùng thử, bạn sẽ tự động bị tính phí trừ khi hủy trước',
          ],
        ),
        _buildSection(
          '4. Tài khoản người dùng',
          [
            'Khi tạo tài khoản:',
            '',
            '• Cung cấp thông tin chính xác và đầy đủ',
            '• Duy trì bảo mật mật khẩu của bạn',
            '• Chịu trách nhiệm cho tất cả hoạt động dưới tài khoản của bạn',
            '• Thông báo ngay cho chúng tôi về bất kỳ vi phạm bảo mật nào',
          ],
        ),
        _buildSection(
          '5. Nội dung người dùng',
          [
            'Bạn chịu trách nhiệm cho nội dung bạn đăng tải:',
            '',
            '• Bạn sở hữu hoặc có quyền sử dụng nội dung',
            '• Nội dung không vi phạm quyền của bên thứ ba',
            '• Nội dung tuân thủ Chính sách nội dung của chúng tôi',
            '',
            'Bằng cách đăng nội dung, bạn cấp cho Trove:',
            '• Giấy phép không độc quyền, toàn cầu để sử dụng, hiển thị và phân phối nội dung của bạn',
            '• Quyền xóa nội dung vi phạm điều khoản',
          ],
        ),
        _buildSection(
          '6. Hành vi bị cấm',
          [
            'Bạn KHÔNG ĐƯỢC:',
            '',
            '• Đăng nội dung bất hợp pháp, có hại, hoặc gây khó chịu',
            '• Quấy rối, đe dọa hoặc lạm dụng người dùng khác',
            '• Spam hoặc gửi thông tin sai lệch',
            '• Vi phạm quyền sở hữu trí tuệ',
            '• Sử dụng bot hoặc công cụ tự động',
            '• Can thiệp vào hoạt động của Dịch vụ',
            '• Thu thập dữ liệu người dùng khác',
            '• Giả mạo danh tính',
          ],
        ),
        _buildSection(
          '7. Quyền sở hữu trí tuệ',
          [
            'Dịch vụ và nội dung gốc của nó (trừ nội dung người dùng):',
            '',
            '• Là tài sản của Trove',
            '• Được bảo vệ bởi luật bản quyền, nhãn hiệu và các luật khác',
            '• Không được sao chép, sửa đổi hoặc phân phối mà không có sự cho phép',
          ],
        ),
        _buildSection(
          '8. Chấm dứt',
          [
            'Chúng tôi có thể đình chỉ hoặc chấm dứt tài khoản của bạn:',
            '',
            '• Nếu bạn vi phạm các Điều khoản này',
            '• Vì bất kỳ lý do nào, có hoặc không có thông báo',
            '',
            'Bạn có thể xóa tài khoản của mình bất kỳ lúc nào từ cài đặt ứng dụng.',
          ],
        ),
        _buildSection(
          '9. Từ chối trách nhiệm',
          [
            'Dịch vụ được cung cấp "NGUYÊN TRẠNG" và "NHƯ CÓ SẴN".',
            '',
            'Chúng tôi không đảm bảo:',
            '• Dịch vụ sẽ không bị gián đoạn hoặc không có lỗi',
            '• Thông tin trên Dịch vụ là chính xác hoặc đầy đủ',
            '• Bất kỳ lỗi nào sẽ được sửa',
            '',
            'Bạn sử dụng Dịch vụ với rủi ro của riêng mình.',
          ],
        ),
        _buildSection(
          '10. Giới hạn trách nhiệm',
          [
            'Trong phạm vi tối đa được pháp luật cho phép:',
            '',
            'Trove sẽ không chịu trách nhiệm cho:',
            '• Bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc do hậu quả',
            '• Mất dữ liệu, lợi nhuận hoặc uy tín',
            '• Chi phí mua hàng hóa hoặc dịch vụ thay thế',
            '',
            'Trách nhiệm tổng thể của chúng tôi không vượt quá số tiền bạn đã trả cho chúng tôi trong 12 tháng qua.',
          ],
        ),
        _buildSection(
          '11. Thay đổi Điều khoản',
          [
            'Chúng tôi có thể sửa đổi các Điều khoản này bất kỳ lúc nào.',
            '',
            '• Thay đổi quan trọng sẽ được thông báo trong ứng dụng',
            '• Việc tiếp tục sử dụng sau khi thay đổi đồng nghĩa với việc chấp nhận',
            '• Nếu bạn không đồng ý, hãy ngừng sử dụng Dịch vụ',
          ],
        ),
        _buildSection(
          '12. Liên hệ',
          [
            'Nếu bạn có câu hỏi về các Điều khoản này:',
            '',
            'Email: support@trove.app',
            'Website: https://trove.app',
          ],
        ),
        const SizedBox(height: 20),
        Text(
          'Có hiệu lực từ: ${DateTime.now().year}-01-30',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
            fontStyle: FontStyle.italic,
          ),
        ),
      ],
    );
  }

  Widget _buildEnglishContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSection(
          'Welcome to Trove',
          [
            'These Terms of Use ("Terms") govern your use of the Trove mobile application and related services ("Service"). By accessing or using the Service, you agree to be bound by these Terms.',
          ],
        ),
        _buildSection(
          '1. Acceptance of Terms',
          [
            'By creating an account or using Trove, you acknowledge that:',
            '',
            '• You have read and understood these Terms',
            '• You agree to be bound by these Terms',
            '• You are at least 13 years old',
            '• You have the legal authority to enter into this binding agreement',
          ],
        ),
        _buildSection(
          '2. Our Services',
          [
            'Trove provides a platform to:',
            '',
            '• Discover and share places',
            '• Review and comment on places',
            '• Connect with other users',
            '• Save favorite places',
            '• Plan dates (with Premium subscription)',
          ],
        ),
        _buildSection(
          '3. Premium Subscription - Important Information',
          [
            '📌 AUTO-RENEWABLE SUBSCRIPTION INFORMATION',
            '',
            'Premium subscription provides:',
            '• Smart AI place recommendations',
            '• Unlimited favorite place saves',
            '• Detailed date planning',
            '• Ad-free experience',
            '• Priority support',
            '',
            'Subscription plans:',
            '• 1 Month Plan: Auto-renews monthly',
            '• 1 Year Plan: Auto-renews annually',
            '',
            'Pricing:',
            '• Price displayed in-app at time of purchase',
            '• Price may vary by country and currency',
            '• Price includes applicable taxes',
            '',
            'Payment and Renewal:',
            '• Payment will be charged to your iTunes Account upon confirmation of purchase',
            '• Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period',
            '• Account will be charged for renewal within 24 hours prior to the end of the current period',
            '• Renewal fee will be identified and displayed before payment',
            '',
            'Managing and Canceling:',
            '• You can manage your subscription and turn off auto-renewal in your iTunes Account Settings after purchase',
            '• Cancellation takes effect after the current subscription period ends',
            '• No refunds for the unused portion of the subscription period',
            '',
            'Free Trial (if available):',
            '• Any unused portion of a free trial period will be forfeited when you purchase a subscription',
            '• After the trial period ends, you will automatically be charged unless you cancel before',
          ],
        ),
        _buildSection(
          '4. User Accounts',
          [
            'When creating an account:',
            '',
            '• Provide accurate and complete information',
            '• Maintain the security of your password',
            '• Accept responsibility for all activities under your account',
            '• Notify us immediately of any security breaches',
          ],
        ),
        _buildSection(
          '5. User Content',
          [
            'You are responsible for content you post:',
            '',
            '• You own or have the right to use the content',
            '• Content does not violate third-party rights',
            '• Content complies with our Content Policy',
            '',
            'By posting content, you grant Trove:',
            '• A non-exclusive, worldwide license to use, display, and distribute your content',
            '• The right to remove content that violates our terms',
          ],
        ),
        _buildSection(
          '6. Prohibited Conduct',
          [
            'You MAY NOT:',
            '',
            '• Post illegal, harmful, or offensive content',
            '• Harass, threaten, or abuse other users',
            '• Spam or send misleading information',
            '• Violate intellectual property rights',
            '• Use bots or automated tools',
            '• Interfere with Service operations',
            '• Collect other users\' data',
            '• Impersonate others',
          ],
        ),
        _buildSection(
          '7. Intellectual Property',
          [
            'The Service and its original content (excluding user content):',
            '',
            '• Are the property of Trove',
            '• Are protected by copyright, trademark, and other laws',
            '• May not be copied, modified, or distributed without permission',
          ],
        ),
        _buildSection(
          '8. Termination',
          [
            'We may suspend or terminate your account:',
            '',
            '• If you violate these Terms',
            '• For any reason, with or without notice',
            '',
            'You may delete your account at any time from the app settings.',
          ],
        ),
        _buildSection(
          '9. Disclaimers',
          [
            'The Service is provided "AS IS" and "AS AVAILABLE".',
            '',
            'We do not warrant that:',
            '• The Service will be uninterrupted or error-free',
            '• Information on the Service is accurate or complete',
            '• Any errors will be corrected',
            '',
            'You use the Service at your own risk.',
          ],
        ),
        _buildSection(
          '10. Limitation of Liability',
          [
            'To the maximum extent permitted by law:',
            '',
            'Trove will not be liable for:',
            '• Any indirect, incidental, special, or consequential damages',
            '• Loss of data, profits, or goodwill',
            '• Cost of procurement of substitute goods or services',
            '',
            'Our total liability shall not exceed the amount you paid us in the past 12 months.',
          ],
        ),
        _buildSection(
          '11. Changes to Terms',
          [
            'We may modify these Terms at any time.',
            '',
            '• Significant changes will be notified in-app',
            '• Continued use after changes constitutes acceptance',
            '• If you disagree, stop using the Service',
          ],
        ),
        _buildSection(
          '12. Contact Us',
          [
            'If you have questions about these Terms:',
            '',
            'Email: support@trove.app',
            'Website: https://trove.app',
          ],
        ),
        const SizedBox(height: 20),
        Text(
          'Effective Date: ${DateTime.now().year}-01-30',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
            fontStyle: FontStyle.italic,
          ),
        ),
      ],
    );
  }

  Widget _buildSection(String title, List<String> points) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 12),
          ...points.map((point) {
            if (point.isEmpty) {
              return const SizedBox(height: 8);
            }
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                point,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[800],
                  height: 1.5,
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
