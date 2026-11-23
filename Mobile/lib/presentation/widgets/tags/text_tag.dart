import 'package:flutter/material.dart';
import '../../../core/config/themes/app_colors.dart';

class TextTag extends StatelessWidget {
  final String text;
  final Color? backgroundColor;
  final Color? textColor;
  final double? fontSize;
  final FontWeight? fontWeight;
  final EdgeInsets? padding;
  final double? borderRadius;
  final VoidCallback? onTap;
  final bool isSelected;
  final bool _isCategory;

  const TextTag({
    Key? key,
    required this.text,
    this.backgroundColor,
    this.textColor,
    this.fontSize,
    this.fontWeight,
    this.padding,
    this.borderRadius,
    this.onTap,
    this.isSelected = false,
    bool isCategory = false,
  })  : _isCategory = isCategory,
        super(key: key);

  @override
  Widget build(BuildContext context) {
    final effectiveBackgroundColor = isSelected
        ? (backgroundColor ?? primaryColor)
        : (backgroundColor ?? backgroundSecondary);
    final effectiveTextColor =
        textColor ?? (isSelected ? white : const Color(0xFF0F0F0F));
    final effectiveFontSize = fontSize ?? 12;
    final effectiveFontWeight = fontWeight ?? FontWeight.w600;
    final effectivePadding =
        padding ?? const EdgeInsets.symmetric(horizontal: 8, vertical: 2);
    final effectiveBorderRadius = borderRadius ?? 8;

    Widget tagWidget = Container(
      padding: effectivePadding,
      decoration: BoxDecoration(
        color: effectiveBackgroundColor,
        borderRadius: BorderRadius.circular(effectiveBorderRadius),
        border: (!_isCategory || isSelected)
            ? null
            : Border.all(color: Colors.black, width: 1),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: effectiveTextColor,
          fontSize: effectiveFontSize,
          fontWeight: effectiveFontWeight,
          height: 1.0, // tighten line height to remove extra bottom space
        ),
        strutStyle: const StrutStyle(
          height: 1.0,
          leading: 0.0,
          forceStrutHeight: true,
        ),
        textHeightBehavior: const TextHeightBehavior(
          applyHeightToFirstAscent: false,
          applyHeightToLastDescent: false,
        ),
      ),
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: tagWidget,
      );
    }

    return tagWidget;
  }
}
