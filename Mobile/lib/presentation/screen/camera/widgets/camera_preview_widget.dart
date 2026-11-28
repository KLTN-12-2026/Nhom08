import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';

class CameraPreviewWidget extends StatelessWidget {
  final bool hasController;
  final CameraController? controller;
  final XFile? latestShot;

  const CameraPreviewWidget({
    super.key,
    required this.hasController,
    this.controller,
    this.latestShot,
  });

  @override
  Widget build(BuildContext context) {
    if (!hasController || controller == null) {
      return _buildShotPreview(latestShot, 'Trước');
    }

    final previewSize = controller!.value.previewSize;
    final width = previewSize?.height ?? 1080;
    final height = previewSize?.width ?? 1920;

    return FittedBox(
      fit: BoxFit.cover,
      child: SizedBox(
        width: width,
        height: height,
        child: CameraPreview(controller!),
      ),
    );
  }

  Widget _buildShotPreview(XFile? file, String label) {
    if (file == null) {
      return Container(
        alignment: Alignment.center,
        color: Colors.white,
        child: Text('Chưa chụp ($label)',
            style: const TextStyle(color: Colors.black54)),
      );
    }
    return FittedBox(
      fit: BoxFit.cover,
      child: SizedBox(
        width: 1080,
        height: 1920,
        child: Image.file(File(file.path), fit: BoxFit.cover),
      ),
    );
  }
}

