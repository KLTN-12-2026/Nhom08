import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/config/themes/language_manager.dart';

const String PREFS_KEY_LANG = "PREFS_KEY_LANG";
const String PREFS_KEY_ONBOARDING_SCREEN = "PREFS_KEY_ONBOARDING_SCREEN";
const String PREFS_KEY_IS_USER_LOGGED_IN = "PREFS_KEY_IS_USER_LOGGED_IN";
const String PREFS_KEY_AUTH_TOKEN = "PREFS_KEY_AUTH_TOKEN";
const String PREFS_KEY_REFRESH_TOKEN = "PREFS_KEY_REFRESH_TOKEN";

class AppPreferences {
  SharedPreferences _sharedPreferences;

  AppPreferences(this._sharedPreferences);

  Future<String> getAppLanguage() async {
    String? language = _sharedPreferences.getString(PREFS_KEY_LANG);

    if (language != null && language.isNotEmpty) {
      return language;
    } else {
      return LanguageType.ENGLISH.getValue();
    }
  }

  Future<void> setOnBoardingScreenViewed() async {
    _sharedPreferences.setBool(PREFS_KEY_ONBOARDING_SCREEN, true);
  }

  Future<bool> isOnBoardingScreenViewed() async {
    return _sharedPreferences.getBool(PREFS_KEY_ONBOARDING_SCREEN) ?? false;
  }

  Future<void> setIsUserLoggedIn() async {
    _sharedPreferences.setBool(PREFS_KEY_IS_USER_LOGGED_IN, true);
  }

  Future<bool> isUserLoggedIn() async {
    return _sharedPreferences.getBool(PREFS_KEY_IS_USER_LOGGED_IN) ?? false;
  }

  Future<void> setAuthTokens(String token, String refreshToken) async {
    await _sharedPreferences.setString(PREFS_KEY_AUTH_TOKEN, token);
    await _sharedPreferences.setString(PREFS_KEY_REFRESH_TOKEN, refreshToken);
    await setIsUserLoggedIn();
  }

  String? getAuthToken() {
    return _sharedPreferences.getString(PREFS_KEY_AUTH_TOKEN);
  }

  String? getRefreshToken() {
    return _sharedPreferences.getString(PREFS_KEY_REFRESH_TOKEN);
  }

  Future<void> clearAuth() async {
    await _sharedPreferences.remove(PREFS_KEY_AUTH_TOKEN);
    await _sharedPreferences.remove(PREFS_KEY_REFRESH_TOKEN);
    await _sharedPreferences.setBool(PREFS_KEY_IS_USER_LOGGED_IN, false);
  }
}
