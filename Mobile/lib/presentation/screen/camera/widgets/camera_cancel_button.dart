import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:trove/core/config/themes/app_colors.dart';
import 'package:trove/presentation/bloc/camera/camera_bloc.dart';

class CameraCancelButton extends StatelessWidget {
  const CameraCancelButton({super.key});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.read<LocketCameraBloc>().add(
            const LocketCameraCanceled(),
          ),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.black),
        child: const Icon(
          Icons.close,
          color: primaryColor,
          size: 28,
        ),
      ),
    );
  }
}






