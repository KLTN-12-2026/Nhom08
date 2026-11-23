import 'package:flutter/material.dart';

import '../../../core/config/themes/app_colors.dart';

class GradientPrimaryButton extends StatelessWidget {
  final Widget child;
  final VoidCallback onPressed;
  final double? height;
  final TextStyle? textStyle;
  final List<Color> gradientColors;

  const GradientPrimaryButton({
    Key? key,
    required this.child,
    required this.onPressed,
    this.height,
    this.textStyle,
    this.gradientColors = const [ lightPink4 ,darkPink], // Gradient mặc định
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent, // Ẩn bóng để nhìn đẹp hơn
          minimumSize: Size(double.infinity, height ?? 40),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        child: child,
      ),
    );
  }
}
