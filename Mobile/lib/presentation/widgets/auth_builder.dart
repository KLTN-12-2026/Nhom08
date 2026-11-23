import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:trove/models/user.dart';
import 'package:trove/presentation/bloc/auth/auth_bloc.dart';
import 'package:trove/presentation/bloc/auth/auth_state.dart';
import 'package:trove/core/config/router/app_routes.dart';

/// Widget helper để hiển thị UI khác nhau dựa trên auth state
class AuthBuilder extends StatelessWidget {
  final Widget Function(BuildContext context, User user) authenticated;
  final Widget Function(BuildContext context)? unauthenticated;
  final Widget Function(BuildContext context)? loading;
  final Widget Function(BuildContext context, String error)? error;

  const AuthBuilder({
    Key? key,
    required this.authenticated,
    this.unauthenticated,
    this.loading,
    this.error,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        if (state is AuthLoading) {
          return loading?.call(context) ??
              const Center(child: CircularProgressIndicator());
        }

        if (state is AuthError) {
          return error?.call(context, state.message) ??
              Center(child: Text('Lỗi: ${state.message}'));
        }

        if (state is AuthSuccess) {
          return authenticated(context, state.user);
        }

        // AuthInitial hoặc AuthUnauthenticated
        return unauthenticated?.call(context) ?? const SizedBox.shrink();
      },
    );
  }
}

/// Extension để dễ dàng check auth state
extension AuthStateExtension on BuildContext {
  bool get isAuthenticated {
    final state = read<AuthBloc>().state;
    return state is AuthSuccess;
  }

  User? get currentUser {
    final state = read<AuthBloc>().state;
    if (state is AuthSuccess) {
      return state.user;
    }
    return null;
  }

  /// Kiểm tra đăng nhập và hiển thị dialog nếu chưa đăng nhập
  /// Trả về true nếu đã đăng nhập, false nếu chưa đăng nhập
  /// [actionName] - Tên hành động để hiển thị trong dialog (ví dụ: "thêm yêu thích", "tạo đánh giá")
  Future<bool> requireLogin({String? actionName}) async {
    final authState = read<AuthBloc>().state;
    if (authState is AuthSuccess) {
      return true;
    }

    final actionText = actionName ?? 'thực hiện thao tác này';
    final result = await showDialog<bool>(
      context: this,
      builder: (ctx) => AlertDialog(
        title: const Text('Cần đăng nhập'),
        content: Text('Bạn cần đăng nhập để $actionText. Đăng nhập ngay?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Đăng nhập'),
          ),
        ],
      ),
    );

    if (result == true && mounted) {
      push(AppRoutes.auth);
    }

    return result ?? false;
  }
}
