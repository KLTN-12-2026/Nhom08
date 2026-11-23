import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:trove/core/config/router/app_routes.dart';
import 'package:trove/core/config/themes/app_colors.dart';
import 'custom_dialog.dart';

class LoginRequiredDialog extends StatelessWidget {
  final String message;
  final String buttonText;
  final VoidCallback? onButtonPressed;
  final String? gifPath;
  final EdgeInsetsGeometry? padding;

  const LoginRequiredDialog({
    super.key,
    this.message = 'Bạn cần đăng nhập để sử dụng tính năng này',
    this.buttonText = 'Đăng nhập',
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
            onPressed: onButtonPressed ??
                () {
                  Navigator.of(context).pop();
                  context.push(AppRoutes.auth);
                },
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

/// Shows a dialog prompting users to login.
void showLoginRequiredDialog(
  BuildContext context, {
  String message = 'Bạn cần đăng nhập để sử dụng tính năng này',
  String buttonText = 'Đăng nhập',
  VoidCallback? onButtonPressed,
  String? gifPath,
  bool barrierDismissible = true,
}) {
  showDialog(
    context: context,
    barrierDismissible: barrierDismissible,
    builder: (context) => LoginRequiredDialog(
      message: message,
      buttonText: buttonText,
      onButtonPressed: onButtonPressed,
      gifPath: gifPath ?? 'assets/gifs/dog_spin.gif',
    ),
  );
}
