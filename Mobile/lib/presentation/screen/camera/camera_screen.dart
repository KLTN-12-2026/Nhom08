import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:trove/presentation/bloc/camera/camera_bloc.dart';
import 'package:trove/presentation/widgets/snackbar/app_snack.dart';
import 'package:trove/presentation/bloc/auth/auth_bloc.dart';
import 'package:trove/presentation/bloc/auth/auth_state.dart';
import 'package:go_router/go_router.dart';
import 'package:trove/core/config/router/app_routes.dart';
import 'package:trove/presentation/widgets/notification/nav_bar_visibility_notification.dart';
import 'widgets/camera_view_widget.dart';
import 'widgets/camera_buttons_row.dart';
import 'widgets/camera_skeleton_loading.dart';

class TroveCameraScreen extends StatefulWidget {
  const TroveCameraScreen({super.key});

  @override
  State<TroveCameraScreen> createState() => _TroveCameraScreenState();
}

class _TroveCameraScreenState extends State<TroveCameraScreen>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    // Ensure nav bar is visible when entering this screen
    WidgetsBinding.instance.addPostFrameCallback((_) {
      NavBarVisibilityNotification(true).dispatch(context);
    });

    context.read<LocketCameraBloc>().add(const LocketCameraInitialized());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    // Dispose camera trước khi dispose widget
    try {
      context.read<LocketCameraBloc>().add(const LocketCameraDisposed());
    } catch (e) {
      // Ignore errors during dispose
      print('⚠️ Error disposing camera in screen: $e');
    }
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Camera lifecycle is handled by the bloc itself
    // No need to manually dispose/initialize here
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<LocketCameraBloc, LocketCameraState>(
      listener: (context, state) {
        if (state is LocketCameraError) {
          context.error(state.message);
        }
      },
      child: BlocBuilder<LocketCameraBloc, LocketCameraState>(
        builder: (context, state) {
          return Stack(
            children: [
              // Single camera view with locket-like frame overlay
              Positioned.fill(
                child: CameraViewWidget(state: state),
              ),
              if (state is LocketCameraLoading) const CameraSkeletonLoading(),
              // Title text at the top
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Chụp lại',
                          textAlign: TextAlign.start,
                          style: GoogleFonts.outfit(
                            fontSize: 40,
                            fontWeight: FontWeight.w400,
                            color: Colors.black87,
                            height: 1.1,
                          ),
                        ),
                        Text(
                          'và đăng ngay',
                          textAlign: TextAlign.start,
                          style: GoogleFonts.outfit(
                            fontSize: 45,
                            fontWeight: FontWeight.w800,
                            color:
                                const Color(0xFFFFB700), // primary yellow color
                            height: 1.1,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              // Shutter button overlay
              Positioned(
                bottom: 24,
                left: 0,
                right: 0,
                child: CameraButtonsRow(
                  state: state,
                  onConfirm: () => _openPlaceForm(state.shots),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _openPlaceForm(List<XFile> shots) async {
    if (shots.isEmpty) return;

    try {
      // Chặn nếu chưa đăng nhập
      final canProceed = await _ensureLoggedIn();
      if (!canProceed) return;

      // Mở CreatePlaceScreen với danh sách ảnh đã chụp
      // Mở CreatePlaceScreen với danh sách ảnh đã chụp
      final result = await context.push<bool>(
        AppRoutes.placeCreate,
        extra: shots.map((shot) => File(shot.path)).toList(),
      );

      // Clear all shots if place was created successfully
      if (result == true && mounted) {
        context.read<LocketCameraBloc>().add(const LocketCameraCanceled());
      }
    } catch (e) {
      if (mounted) {
        context.error('Lỗi mở form: $e');
      }
    }
  }

  Future<bool> _ensureLoggedIn() async {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthSuccess) return true;

    await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cần đăng nhập'),
        content:
            const Text('Bạn cần đăng nhập để đăng địa điểm. Đăng nhập ngay?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Huỷ'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop(true);
              // Navigate to auth screen immediately after closing dialog
              if (mounted) {
                context.push(AppRoutes.auth);
              }
            },
            child: const Text('Đăng nhập'),
          ),
        ],
      ),
    );

    // Return false to prevent continuing with place creation
    return false;
  }
}
