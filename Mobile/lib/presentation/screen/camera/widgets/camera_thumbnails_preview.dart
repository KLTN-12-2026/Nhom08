import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:trove/presentation/bloc/camera/camera_bloc.dart';

class CameraThumbnailsPreview extends StatelessWidget {
  final List<XFile> shots;

  const CameraThumbnailsPreview({
    super.key,
    required this.shots,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: 110,
      left: 16,
      right: 16,
      child: SizedBox(
        height: 80,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemBuilder: (context, index) {
            final shot = shots[index];
            final isLatest = index == shots.length - 1;
            return Stack(
              children: [
                Container(
                  width: 72,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isLatest ? Colors.white : Colors.white54,
                      width: isLatest ? 3 : 1.5,
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.file(
                      File(shot.path),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                Positioned(
                  top: 4,
                  right: 4,
                  child: GestureDetector(
                    onTap: () => context.read<LocketCameraBloc>().add(
                          LocketCameraShotRemoved(index),
                        ),
                    child: Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.6),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.close,
                        size: 14,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemCount: shots.length,
        ),
      ),
    );
  }
}






