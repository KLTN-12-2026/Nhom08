import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class AppSnack {
  static void _show(
    BuildContext context, {
    required String message,
    required Color backgroundColor,
    required dynamic icon,
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(12),
        backgroundColor: backgroundColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: Row(
          children: [
            icon is FaIconData
                ? FaIcon(icon, color: Colors.white, size: 22)
                : Icon(icon as IconData, color: Colors.white, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white, fontSize: 15),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // -------------------------
  // PUBLIC FUNCTIONS
  // -------------------------
  static void showSuccess(String message, BuildContext context) {
    _show(
      context,
      message: message,
      backgroundColor: Colors.green,
      icon: Icons.check_circle,
    );
  }

  static void showError(String message, BuildContext context) {
    _show(
      context,
      message: message,
      backgroundColor: Colors.red,
      icon: Icons.close,
    );
  }

  static void showWarning(String message, BuildContext context) {
    _show(
      context,
      message: message,
      backgroundColor: Colors.orange,
      icon: Icons.warning_amber_rounded,
    );
  }

  static void showCustom(
    BuildContext context, {
    required String message,
    required Color backgroundColor,
    required dynamic icon,
  }) {
    _show(
      context,
      message: message,
      backgroundColor: backgroundColor,
      icon: icon,
    );
  }
}

extension AppSnackContextExt on BuildContext {
  void success(String message) => AppSnack.showSuccess(message, this);

  void error(String message) => AppSnack.showError(message, this);

  void warning(String message) => AppSnack.showWarning(message, this);
}
