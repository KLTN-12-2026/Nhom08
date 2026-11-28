import 'package:flutter/material.dart';
import 'package:trove/presentation/bloc/camera/camera_bloc.dart';
import 'camera_shutter_button.dart';
import 'camera_cancel_button.dart';
import 'camera_confirm_button.dart';

class CameraButtonsRow extends StatelessWidget {
  final LocketCameraState state;
  final VoidCallback onConfirm;

  const CameraButtonsRow({
    super.key,
    required this.state,
    required this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    final shots = state.shots;
    final canConfirm = shots.isNotEmpty;
    final hasAny = shots.isNotEmpty;
    final isCapturing = state is LocketCameraCapturing;
    final isLoading = state is LocketCameraLoading;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Left side: Cancel button (only when has shots) or Spacer
        if (hasAny) ...[
          const CameraCancelButton(),
          const SizedBox(width: 24),
        ] else
          const Spacer(),
        // Center: Shutter button (always in center)
        CameraShutterButton(isDisabled: isCapturing || isLoading),
        // Right side: Confirm button or Spacer
        if (hasAny) ...[
          const SizedBox(width: 24),
          CameraConfirmButton(
            enabled: canConfirm,
            shots: shots,
            onConfirm: onConfirm,
          ),
        ] else
          const Spacer(),
      ],
    );
  }
}

