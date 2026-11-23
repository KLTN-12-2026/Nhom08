import 'package:flutter/material.dart';
import 'package:trove/core/config/themes/app_colors.dart';

class PrivacyPolicyScreen extends StatefulWidget {
  const PrivacyPolicyScreen({Key? key}) : super(key: key);

  @override
  State<PrivacyPolicyScreen> createState() => _PrivacyPolicyScreenState();
}

class _PrivacyPolicyScreenState extends State<PrivacyPolicyScreen> {
  bool _isVietnamese = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _isVietnamese ? 'Chính sách bảo mật' : 'Privacy Policy',
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
          'Giới thiệu',
          [
            'Trove ("chúng tôi", "của chúng tôi") cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ thông tin của bạn khi bạn sử dụng ứng dụng di động Trove.',
            '',
            'Bằng cách sử dụng ứng dụng, bạn đồng ý với việc thu thập và sử dụng thông tin theo chính sách này.',
          ],
        ),
        _buildSection(
          '1. Thông tin chúng tôi thu thập',
          [
            'Thông tin tài khoản:',
            '• Tên, địa chỉ email, số điện thoại',
            '• Ảnh đại diện (nếu bạn cung cấp)',
            '• Thông tin cá nhân bạn thêm vào hồ sơ',
            '',
            'Thông tin vị trí:',
            '• Vị trí GPS khi bạn sử dụng tính năng tìm kiếm địa điểm gần đây',
            '• Vị trí này chỉ được sử dụng khi ứng dụng đang mở',
            '',
            'Nội dung người dùng:',
            '• Địa điểm, hình ảnh, đánh giá bạn đăng tải',
            '• Bình luận và tương tác với người dùng khác',
            '',
            'Thông tin thanh toán:',
            '• Thông tin giao dịch đăng ký Premium',
            '• Chúng tôi KHÔNG lưu trữ thông tin thẻ tín dụng (được xử lý bởi Apple/RevenueCat)',
            '',
            'Dữ liệu sử dụng:',
            '• Cách bạn tương tác với ứng dụng',
            '• Tính năng bạn sử dụng',
            '• Thời gian sử dụng',
          ],
        ),
        _buildSection(
          '2. Cách chúng tôi sử dụng thông tin',
          [
            'Chúng tôi sử dụng thông tin của bạn để:',
            '',
            '• Cung cấp và cải thiện dịch vụ',
            '• Cá nhân hóa trải nghiệm của bạn',
            '• Gửi thông báo về địa điểm mới, cập nhật',
            '• Xử lý đăng ký Premium',
            '• Phát hiện và ngăn chặn gian lận, spam',
            '• Phân tích xu hướng sử dụng để cải thiện ứng dụng',
            '• Hỗ trợ khách hàng',
            '• Tuân thủ nghĩa vụ pháp lý',
          ],
        ),
        _buildSection(
          '3. Chia sẻ thông tin',
          [
            'Chúng tôi KHÔNG bán thông tin cá nhân của bạn.',
            '',
            'Chúng tôi có thể chia sẻ thông tin với:',
            '',
            'Nhà cung cấp dịch vụ:',
            '• RevenueCat (xử lý thanh toán in-app)',
            '• Cloudinary (lưu trữ hình ảnh)',
            '• Các công cụ phân tích và giám sát',
            '',
            'Người dùng khác:',
            '• Thông tin hồ sơ công khai (tên, ảnh đại diện)',
            '• Địa điểm và đánh giá bạn đăng công khai',
            '',
            'Yêu cầu pháp lý:',
            '• Khi được yêu cầu bởi luật pháp hoặc cơ quan chức năng',
            '• Để bảo vệ quyền lợi của chúng tôi và người dùng khác',
          ],
        ),
        _buildSection(
          '4. Bảo mật dữ liệu',
          [
            'Chúng tôi sử dụng các biện pháp bảo mật hợp lý để bảo vệ thông tin của bạn:',
            '',
            '• Mã hóa dữ liệu khi truyền tải (HTTPS/SSL)',
            '• Lưu trữ an toàn trên máy chủ được bảo vệ',
            '• Kiểm soát truy cập nghiêm ngặt',
            '• Giám sát hoạt động đáng ngờ',
            '',
            'Tuy nhiên, không có phương thức truyền tải hoặc lưu trữ nào là 100% an toàn. Chúng tôi không thể đảm bảo tuyệt đối về tính bảo mật.',
          ],
        ),
        _buildSection(
          '5. Quyền của bạn',
          [
            'Bạn có quyền:',
            '',
            'Truy cập: Yêu cầu xem thông tin cá nhân chúng tôi có về bạn',
            'Sửa đổi: Cập nhật hoặc sửa thông tin không chính xác',
            'Xóa: Yêu cầu xóa tài khoản và dữ liệu của bạn',
            'Xuất dữ liệu: Nhận bản sao dữ liệu của bạn',
            'Từ chối: Từ chối một số loại xử lý dữ liệu',
            '',
            'Để thực hiện các quyền này, vui lòng liên hệ: support@trove.app',
          ],
        ),
        _buildSection(
          '6. Lưu giữ dữ liệu',
          [
            'Chúng tôi lưu giữ thông tin của bạn:',
            '',
            '• Trong khi tài khoản của bạn còn hoạt động',
            '• Cần thiết để cung cấp dịch vụ',
            '• Theo yêu cầu pháp lý',
            '',
            'Khi bạn xóa tài khoản:',
            '• Thông tin cá nhân sẽ bị xóa trong vòng 30 ngày',
            '• Một số dữ liệu có thể được lưu giữ cho mục đích pháp lý hoặc an toàn',
          ],
        ),
        _buildSection(
          '7. Quyền riêng tư của trẻ em',
          [
            'Dịch vụ của chúng tôi không dành cho người dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 13 tuổi.',
            '',
            'Nếu bạn tin rằng chúng tôi đã vô tình thu thập thông tin từ trẻ em, vui lòng liên hệ ngay để chúng tôi xóa thông tin đó.',
          ],
        ),
        _buildSection(
          '8. Thay đổi chính sách',
          [
            'Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi quan trọng nào qua:',
            '',
            '• Thông báo trong ứng dụng',
            '• Email (nếu có)',
            '• Cập nhật ngày "Sửa đổi lần cuối" ở cuối tài liệu này',
          ],
        ),
        _buildSection(
          '9. Liên hệ',
          [
            'Nếu bạn có câu hỏi về Chính sách bảo mật này:',
            '',
            'Email: support@trove.app',
            'Website: https://trove.app',
          ],
        ),
        const SizedBox(height: 20),
        Text(
          'Sửa đổi lần cuối: ${DateTime.now().year}-01-30',
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
          'Introduction',
          [
            'Trove ("we", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Trove mobile application.',
            '',
            'By using the app, you agree to the collection and use of information in accordance with this policy.',
          ],
        ),
        _buildSection(
          '1. Information We Collect',
          [
            'Account Information:',
            '• Name, email address, phone number',
            '• Profile picture (if you provide one)',
            '• Personal information you add to your profile',
            '',
            'Location Information:',
            '• GPS location when you use the nearby places feature',
            '• This location is only used when the app is open',
            '',
            'User Content:',
            '• Places, images, reviews you post',
            '• Comments and interactions with other users',
            '',
            'Payment Information:',
            '• Premium subscription transaction information',
            '• We DO NOT store credit card information (processed by Apple/RevenueCat)',
            '',
            'Usage Data:',
            '• How you interact with the app',
            '• Features you use',
            '• Time spent using the app',
          ],
        ),
        _buildSection(
          '2. How We Use Your Information',
          [
            'We use your information to:',
            '',
            '• Provide and improve our services',
            '• Personalize your experience',
            '• Send notifications about new places, updates',
            '• Process Premium subscriptions',
            '• Detect and prevent fraud, spam',
            '• Analyze usage trends to improve the app',
            '• Provide customer support',
            '• Comply with legal obligations',
          ],
        ),
        _buildSection(
          '3. Information Sharing',
          [
            'We DO NOT sell your personal information.',
            '',
            'We may share information with:',
            '',
            'Service Providers:',
            '• RevenueCat (in-app payment processing)',
            '• Cloudinary (image storage)',
            '• Analytics and monitoring tools',
            '',
            'Other Users:',
            '• Public profile information (name, profile picture)',
            '• Places and reviews you post publicly',
            '',
            'Legal Requirements:',
            '• When required by law or authorities',
            '• To protect our rights and other users',
          ],
        ),
        _buildSection(
          '4. Data Security',
          [
            'We use reasonable security measures to protect your information:',
            '',
            '• Data encryption in transit (HTTPS/SSL)',
            '• Secure storage on protected servers',
            '• Strict access controls',
            '• Monitoring for suspicious activity',
            '',
            'However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.',
          ],
        ),
        _buildSection(
          '5. Your Rights',
          [
            'You have the right to:',
            '',
            'Access: Request to see personal information we have about you',
            'Correct: Update or correct inaccurate information',
            'Delete: Request deletion of your account and data',
            'Export Data: Receive a copy of your data',
            'Object: Object to certain types of data processing',
            '',
            'To exercise these rights, please contact: support@trove.app',
          ],
        ),
        _buildSection(
          '6. Data Retention',
          [
            'We retain your information:',
            '',
            '• While your account is active',
            '• As needed to provide services',
            '• As required by law',
            '',
            'When you delete your account:',
            '• Personal information will be deleted within 30 days',
            '• Some data may be retained for legal or security purposes',
          ],
        ),
        _buildSection(
          '7. Children\'s Privacy',
          [
            'Our services are not intended for persons under 13 years old. We do not knowingly collect personal information from children under 13.',
            '',
            'If you believe we have inadvertently collected information from a child, please contact us immediately so we can delete that information.',
          ],
        ),
        _buildSection(
          '8. Policy Changes',
          [
            'We may update this Privacy Policy from time to time. We will notify you of any significant changes through:',
            '',
            '• In-app notifications',
            '• Email (if available)',
            '• Updating the "Last Modified" date at the end of this document',
          ],
        ),
        _buildSection(
          '9. Contact Us',
          [
            'If you have questions about this Privacy Policy:',
            '',
            'Email: support@trove.app',
            'Website: https://trove.app',
          ],
        ),
        const SizedBox(height: 20),
        Text(
          'Last Modified: ${DateTime.now().year}-01-30',
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
