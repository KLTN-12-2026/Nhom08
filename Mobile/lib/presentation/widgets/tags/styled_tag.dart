import 'package:flutter/material.dart';
import 'package:trove/core/config/themes/app_colors.dart' as AppColors;
import '../../../core/config/themes/app_colors.dart';

class StyledTag extends StatelessWidget {
  final String text;
  final Color? backgroundColor;
  final Color? textColor;

  const StyledTag({
    super.key,
    required this.text,
    this.backgroundColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: backgroundColor ?? Colors.grey.shade100,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: textColor ?? Colors.black,
        ),
      ),
    );
  }
}
