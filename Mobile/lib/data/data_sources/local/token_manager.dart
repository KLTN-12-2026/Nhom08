import 'package:shared_preferences/shared_preferences.dart';

class TokenManager {
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _tokenTypeKey = 'token_type';

  // Lưu token vào SharedPreferences
  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    String? tokenType,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessTokenKey, accessToken);
    await prefs.setString(_refreshTokenKey, refreshToken);
    if (tokenType != null) {
      await prefs.setString(_tokenTypeKey, tokenType);
    }
  }

  // Lấy access token
  static Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_accessTokenKey);
  }

  // Lấy refresh token
  static Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_refreshTokenKey);
  }

  // Lấy token type
  static Future<String?> getTokenType() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenTypeKey);
  }

  // Xóa tất cả token
  static Future<void> clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_accessTokenKey);
    await prefs.remove(_refreshTokenKey);
    await prefs.remove(_tokenTypeKey);
  }

  // Lấy authorization header
  static Future<String?> getAuthorizationHeader() async {
    final accessToken = await getAccessToken();
    final tokenType = await getTokenType();

    if (accessToken == null) {
      return null;
    }

    return tokenType != null
        ? '$tokenType $accessToken'
        : 'Bearer $accessToken';
  }
}
