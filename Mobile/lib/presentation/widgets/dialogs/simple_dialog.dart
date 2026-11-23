import 'package:flutter/material.dart';
import 'package:trove/core/config/themes/app_colors.dart';
import 'package:trove/presentation/widgets/dialogs/dialog_helper.dart';

class SimpleDialog extends StatelessWidget {
  final String title;
  final String message;
  final String buttonText;
  final VoidCallback? onButtonPressed;
  final Color? buttonColor;
  final Color? buttonTextColor;

  const SimpleDialog({
    super.key,
    required this.title,
    required this.message,
    required this.buttonText,
    this.onButtonPressed,
    this.buttonColor,
    this.buttonTextColor,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Icon
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(40),
                ),
                child: Icon(
                  Icons.info_outline,
                  size: 40,
                  color: primaryColor,
                ),
              ),
              const SizedBox(height: 24),

              // Title
              Text(
                title,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: textColor,
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 16),

              // Message
              Text(
                message,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: textSecondary,
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 32),

              // Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed:
                      onButtonPressed ?? () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: buttonColor ?? primaryColor,
                    foregroundColor: buttonTextColor ?? white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: Text(
                    buttonText,
                    style: const TextStyle(
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
    );
  }
}

// Helper function to show the simple dialog
void showSimpleDialog({
  required BuildContext context,
  required String title,
  required String message,
  required String buttonText,
  VoidCallback? onButtonPressed,
  Color? buttonColor,
  Color? buttonTextColor,
}) {
  context.showAutoDismissDialog(
    barrierDismissible: false,
    builder: (context) => SimpleDialog(
      title: title,
      message: message,
      buttonText: buttonText,
      onButtonPressed: onButtonPressed,
      buttonColor: buttonColor,
      buttonTextColor: buttonTextColor,
    ),
  );
}
