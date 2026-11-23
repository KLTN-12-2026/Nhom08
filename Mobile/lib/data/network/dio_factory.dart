import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import '../../utils/constants/url.dart';
import '../data_sources/local/app_prefs.dart';

const String APPLICATION_JSON = "application/json";
const String CONTENT_TYPE = "content-type";
const String ACCEPT = "accept";
const String AUTHORIZATION = "authorization";
const String DEFAULT_LANGUAGE = "language";

class DioFactory {
  AppPreferences _appPreferences;

  DioFactory(this._appPreferences);

  Future<Dio> getDio() async {
    return _buildDio(baseUrl: Constant.baseUrl);
  }

  /// Build Dio with a custom baseUrl (useful for dynamic environments).
  Future<Dio> getDioWithBaseUrl(String baseUrl) async {
    return _buildDio(baseUrl: baseUrl);
  }

  Future<Dio> _buildDio({required String baseUrl}) async {
    Dio dio = Dio();
    int _timeOut = 20 * 1000; // 20s
    String language = await _appPreferences.getAppLanguage();
    Map<String, String> headers = {
      CONTENT_TYPE: APPLICATION_JSON,
      ACCEPT: APPLICATION_JSON,
      AUTHORIZATION: Constant.token,
      DEFAULT_LANGUAGE: language
    };

    dio.options = BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: Duration(milliseconds: _timeOut),
        receiveTimeout: Duration(milliseconds: _timeOut),
        headers: headers);

    if (kReleaseMode) {
      // release mode: no logs
    } else {
      // dio.interceptors.add(PrettyDioLogger(
      //     requestHeader: true, requestBody: true, responseHeader: true));
    }

    return dio;
  }
}
