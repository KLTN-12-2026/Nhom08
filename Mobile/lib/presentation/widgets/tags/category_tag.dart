import 'package:flutter/material.dart';
import '../../../core/config/themes/app_colors.dart';
import 'text_tag.dart';

class CategoryTag extends StatelessWidget {
  final String text;
  final bool isSelected;
  final VoidCallback? onTap;

  const CategoryTag({
    Key? key,
    required this.text,
    this.isSelected = false,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextTag(
      text: text,
      backgroundColor: isSelected ? primaryColor : backgroundSecondary,
      textColor: const Color(0xFF0F0F0F),
      fontWeight: FontWeight.w600,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      borderRadius: 12,
      onTap: onTap,
      isSelected: isSelected,
      isCategory: true,
    );
  }
}
