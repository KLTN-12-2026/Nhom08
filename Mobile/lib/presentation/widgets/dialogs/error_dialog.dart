import 'package:flutter/material.dart';
import 'package:trove/core/config/themes/app_colors.dart';
import 'custom_dialog.dart';

class ErrorDialog extends StatelessWidget {
  final String message;
  final String buttonText;
  final VoidCallback? onButtonPressed;
  final String? gifPath;
  final EdgeInsetsGeometry? padding;

  const ErrorDialog({
    super.key,
    required this.message,
    this.buttonText = 'OK',
    this.onButtonPressed,
    this.gifPath = 'assets/gifs/dog_spin.gif',
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return CustomDialog(
      image: gifPath,
      heightImage: 150,
      content: message,
      padding: padding,
      backgroundColor: primaryColor,
      actions: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: onButtonPressed ?? () => Navigator.of(context).pop(),
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryBlack,
              foregroundColor: primaryBlack,
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
                color: primaryColor,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// Helper function to show the error dialog
void showErrorDialog({
  required BuildContext context,
  required String message,
  String buttonText = 'OK',
  VoidCallback? onButtonPressed,
  String? gifPath,
  bool barrierDismissible = false,
}) {
  showDialog(
    context: context,
    barrierDismissible: barrierDismissible,
    builder: (context) => ErrorDialog(
      message: message,
      buttonText: buttonText,
      onButtonPressed: onButtonPressed,
      gifPath: gifPath ?? 'assets/gifs/dog_spin.gif',
    ),
  );
}
