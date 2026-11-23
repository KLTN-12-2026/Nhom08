import 'package:flutter/material.dart';
import 'package:trove/core/config/themes/app_colors.dart';
import '../button/primary_button.dart';
import 'dialog_helper.dart';

class ReportLoadingDialog extends StatelessWidget {
  final String title;
  final String description;
  final VoidCallback? onCancel;
  final VoidCallback? onAllow;

  const ReportLoadingDialog({
    super.key,
    required this.title,
    required this.description,
    this.onCancel,
    this.onAllow,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Container(
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: primaryColor,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Icon section with decorative elements
              Stack(
                alignment: Alignment.center,
                children: [
                  // Outer circle (blue)
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: bffBlue,
                      shape: BoxShape.circle,
                    ),
                  ),
                  // Middle circle (yellow)
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: warningColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  // Inner icon (smiling face or flag)
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: bffBlue,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.flag,
                      color: white,
                      size: 28,
                    ),
                  ),
                  // Decorative dots
                  ...List.generate(8, (index) {
                    final radius = 70.0;
                    final positions = [
                      [60 + radius, 60], // right
                      [60, 60 - radius], // top
                      [60 - radius, 60], // left
                      [60, 60 + radius], // bottom
                      [60 + radius * 0.7, 60 - radius * 0.7], // top-right
                      [60 - radius * 0.7, 60 - radius * 0.7], // top-left
                      [60 - radius * 0.7, 60 + radius * 0.7], // bottom-left
                      [60 + radius * 0.7, 60 + radius * 0.7], // bottom-right
                    ];
                    return Positioned(
                      left: positions[index][0] - 4,
                      top: positions[index][1] - 4,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: index % 2 == 0 ? warningColor : sky,
                          shape: BoxShape.circle,
                        ),
                      ),
                    );
                  }),
                ],
              ),
              const SizedBox(height: 32),

              // Title
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: textColor,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 16),

              // Description
              Text(
                description,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: textSecondary,
                  fontSize: 15,
                  fontWeight: FontWeight.w400,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 32),

              // Buttons
              Row(
                children: [
                  // Cancel button
                  Expanded(
                    child: ElevatedButton(
                      onPressed: onCancel ?? () => Navigator.of(context).pop(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: backgroundSecondary,
                        foregroundColor: textSecondary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: const Text(
                        'Cancel',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Allow button (PrimaryButton)
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: PrimaryButton(
                        onPressed: onAllow ?? () => Navigator.of(context).pop(),
                        color: warningColor,
                        textColor: white,
                        child: const Text(
                          'Allow',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Helper function to show the report loading dialog
void showReportLoadingDialog({
  required BuildContext context,
  required String title,
  required String description,
  VoidCallback? onCancel,
  VoidCallback? onAllow,
  bool barrierDismissible = false,
}) {
  context.showAutoDismissDialog(
    barrierDismissible: barrierDismissible,
    builder: (context) => ReportLoadingDialog(
      title: title,
      description: description,
      onCancel: onCancel,
      onAllow: onAllow,
    ),
  );
}

class ReportDialog extends StatefulWidget {
  final String placeName;
  final Function(String reason, String? additionalInfo)? onSubmit;

  const ReportDialog({
    super.key,
    required this.placeName,
    this.onSubmit,
  });

  @override
  State<ReportDialog> createState() => _ReportDialogState();
}

class _ReportDialogState extends State<ReportDialog> {
  String? _selectedReason;
  final TextEditingController _additionalInfoController =
      TextEditingController();
  final List<String> _reportReasons = [
    'Thông tin sai',
    'Nội dung không phù hợp',
    'Spam hoặc lừa đảo',
  ];

  @override
  void dispose() {
    _additionalInfoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Material(
        color: Colors.transparent,
        child: Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.8,
          ),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: white,
            borderRadius: BorderRadius.circular(24),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                const Text(
                  'Báo cáo địa điểm',
                  style: TextStyle(
                    color: textColor,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Bạn muốn báo cáo "${widget.placeName}" vì lý do gì?',
                  style: const TextStyle(
                    color: textSecondary,
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(height: 24),

                // Report reason options
                ..._reportReasons.map((reason) {
                  final isSelected = _selectedReason == reason;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _selectedReason = reason;
                        });
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? primaryColor.withOpacity(0.1)
                              : backgroundSecondary,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color:
                                isSelected ? primaryColor : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 20,
                              height: 20,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color:
                                      isSelected ? primaryColor : textSecondary,
                                  width: 2,
                                ),
                                color: isSelected
                                    ? primaryColor
                                    : Colors.transparent,
                              ),
                              child: isSelected
                                  ? const Icon(
                                      Icons.check,
                                      size: 14,
                                      color: white,
                                    )
                                  : null,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                reason,
                                style: TextStyle(
                                  color: isSelected ? textColor : textSecondary,
                                  fontSize: 15,
                                  fontWeight: isSelected
                                      ? FontWeight.w600
                                      : FontWeight.w400,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 24),

                // Additional info text field
                const Text(
                  'Thông tin bổ sung (tùy chọn)',
                  style: TextStyle(
                    color: textColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _additionalInfoController,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Nhập thêm thông tin chi tiết...',
                    hintStyle: const TextStyle(
                      color: textSecondary,
                      fontSize: 14,
                    ),
                    filled: true,
                    fillColor: backgroundSecondary,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.all(16),
                  ),
                  style: const TextStyle(
                    color: textColor,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 24),

                // Submit button
                SizedBox(
                  width: double.infinity,
                  child: PrimaryButton(
                    onPressed: _selectedReason == null
                        ? null
                        : () {
                            if (widget.onSubmit != null) {
                              widget.onSubmit!(
                                _selectedReason!,
                                _additionalInfoController.text.trim().isEmpty
                                    ? null
                                    : _additionalInfoController.text.trim(),
                              );
                            }
                            Navigator.of(context).pop();
                          },
                    color: primaryColor,
                    textColor: primaryBlack,
                    child: const Text(
                      'Gửi báo cáo',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// Helper function to show the report dialog
void showReportDialog({
  required BuildContext context,
  required String placeName,
  Function(String reason, String? additionalInfo)? onSubmit,
  bool barrierDismissible = true,
}) {
  context.showAutoDismissDialog(
    barrierDismissible: barrierDismissible,
    builder: (context) => ReportDialog(
      placeName: placeName,
      onSubmit: onSubmit,
    ),
  );
}
