import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:trove/presentation/bloc/camera/camera_bloc.dart';
import 'camera_preview_widget.dart';
import 'camera_skeleton_loading.dart';
import 'camera_switch_button.dart';
import 'camera_thumbnails_preview.dart';

class CameraViewWidget extends StatelessWidget {
  final LocketCameraState state;

  const CameraViewWidget({
    super.key,
    required this.state,
  });

  @override
  Widget build(BuildContext context) {
    CameraController? controller;
    if (state is LocketCameraReady) {
      controller = (state as LocketCameraReady).controller;
    } else if (state is LocketCameraCapturing) {
      controller = (state as LocketCameraCapturing).controller;
    }

    final hasController = controller != null && controller.value.isInitialized;
    final shots = state.shots;
    final latestShot = shots.isNotEmpty ? shots.last : null;
    final isLoading = state is LocketCameraLoading;
    final isCapturing = state is LocketCameraCapturing;

    return SafeArea(
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Background outside the frame
          const ColoredBox(color: Colors.white),
          // Square preview positioned near the top

          // Main content centered: Text + Camera
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    // Border container
                    Container(
                      margin: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(28),
                        border: Border.all(
                          color: Colors.black.withValues(alpha: 0.15),
                          width: 3,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: AspectRatio(
                          aspectRatio: 1,
                          child: ColoredBox(
                            color: Colors.white, // backdrop inside frame
                            child: isLoading
                                ? const CameraSkeletonLoading()
                                : CameraPreviewWidget(
                                    hasController: hasController,
                                    controller: controller,
                                    latestShot: latestShot,
                                  ),
                          ),
                        ),
                      ),
                    ),
                    Positioned.fill(
                      child: IgnorePointer(
                        ignoring: true,
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: Colors.white, width: 6),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                // Add some bottom spacing to clear the shutter button if needed,
                // though Center widget usually handles it well.
                // The shutter button is in the parent screen, positioned at bottom.
              ],
            ),
          ),

          if (state is LocketCameraReady || state is LocketCameraCapturing)
            CameraSwitchButton(
              isLoading: isLoading,
              isCapturing: isCapturing,
            ),
          // Thumbnails preview
          if (shots.isNotEmpty) CameraThumbnailsPreview(shots: shots),
        ],
      ),
    );
  }
}
