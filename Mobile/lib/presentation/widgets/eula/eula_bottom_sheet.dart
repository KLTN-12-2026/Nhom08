import 'package:flutter/material.dart';
import 'package:trove/core/config/themes/app_colors.dart';

class EulaBottomSheet extends StatefulWidget {
  const EulaBottomSheet({Key? key}) : super(key: key);

  @override
  State<EulaBottomSheet> createState() => _EulaBottomSheetState();
}

class _EulaBottomSheetState extends State<EulaBottomSheet> {
  bool _isVietnamese = true;
  bool _hasScrolledToBottom = false;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.offset >=
        _scrollController.position.maxScrollExtent - 50) {
      if (!_hasScrolledToBottom) {
        setState(() {
          _hasScrolledToBottom = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: primaryColor,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                // Drag Handle
                Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _isVietnamese ? 'Điều khoản sử dụng' : 'Terms of Service',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: textColor),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                // Language Toggle
                Container(
                  margin: const EdgeInsets.only(top: 8),
                  decoration: BoxDecoration(
                    color: backgroundSecondary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _buildLanguageButton(
                          'Tiếng Việt',
                          _isVietnamese,
                          () => setState(() => _isVietnamese = true),
                        ),
                      ),
                      Expanded(
                        child: _buildLanguageButton(
                          'English',
                          !_isVietnamese,
                          () => setState(() => _isVietnamese = false),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Content
          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.all(20),
              child: _isVietnamese
                  ? _buildVietnameseContent()
                  : _buildEnglishContent(),
            ),
          ),
          // Accept Button
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Column(
              children: [
                if (!_hasScrolledToBottom)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      _isVietnamese
                          ? 'Vui lòng cuộn xuống để đọc toàn bộ điều khoản'
                          : 'Please scroll down to read all terms',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _hasScrolledToBottom
                        ? () => Navigator.pop(context, true)
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      disabledBackgroundColor: Colors.grey[300],
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      _isVietnamese ? 'Tôi đồng ý' : 'I Agree',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: _hasScrolledToBottom ? textColor : Colors.grey,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLanguageButton(String text, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? primaryColor : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          text,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? textColor : Colors.grey[600],
          ),
        ),
      ),
    );
  }

  Widget _buildVietnameseContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSection(
          'Chính sách nội dung',
          [
            'Trove cam kết duy trì một cộng đồng an toàn và tích cực cho tất cả người dùng.',
            '',
            'Chúng tôi KHÔNG CHẤP NHẬN bất kỳ nội dung hoặc hành vi nào sau đây:',
            '• Nội dung khiêu dâm, bạo lực hoặc gây sốc',
            '• Ngôn từ thù hận, phân biệt đối xử hoặc quấy rối',
            '• Spam, lừa đảo hoặc thông tin sai lệch',
            '• Vi phạm quyền sở hữu trí tuệ',
            '• Nội dung bất hợp pháp hoặc khuyến khích hoạt động bất hợp pháp',
            '• Thông tin cá nhân của người khác mà không có sự đồng ý',
          ],
        ),
        _buildSection(
          'Lọc nội dung không phù hợp',
          [
            'Trove sử dụng kết hợp công nghệ tự động và kiểm duyệt thủ công để:',
            '• Phát hiện và loại bỏ nội dung vi phạm',
            '• Lọc từ ngữ và hình ảnh không phù hợp',
            '• Giám sát hoạt động đáng ngờ',
            '• Bảo vệ người dùng khỏi nội dung có hại',
          ],
        ),
        _buildSection(
          'Cơ chế báo cáo nội dung',
          [
            'Mỗi bài đăng và bình luận đều có nút "Báo cáo" để bạn có thể:',
            '• Báo cáo nội dung không phù hợp hoặc vi phạm',
            '• Chọn lý do báo cáo cụ thể',
            '• Cung cấp thông tin bổ sung nếu cần',
            '',
            'Tất cả báo cáo được gửi trực tiếp đến đội ngũ kiểm duyệt của chúng tôi.',
          ],
        ),
        _buildSection(
          'Chặn người dùng',
          [
            'Bạn có quyền chặn bất kỳ người dùng nào:',
            '• Nội dung của người bị chặn sẽ được xóa khỏi nguồn cấp của bạn ngay lập tức',
            '• Họ sẽ không thể xem hồ sơ hoặc tương tác với bạn',
            '• Hành động chặn sẽ tự động thông báo cho đội ngũ phát triển về nội dung không phù hợp',
            '• Chúng tôi sẽ xem xét tài khoản bị chặn để xác định vi phạm',
          ],
        ),
        _buildSection(
          'Cam kết xử lý trong 24 giờ',
          [
            'Trove cam kết:',
            '• Xem xét tất cả báo cáo trong vòng 24 giờ',
            '• Xóa nội dung vi phạm ngay khi xác nhận',
            '• Đình chỉ hoặc cấm vĩnh viễn người dùng vi phạm',
            '• Thông báo cho người báo cáo về hành động đã thực hiện',
            '',
            'Đối với vi phạm nghiêm trọng (bạo lực, lạm dụng trẻ em, v.v.), chúng tôi sẽ hành động ngay lập tức và có thể báo cáo cho cơ quan chức năng.',
          ],
        ),
        _buildSection(
          'Hậu quả vi phạm',
          [
            'Vi phạm lần đầu: Cảnh báo và xóa nội dung',
            'Vi phạm lần hai: Đình chỉ tài khoản tạm thời (7-30 ngày)',
            'Vi phạm lần ba hoặc vi phạm nghiêm trọng: Cấm vĩnh viễn',
            '',
            'Chúng tôi có quyền cấm vĩnh viễn ngay lập tức đối với các vi phạm nghiêm trọng mà không có cảnh báo trước.',
          ],
        ),
        _buildSection(
          'Quyền và trách nhiệm của bạn',
          [
            'Bằng cách sử dụng Trove, bạn đồng ý:',
            '• Tuân thủ tất cả các điều khoản và chính sách',
            '• Đăng nội dung hợp pháp và phù hợp',
            '• Tôn trọng người dùng khác',
            '• Báo cáo nội dung vi phạm khi phát hiện',
            '• Chịu trách nhiệm về nội dung bạn đăng tải',
            '',
            'Bạn có quyền:',
            '• Báo cáo và chặn người dùng hoặc nội dung',
            '• Xóa nội dung của riêng bạn bất kỳ lúc nào',
            '• Khiếu nại nếu bạn cho rằng hành động kiểm duyệt là không công bằng',
          ],
        ),
        _buildSection(
          'Liên hệ',
          [
            'Nếu bạn có câu hỏi về các điều khoản này hoặc cần báo cáo vấn đề khẩn cấp:',
            'Email: support@trove.app',
            '',
            'Cảm ơn bạn đã giúp chúng tôi duy trì một cộng đồng an toàn và tích cực!',
          ],
        ),
        const SizedBox(height: 20),
        Text(
          'Cập nhật lần cuối: ${DateTime.now().year}-01-01',
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
          'Content Policy',
          [
            'Trove is committed to maintaining a safe and positive community for all users.',
            '',
            'We have ZERO TOLERANCE for the following content or behavior:',
            '• Pornographic, violent, or shocking content',
            '• Hate speech, discrimination, or harassment',
            '• Spam, scams, or misinformation',
            '• Intellectual property violations',
            '• Illegal content or encouragement of illegal activities',
            '• Other people\'s personal information without consent',
          ],
        ),
        _buildSection(
          'Filtering Objectionable Content',
          [
            'Trove employs a combination of automated technology and manual moderation to:',
            '• Detect and remove violating content',
            '• Filter inappropriate language and imagery',
            '• Monitor suspicious activity',
            '• Protect users from harmful content',
          ],
        ),
        _buildSection(
          'Content Reporting Mechanism',
          [
            'Every post and comment has a "Report" button allowing you to:',
            '• Report inappropriate or violating content',
            '• Select specific reason for reporting',
            '• Provide additional information if needed',
            '',
            'All reports are sent directly to our moderation team.',
          ],
        ),
        _buildSection(
          'Blocking Users',
          [
            'You have the right to block any user:',
            '• Blocked user\'s content will be removed from your feed instantly',
            '• They will not be able to view your profile or interact with you',
            '• Blocking action automatically notifies our development team of inappropriate content',
            '• We will review the blocked account to determine violations',
          ],
        ),
        _buildSection(
          '24-Hour Action Commitment',
          [
            'Trove commits to:',
            '• Review all reports within 24 hours',
            '• Remove violating content immediately upon confirmation',
            '• Suspend or permanently ban violating users',
            '• Notify reporters of action taken',
            '',
            'For severe violations (violence, child abuse, etc.), we will act immediately and may report to authorities.',
          ],
        ),
        _buildSection(
          'Violation Consequences',
          [
            'First violation: Warning and content removal',
            'Second violation: Temporary account suspension (7-30 days)',
            'Third violation or severe violation: Permanent ban',
            '',
            'We reserve the right to permanently ban immediately for severe violations without prior warning.',
          ],
        ),
        _buildSection(
          'Your Rights and Responsibilities',
          [
            'By using Trove, you agree to:',
            '• Comply with all terms and policies',
            '• Post legal and appropriate content',
            '• Respect other users',
            '• Report violations when discovered',
            '• Be responsible for content you post',
            '',
            'You have the right to:',
            '• Report and block users or content',
            '• Delete your own content at any time',
            '• Appeal if you believe moderation action was unfair',
          ],
        ),
        _buildSection(
          'Contact',
          [
            'If you have questions about these terms or need to report an urgent issue:',
            'Email: support@trove.app',
            '',
            'Thank you for helping us maintain a safe and positive community!',
          ],
        ),
        const SizedBox(height: 20),
        Text(
          'Last updated: ${DateTime.now().year}-01-01',
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

// Helper function to show EULA bottom sheet
Future<bool?> showEulaBottomSheet(BuildContext context) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    isDismissible: false,
    enableDrag: false,
    builder: (context) => const EulaBottomSheet(),
  );
}
