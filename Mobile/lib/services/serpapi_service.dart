import 'package:dio/dio.dart';
import '../core/config/serpapi_config.dart';

/// Request object cho SerpAPI search
class SerpApiSearchRequest {
  final String query;
  final String? location;
  final String? hl;
  final String? gl;
  final String? googleDomain;
  final double? latitude;
  final double? longitude;
  final String? cr;
  final String? lr;
  final String? apiKey;
  final int? start; // Pagination offset

  const SerpApiSearchRequest({
    required this.query,
    this.location,
    this.hl,
    this.gl,
    this.googleDomain,
    this.latitude,
    this.longitude,
    this.cr,
    this.lr,
    this.apiKey,
    this.start,
  });
}

/// Service để gọi SerpAPI (Google Search API)
class SerpApiService {
  final Dio _dio;
  final String? _apiKey;

  SerpApiService({String? apiKey})
      : _dio = Dio(),
        _apiKey = apiKey ?? SerpApiConfig.apiKey;

  /// Tìm kiếm trên Google thông qua SerpAPI
  ///
  /// Trả về Map chứa kết quả tìm kiếm từ SerpAPI
  Future<Map<String, dynamic>> search(SerpApiSearchRequest request) async {
    try {
      final queryParams = <String, dynamic>{
        'q': request.query,
      };

      // Thêm các tham số tùy chọn
      // Location: SerpAPI recommends city-level location to simulate real user search
      // Parse location để chỉ lấy city nếu location quá chi tiết
      if (request.location != null && request.location!.isNotEmpty) {
        final cityLocation = _extractCityFromLocation(request.location!);
        if (cityLocation.isNotEmpty) {
          queryParams['location'] = cityLocation;
        }
      }
      if (request.hl != null && request.hl!.isNotEmpty) {
        queryParams['hl'] = request.hl;
      }
      if (request.gl != null && request.gl!.isNotEmpty) {
        queryParams['gl'] = request.gl;
      }
      if (request.googleDomain != null && request.googleDomain!.isNotEmpty) {
        queryParams['google_domain'] = request.googleDomain;
      }
      // Thêm lat/long nếu có (format: lat_long=lat,lng)
      if (request.latitude != null && request.longitude != null) {
        queryParams['lat_long'] = '${request.latitude},${request.longitude}';
      }
      // Country restriction
      if (request.cr != null && request.cr!.isNotEmpty) {
        queryParams['cr'] = request.cr;
      }
      // Language restriction
      if (request.lr != null && request.lr!.isNotEmpty) {
        queryParams['lr'] = request.lr;
      }
      // Pagination offset
      if (request.start != null && request.start! > 0) {
        queryParams['start'] = request.start;
      }

      // API key là bắt buộc
      final finalApiKey = request.apiKey ?? _apiKey;
      if (finalApiKey == null || finalApiKey.isEmpty) {
        throw Exception(
            'SerpAPI key is required. Please provide apiKey parameter or set it in constructor.');
      }
      queryParams['api_key'] = finalApiKey;

      // Build và print URL đầy đủ để debug
      final baseUrl = 'https://serpapi.com/search.json';
      final uri = Uri.parse(baseUrl).replace(
          queryParameters:
              queryParams.map((key, value) => MapEntry(key, value.toString())));
      print('🌐 SerpAPI REQUEST[GET] => URL: $uri');

      final response = await _dio.get(
        baseUrl,
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw Exception(
            'SerpAPI request failed with status code: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ SerpApiService error: $e');
      if (e is DioException) {
        if (e.response != null) {
          throw Exception(
              'SerpAPI error: ${e.response?.statusCode} - ${e.response?.data}');
        } else {
          throw Exception('Network error: ${e.message}');
        }
      }
      rethrow;
    }
  }

  /// Tìm kiếm địa điểm (places) trên Google Maps thông qua SerpAPI
  ///
  /// Đây là method tiện ích để tìm kiếm các địa điểm như quán cà phê, nhà hàng, etc.
  ///
  /// Trả về danh sách các địa điểm từ local_results
  Future<List<Map<String, dynamic>>> searchPlaces({
    required String query,
    String? location,
    String? hl,
    String? gl,
    String? googleDomain,
    double? latitude,
    double? longitude,
    String? cr,
    String? lr,
    String? apiKey,
  }) async {
    try {
      final result = await search(
        SerpApiSearchRequest(
          query: query,
          location: location,
          hl: hl ?? SerpApiConfig.defaultHl,
          gl: gl ?? SerpApiConfig.defaultGl,
          googleDomain: googleDomain ?? SerpApiConfig.defaultGoogleDomain,
          latitude: latitude,
          longitude: longitude,
          cr: cr ?? SerpApiConfig.defaultCr,
          lr: lr ?? SerpApiConfig.defaultLr,
          apiKey: apiKey,
        ),
      );

      // Lấy danh sách địa điểm từ local_results
      if (result.containsKey('local_results') &&
          result['local_results'] is Map &&
          result['local_results']['places'] is List) {
        return List<Map<String, dynamic>>.from(
            result['local_results']['places']);
      }

      return [];
    } catch (e) {
      print('❌ SerpApiService searchPlaces error: $e');
      rethrow;
    }
  }

  /// Extract city name từ location string
  /// Ví dụ: "199 Stockton Street, San Francisco, California 94108, United States"
  /// -> "San Francisco"
  String _extractCityFromLocation(String location) {
    // Nếu location đã ngắn (< 30 ký tự), có thể đã là city name
    if (location.length < 30) {
      return location;
    }

    // Tách location bằng dấu phẩy
    final parts = location.split(',');

    // Thường city name là phần thứ 2 (sau street address)
    // Format: "Street, City, State/Province, Country"
    if (parts.length >= 2) {
      // Lấy phần thứ 2 và trim whitespace
      final city = parts[1].trim();

      // Nếu city có số (như zip code), bỏ phần số đi
      final cityWithoutNumbers = city.split(RegExp(r'\d')).first.trim();

      return cityWithoutNumbers.isNotEmpty ? cityWithoutNumbers : city;
    }

    // Nếu không parse được, trả về location gốc
    return location;
  }
}
