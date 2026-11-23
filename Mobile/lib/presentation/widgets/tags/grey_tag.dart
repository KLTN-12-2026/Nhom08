import 'package:flutter/material.dart';
import '../../../core/config/themes/app_colors.dart';
import 'text_tag.dart';

class GreyTag extends StatelessWidget {
  final String text;
  final VoidCallback? onTap;

  const GreyTag({
    Key? key,
    required this.text,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextTag(
      text: text,
      backgroundColor: backgroundSecondary,
      textColor: const Color(0xFF0F0F0F),
      fontWeight: FontWeight.w600,
      fontSize: 12,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      borderRadius: 16,
      onTap: onTap,
    );
  }
}
