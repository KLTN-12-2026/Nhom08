import 'package:flutter/material.dart';
import '../../../core/config/themes/app_colors.dart';

class PrimaryInput extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final int maxLines;
  final Widget? suffixIcon;
  final String? Function(String?)? validator;
  final EdgeInsetsGeometry? contentPadding;
  final bool enabled;
  final TextInputType? keyboardType;
  final void Function(String)? onChanged;
  final FocusNode? focusNode;
  final TextInputAction? textInputAction;
  final void Function(String)? onFieldSubmitted;
  final bool obscureText;

  const PrimaryInput({
    Key? key,
    required this.controller,
    required this.hintText,
    this.maxLines = 1,
    this.suffixIcon,
    this.validator,
    this.contentPadding,
    this.enabled = true,
    this.keyboardType,
    this.onChanged,
    this.focusNode,
    this.textInputAction,
    this.onFieldSubmitted,
    this.obscureText = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      // Nếu là password thì luôn 1 dòng và ẩn ký tự
      maxLines: obscureText ? 1 : maxLines,
      obscureText: obscureText,
      enabled: enabled,
      keyboardType: keyboardType,
      onChanged: onChanged,
      focusNode: focusNode,
      textInputAction: textInputAction,
      onFieldSubmitted: onFieldSubmitted,
      style: TextStyle(color: textColor, fontSize: 16),
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: TextStyle(color: textSecondary),
        // Only show borders on focus and error states
        border: InputBorder.none,
        enabledBorder: InputBorder.none,
        disabledBorder: InputBorder.none,
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: Colors.black, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: Colors.red),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
        filled: true,
        fillColor: enabled
            ? backgroundSecondary
            : backgroundSecondary.withOpacity(0.5),
        contentPadding: contentPadding ??
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        suffixIcon: suffixIcon,
      ),
      validator: validator,
    );
  }
}
