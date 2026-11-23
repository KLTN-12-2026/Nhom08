import 'user_info_response.dart';

/// Main authentication response wrapper
class AuthenticationResponse {
  final int? statusCode;
  final String? message;
  final bool? success;
  final AuthData? data;

  const AuthenticationResponse({
    this.statusCode,
    this.message,
    this.success,
    this.data,
  });

  factory AuthenticationResponse.fromJson(Map<String, dynamic> json) {
    return AuthenticationResponse(
      statusCode: json['status_code'],
      message: json['message'],
      success: json['success'],
      data: json['data'] != null ? AuthData.fromJson(json['data']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'status_code': statusCode,
      'message': message,
      'success': success,
      'data': data?.toJson(),
    };
  }
}

class AuthData {
  final String accessToken;
  final String refreshToken;
  final String? tokenType;
  final int? expiresIn;
  final UserInfoData? user;

  AuthData({
    required this.accessToken,
    required this.refreshToken,
    this.tokenType,
    this.expiresIn,
    this.user,
  });

  factory AuthData.fromJson(Map<String, dynamic> json) {
    return AuthData(
      accessToken: json['access_token'] ?? '',
      refreshToken: json['refresh_token'] ?? '',
      tokenType: json['token_type'] ?? json['type'],
      expiresIn: json['expires_in'],
      user: json['user'] != null
          ? UserInfoData.fromJson(
              Map<String, dynamic>.from(json['user'] as Map),
            )
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'refresh_token': refreshToken,
      'token_type': tokenType,
      'expires_in': expiresIn,
      'user': user?.toJson(),
    };
  }
}
