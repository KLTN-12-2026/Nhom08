import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:trove/core/config/themes/app_colors.dart';

class CameraConfirmButton extends StatelessWidget {
  final bool enabled;
  final List<XFile> shots;
  final VoidCallback onConfirm;

  const CameraConfirmButton({
    super.key,
    required this.enabled,
    required this.shots,
    required this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: enabled ? onConfirm : null,
      child: Opacity(
        opacity: enabled ? 1 : 0.4,
        child: Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: primaryColor,
          ),
          child: const Icon(
            Icons.check,
            color: Colors.black,
            size: 28,
          ),
        ),
      ),
    );
  }
}






