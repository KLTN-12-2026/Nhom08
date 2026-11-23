import 'package:dio/dio.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart' as mp;
import 'package:trove/core/config/mapbox_config.dart';
import 'package:trove/models/search_suggestion.dart';

class MapboxService {
  final String _accessToken;
  final Dio _dio;

  MapboxService()
      : _accessToken = MapboxConfig.accessToken,
        _dio = Dio();

  // Tìm kiếm địa điểm từ tên
  Future<Map<String, dynamic>?> searchLocation(String query) async {
    try {
      final response = await _dio.get(
        'https://api.mapbox.com/geocoding/v5/mapbox.places/$query.json',
        queryParameters: {
          'access_token': _accessToken,
          'limit': 1,
        },
      );

      if (response.statusCode == 200 &&
          response.data['features'] != null &&
          response.data['features'].isNotEmpty) {
        final feature = response.data['features'][0];
        final coordinates = feature['center'];
        return {
          'coordinates': coordinates,
          'placeName': feature['place_name'],
        };
      }
      return null;
    } catch (e) {
      print('Error searching location: $e');
      return null;
    }
  }

  // Lấy địa chỉ từ tọa độ
  Future<String?> getAddressFromCoordinates(double lon, double lat) async {
    try {
      final response = await _dio.get(
        'https://api.mapbox.com/geocoding/v5/mapbox.places/$lon,$lat.json',
        queryParameters: {
          'access_token': _accessToken,
          'limit': 1,
        },
      );

      if (response.statusCode == 200 &&
          response.data['features'] != null &&
          response.data['features'].isNotEmpty) {
        return response.data['features'][0]['place_name'];
      }
      return null;
    } catch (e) {
      print('Error getting address: $e');
      return null;
    }
  }

  // Lấy chỉ đường
  Future<Map<String, dynamic>?> getDirections(
    mp.Point start,
    mp.Point end,
  ) async {
    try {
      // Kiểm tra tọa độ hợp lệ
      if (start.coordinates.lng == 0 ||
          start.coordinates.lat == 0 ||
          end.coordinates.lng == 0 ||
          end.coordinates.lat == 0) {
        print(
            'Invalid coordinates: Start (${start.coordinates.lng}, ${start.coordinates.lat}), End (${end.coordinates.lng}, ${end.coordinates.lat})');
        return null;
      }

      print(
          'Requesting directions from: (${start.coordinates.lng}, ${start.coordinates.lat}) to (${end.coordinates.lng}, ${end.coordinates.lat})');

      final response = await _dio.get(
        'https://api.mapbox.com/directions/v5/mapbox/driving/${start.coordinates.lng},${start.coordinates.lat};${end.coordinates.lng},${end.coordinates.lat}',
        queryParameters: {
          'access_token': _accessToken,
          'geometries': 'geojson',
          'overview': 'full',
          'steps': true,
        },
      );

      if (response.statusCode == 200 &&
          response.data['routes'] != null &&
          response.data['routes'].isNotEmpty) {
        final route = response.data['routes'][0];
        return {
          'distance': route['distance'],
          'duration': route['duration'],
          'geometry': route['geometry'],
          'steps': route['legs'][0]['steps'],
        };
      }
      return null;
    } catch (e) {
      print('Error getting directions: $e');
      return null;
    }
  }

  // Lấy các bước điều hướng
  Future<Map<String, dynamic>?> getNavigationSteps(
    mp.Point start,
    mp.Point end,
  ) async {
    try {
      final response = await _dio.get(
        'https://api.mapbox.com/directions/v5/mapbox/driving/${start.coordinates.lng},${start.coordinates.lat};${end.coordinates.lng},${end.coordinates.lat}',
        queryParameters: {
          'access_token': _accessToken,
          'steps': true,
          'annotations': 'distance,duration',
          'overview': 'full',
        },
      );

      if (response.statusCode == 200 &&
          response.data['routes'] != null &&
          response.data['routes'].isNotEmpty) {
        final route = response.data['routes'][0];
        return {
          'steps': route['legs'][0]['steps'],
          'distance': route['distance'],
          'duration': route['duration'],
          'geometry': route['geometry'],
        };
      }
      return null;
    } catch (e) {
      print('Error getting navigation steps: $e');
      return null;
    }
  }

  // Lấy gợi ý tìm kiếm
  Future<List<SearchSuggestion>> getSearchSuggestions(String query) async {
    try {
      final response = await _dio.get(
        'https://api.mapbox.com/geocoding/v5/mapbox.places/$query.json',
        queryParameters: {
          'access_token': _accessToken,
          'limit': 5,
          'language': 'vi',
        },
      );

      if (response.statusCode == 200 && response.data['features'] != null) {
        final features = response.data['features'] as List;
        return features.map((feature) {
          final coordinates = feature['center'] as List;
          return SearchSuggestion(
            placeName: feature['place_name'],
            latitude: coordinates[1].toDouble(),
            longitude: coordinates[0].toDouble(),
          );
        }).toList();
      }
      return [];
    } catch (e) {
      print('Error getting search suggestions: $e');
      return [];
    }
  }
}
