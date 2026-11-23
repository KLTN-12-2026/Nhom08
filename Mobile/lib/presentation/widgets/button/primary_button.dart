import 'package:flutter/material.dart';
import '../../../core/config/themes/app_colors.dart';

class PrimaryButton extends StatelessWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final double? height;
  final TextStyle? textStyle;
  final Color? color; // Màu nền tùy chọn
  final Color? textColor; // Màu chữ tùy chọn

  const PrimaryButton({
    Key? key,
    required this.child,
    required this.onPressed,
    this.height,
    this.textStyle,
    this.color,
    this.textColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color ?? primaryColor,
        // Màu nền mặc định hoặc màu truyền vào
        minimumSize: Size(0, height ?? 40),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: DefaultTextStyle(
        style: textStyle ??
            TextStyle(
              color: textColor ?? Colors.black,
              // Màu chữ mặc định hoặc màu truyền vào
              fontSize: 16,
            ),
        child: child, // Truyền Widget vào đây
      ),
    );
  }
}
