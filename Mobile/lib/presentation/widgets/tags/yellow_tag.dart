import 'package:flutter/material.dart';
import 'text_tag.dart';
import '../../../core/config/themes/app_colors.dart';

class YellowSelectedTag extends StatelessWidget {
  final String text;
  final bool isSelected;
  final VoidCallback? onTap;

  const YellowSelectedTag({
    Key? key,
    required this.text,
    this.isSelected = false,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextTag(
      text: text,
      backgroundColor: isSelected ? primaryColor : Colors.grey.shade800,
      textColor: isSelected ? Colors.black : Colors.grey.shade400,
      fontWeight: FontWeight.w700,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      borderRadius: 12,
      onTap: onTap,
      isSelected: isSelected,
      isCategory: false,
    );
  }
}
