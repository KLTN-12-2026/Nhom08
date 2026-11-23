/// Authentication-related exceptions
/// These represent business rule violations in the auth domain
class AuthException implements Exception {
  final String message;
  final AuthExceptionType type;

  const AuthException._({
    required this.message,
    required this.type,
  });

  /// Invalid email format
  factory AuthException.invalidEmail(String message) {
    return AuthException._(
      message: message,
      type: AuthExceptionType.invalidEmail,
    );
  }

  /// Weak password
  factory AuthException.weakPassword(String message) {
    return AuthException._(
      message: message,
      type: AuthExceptionType.weakPassword,
    );
  }

  /// Invalid credentials
  factory AuthException.invalidCredentials(String message) {
    return AuthException._(
      message: message,
      type: AuthExceptionType.invalidCredentials,
    );
  }

  /// Account locked
  factory AuthException.accountLocked(String message) {
    return AuthException._(
      message: message,
      type: AuthExceptionType.accountLocked,
    );
  }

  /// Token expired
  factory AuthException.tokenExpired(String message) {
    return AuthException._(
      message: message,
      type: AuthExceptionType.tokenExpired,
    );
  }

  /// Network error
  factory AuthException.networkError(String message) {
    return AuthException._(
      message: message,
      type: AuthExceptionType.networkError,
    );
  }

  /// Server error
  factory AuthException.serverError(String message) {
    return AuthException._(
      message: message,
      type: AuthExceptionType.serverError,
    );
  }

  /// Unknown error
  factory AuthException.unknown(String message) {
    return AuthException._(
      message: message,
      type: AuthExceptionType.unknown,
    );
  }

  @override
  String toString() {
    return 'AuthException($type): $message';
  }
}

/// Types of authentication exceptions
enum AuthExceptionType {
  invalidEmail,
  weakPassword,
  invalidCredentials,
  accountLocked,
  tokenExpired,
  networkError,
  serverError,
  unknown,
}
