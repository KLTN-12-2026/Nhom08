import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import '../core/config/weather_config.dart';

class WeatherData {
  final String location;
  final double temperature;
  final String condition;
  final int humidity;
  final double windSpeed;
  final double feelsLike;
  final String description;
  final String icon;

  WeatherData({
    required this.location,
    required this.temperature,
    required this.condition,
    required this.humidity,
    required this.windSpeed,
    required this.feelsLike,
    required this.description,
    required this.icon,
  });
}

class WeatherService {
  final Dio _dio;

  WeatherService() : _dio = Dio();

  /// Lấy thời tiết dựa trên vị trí hiện tại
  Future<WeatherData?> getCurrentWeather() async {
    try {
      // Lấy vị trí hiện tại
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        print('⚠️ WeatherService: Location service is disabled');
        return null;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          print('⚠️ WeatherService: Location permission denied');
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        print('⚠️ WeatherService: Location permission denied forever');
        return null;
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      );

      return await getWeatherByCoordinates(
        position.latitude,
        position.longitude,
      );
    } catch (e) {
      print('❌ WeatherService: Error getting current weather - $e');
      return null;
    }
  }

  /// Lấy thời tiết dựa trên tọa độ
  Future<WeatherData?> getWeatherByCoordinates(
    double latitude,
    double longitude,
  ) async {
    try {
      if (WeatherConfig.apiKey == 'YOUR_OPENWEATHERMAP_API_KEY') {
        print('⚠️ WeatherService: Please set OpenWeatherMap API key in WeatherConfig');
        return null;
      }

      final response = await _dio.get(
        '${WeatherConfig.baseUrl}/weather',
        queryParameters: {
          'lat': latitude,
          'lon': longitude,
          'appid': WeatherConfig.apiKey,
          'units': WeatherConfig.defaultUnits,
          'lang': WeatherConfig.defaultLang,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final main = data['main'];
        final weather = data['weather'][0];
        final wind = data['wind'] ?? {};

        // Lấy tên địa điểm
        final location = data['name'] ?? 'Unknown';

        return WeatherData(
          location: location,
          temperature: (main['temp'] as num).toDouble(),
          condition: _translateCondition(weather['main'] as String),
          humidity: main['humidity'] as int,
          windSpeed: (wind['speed'] as num?)?.toDouble() ?? 0.0,
          feelsLike: (main['feels_like'] as num).toDouble(),
          description: weather['description'] as String? ?? '',
          icon: weather['icon'] as String? ?? '',
        );
      }
      return null;
    } catch (e) {
      print('❌ WeatherService: Error fetching weather - $e');
      return null;
    }
  }

  /// Lấy thời tiết dựa trên tên thành phố
  Future<WeatherData?> getWeatherByCity(String cityName) async {
    try {
      if (WeatherConfig.apiKey == 'YOUR_OPENWEATHERMAP_API_KEY') {
        print('⚠️ WeatherService: Please set OpenWeatherMap API key in WeatherConfig');
        return null;
      }

      final response = await _dio.get(
        '${WeatherConfig.baseUrl}/weather',
        queryParameters: {
          'q': cityName,
          'appid': WeatherConfig.apiKey,
          'units': WeatherConfig.defaultUnits,
          'lang': WeatherConfig.defaultLang,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final main = data['main'];
        final weather = data['weather'][0];
        final wind = data['wind'] ?? {};

        return WeatherData(
          location: data['name'] ?? cityName,
          temperature: (main['temp'] as num).toDouble(),
          condition: _translateCondition(weather['main'] as String),
          humidity: main['humidity'] as int,
          windSpeed: (wind['speed'] as num?)?.toDouble() ?? 0.0,
          feelsLike: (main['feels_like'] as num).toDouble(),
          description: weather['description'] as String? ?? '',
          icon: weather['icon'] as String? ?? '',
        );
      }
      return null;
    } catch (e) {
      print('❌ WeatherService: Error fetching weather by city - $e');
      return null;
    }
  }

  /// Dịch điều kiện thời tiết sang tiếng Việt
  String _translateCondition(String condition) {
    final conditionMap = {
      'Clear': 'Trời quang',
      'Clouds': 'Có mây',
      'Rain': 'Mưa',
      'Drizzle': 'Mưa nhỏ',
      'Thunderstorm': 'Giông bão',
      'Snow': 'Tuyết',
      'Mist': 'Sương mù',
      'Fog': 'Sương mù',
      'Haze': 'Sương mù',
    };

    return conditionMap[condition] ?? condition;
  }
}

