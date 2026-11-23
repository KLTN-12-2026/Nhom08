import 'package:flutter/material.dart';
import '../../../core/config/themes/app_colors.dart';

class CircleLogoWidget extends StatelessWidget {
  final String imageUrl;
  final double radius;

  const CircleLogoWidget({
    Key? key,
    required this.imageUrl,
    this.radius = 40.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: radius * 2,
      height: radius * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: backgroundSecondary,
      ),
      child: ClipOval(
        child: Image.network(
          imageUrl,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => Container(
            color: borderPrimary,
            child: const Icon(
              Icons.broken_image,
              color: textSecondary,
            ),
          ),
        ),
      ),
    );
  }
}
