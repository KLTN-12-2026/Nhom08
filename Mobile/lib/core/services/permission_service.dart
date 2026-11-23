import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:trove/presentation/widgets/dialogs/permission_dialog.dart';

class PermissionService {
  // Singleton pattern
  static final PermissionService _instance = PermissionService._internal();
  factory PermissionService() => _instance;
  PermissionService._internal();

  /// Requests a specific permission with a rationale dialog if needed.
  Future<bool> requestPermission({
    required BuildContext context,
    required Permission permission,
    required IconData icon,
    required String title,
    required String description,
  }) async {
    // 1. Check current status
    PermissionStatus status = await permission.status;

    if (status.isGranted) {
      return true;
    }

    // 2. If not granted, show rationale dialog
    if (!status.isGranted) {
      if (!context.mounted) return false;

      bool userAccepted = await showDialog<bool>(
            context: context,
            builder: (ctx) => PermissionDialog(
              icon: icon,
              title: title,
              description: description,
              actionText: 'Continue',
              onAction: () => Navigator.of(ctx).pop(true),
              onCancel: () => Navigator.of(ctx).pop(false),
            ),
          ) ??
          false;

      if (!userAccepted) {
        return false;
      }
    }

    // 3. Request permission
    PermissionStatus newStatus = await permission.request();

    if (newStatus.isGranted) {
      return true;
    }

    // 4. Handle Permanently Denied
    if (newStatus.isPermanentlyDenied) {
      if (!context.mounted) return false;

      await showDialog<bool>(
        context: context,
        builder: (ctx) => PermissionDialog(
          icon: Icons.settings,
          title: 'Permission Required',
          description:
              '$title is currently disabled. Please enable it in app settings.',
          actionText: 'Open Settings',
          onAction: () {
            openAppSettings();
            Navigator.of(ctx).pop(true);
          },
          onCancel: () => Navigator.of(ctx).pop(false),
        ),
      );
      return false;
    }

    return false;
  }

  // Convenience methods

  Future<bool> requestCamera(BuildContext context) async {
    return requestPermission(
      context: context,
      permission: Permission.camera,
      icon: Icons.camera_alt,
      title: 'Camera Access',
      description:
          'This app needs camera access to take photos of your receipts or locations.',
    );
  }

  Future<bool> requestLocation(BuildContext context) async {
    return requestPermission(
      context: context,
      permission: Permission.location,
      icon: Icons.location_on,
      title: 'Location Access',
      description:
          'We need your location to show you nearby places and directions.',
    );
  }

  Future<bool> requestPhotos(BuildContext context) async {
    // Simple permission check (adapt for Android 13+ if needed in specific implementations)
    return requestPermission(
      context: context,
      permission: Permission.photos,
      icon: Icons.photo_library,
      title: 'Photo Library',
      description: 'Access to photo library is needed to upload images.',
    );
  }
}
