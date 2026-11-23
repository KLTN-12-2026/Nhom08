import 'package:flutter/material.dart';
import 'package:trove/core/config/themes/app_colors.dart' as AppColors;
import '../../../core/config/themes/app_colors.dart';

class YellowTagMini extends StatelessWidget {
  final String text;

  const YellowTagMini({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.primaryColor.withOpacity(0.7),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: Colors.black,
          letterSpacing: 0.1,
        ),
      ),
    );
  }
}
