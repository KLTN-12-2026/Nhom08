import 'package:flutter/material.dart';
import '../../../core/config/themes/app_colors.dart';
import 'text_tag.dart';

class BlackTag extends StatelessWidget {
  final String text;
  final VoidCallback? onTap;

  const BlackTag({
    Key? key,
    required this.text,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextTag(
      text: text,
      backgroundColor: primaryBlack,
      textColor: textSecondary,
      fontWeight: FontWeight.w700,
      fontSize: 12,
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
      borderRadius: 16,
      onTap: onTap,
    );
  }
}
