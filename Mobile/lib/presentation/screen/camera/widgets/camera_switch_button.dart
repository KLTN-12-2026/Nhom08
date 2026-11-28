import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:trove/presentation/bloc/camera/camera_bloc.dart';

class CameraSwitchButton extends StatelessWidget {
  final bool isLoading;
  final bool isCapturing;

  const CameraSwitchButton({
    super.key,
    required this.isLoading,
    required this.isCapturing,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = isLoading || isCapturing;

    return Positioned(
      top: 32,
      right: 32,
      child: AbsorbPointer(
        absorbing: isDisabled,
        child: GestureDetector(
          onTap: () => context.read<LocketCameraBloc>().add(
                const LocketCameraSwitched(),
              ),
          child: AnimatedOpacity(
            duration: const Duration(milliseconds: 200),
            opacity: isDisabled ? 0.2 : 0.6,
            child: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.black.withValues(alpha: 0.25),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.6),
                  width: 2,
                ),
              ),
              child: Icon(
                Icons.cameraswitch,
                color: Colors.white.withValues(alpha: 0.9),
                size: 24,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
