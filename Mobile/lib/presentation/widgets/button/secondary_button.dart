import 'package:flutter/material.dart';
import '../../../core/config/themes/app_colors.dart';

class SecondaryButton extends StatelessWidget {
  final Widget child;
  final VoidCallback onPressed;
  final double? height;
  final double borderRadius;
  final Color color; // Màu nền cho button
  final Color textColor; // Màu chữ cho button

  const SecondaryButton({
    Key? key,
    required this.child,
    required this.onPressed,
    this.height,
    this.borderRadius = 8,
    this.color = darkPink, // Màu nền mặc định
    this.textColor = white, // Màu chữ mặc định
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: double.infinity,
        height: height ?? 40,
        decoration: BoxDecoration(
          color: color, // Áp dụng màu nền
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        alignment: Alignment.center,
        child: DefaultTextStyle(
          style: TextStyle(color: textColor), // Áp dụng màu chữ
          child: child,
        ),
      ),
    );
  }
}
