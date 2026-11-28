import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:trove/presentation/bloc/camera/camera_bloc.dart';

class CameraShutterButton extends StatelessWidget {
  final bool isDisabled;

  const CameraShutterButton({
    super.key,
    required this.isDisabled,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isDisabled
          ? null
          : () => context.read<LocketCameraBloc>().add(
                const LocketCameraCaptured(),
              ),
      child: Container(
        width: 72,
        height: 72,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.grey.shade300,
          border: Border.all(color: Colors.grey.shade500, width: 3),
        ),
        child: isDisabled
            ? Opacity(
                opacity: 0.5,
                child: Container(
                  margin: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.grey.shade100,
                  ),
                ),
              )
            : Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey.shade100,
                ),
              ),
      ),
    );
  }
}






