import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:trove/services/auth_service.dart';
import 'package:trove/core/services/fcm_service.dart';
import '../../../core/data/data_main.dart';

import 'auth_event.dart';
import 'auth_state.dart';
import 'package:trove/core/utils/error_message_helper.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthService _authService;
  final FcmService? _fcmService;
  bool _tokenListenerAttached = false;

  AuthBloc({required AuthService authService, FcmService? fcmService})
      : _authService = authService,
        _fcmService = fcmService,
        super(AuthInitial()) {
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthRegisterRequested>(_onRegisterRequested);
    on<AuthLogoutRequested>(_onLogoutRequested);
    on<AuthTokenExpired>(_onTokenExpired);
    on<AuthRestoreSession>(_onRestoreSession);
  }

  Future<void> _onLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      // Use the AuthService for login
      final result = await _authService.login(event.email, event.password);

      if (result.success && result.user != null) {
        // Save user info to DataMain for global access
        dataMain.setUserInfo(result.user!);

        // Sync FCM token
        await _syncFcmToken();

        emit(AuthSuccess(user: result.user!));
      } else {
        emit(AuthError(message: result.message));
      }
    } catch (e) {
      emit(AuthError(message: ErrorMessageHelper.getFriendlyMessage(e)));
    }
  }

  Future<void> _onRegisterRequested(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      // Use the AuthService for registration
      final result = await _authService.register(
        event.email,
        event.password,
        event.passwordConfirmation,
        event.name,
        phone: event.phone,
      );

      if (result.success && result.user != null) {
        // Save user info to DataMain for global access
        dataMain.setUserInfo(result.user!);

        // Sync FCM token
        await _syncFcmToken();

        emit(AuthSuccess(user: result.user!));
      } else {
        emit(AuthError(message: result.message));
      }
    } catch (e) {
      emit(AuthError(message: ErrorMessageHelper.getFriendlyMessage(e)));
    }
  }

  Future<void> _syncFcmToken() async {
    if (_fcmService == null) return;

    try {
      final token = await _fcmService!.initAndGetToken();
      if (token != null) {
        await _fcmService!.syncTokenToServer(token);
      }

      if (!_tokenListenerAttached) {
        _tokenListenerAttached = true;
        _fcmService!.onTokenRefresh().listen((newToken) async {
          if (newToken.isNotEmpty) {
            try {
              await _fcmService!.syncTokenToServer(newToken);
            } catch (_) {}
          }
        });
      }
    } catch (e) {
      final msg = ErrorMessageHelper.getFriendlyMessage(e);
      assert(() {
        print('❌ Sync FCM token failed: $msg');
        return true;
      }());
    }
  }

  Future<void> _onLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      await _authService.logout();
      // Clear DataMain on logout
      dataMain.clear();
      emit(AuthUnauthenticated());
    } catch (e) {
      // Ngay cả khi có lỗi, vẫn emit unauthenticated để clear state
      dataMain.clear(); // Clear DataMain even on error
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onTokenExpired(
    AuthTokenExpired event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthUnauthenticated());
  }

  Future<void> _onRestoreSession(
    AuthRestoreSession event,
    Emitter<AuthState> emit,
  ) async {
    // Save user info to DataMain for global access
    dataMain.setUserInfo(event.user);
    emit(AuthSuccess(user: event.user));
  }
}
