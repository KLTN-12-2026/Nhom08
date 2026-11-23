import 'place_model.dart';

class UserPostsResponse {
  final int statusCode;
  final String message;
  final bool success;
  final MyPlacesData? data;

  UserPostsResponse({
    required this.statusCode,
    required this.message,
    required this.success,
    this.data,
  });

  factory UserPostsResponse.fromJson(Map<String, dynamic> json) {
    return UserPostsResponse(
      statusCode: json['status_code'] ?? 0,
      message: json['message'] ?? '',
      success: json['success'] ?? false,
      data: json['data'] != null ? MyPlacesData.fromJson(json['data']) : null,
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

class MyPlacesData {
  final List<PlaceModel> places;
  final int total;
  final int page;
  final int perPage;
  final int userId;

  MyPlacesData({
    required this.places,
    required this.total,
    required this.page,
    required this.perPage,
    required this.userId,
  });

  factory MyPlacesData.fromJson(Map<String, dynamic> json) {
    // BE mới trả data dạng: { data: [ ... ], total, per_page, current_page, ... }
    // hoặc kiểu cũ: { places: [ ... ], total, per_page, page, user_id, ... }
    final rawPlaces = (json['places'] ?? json['data']) as List<dynamic>? ?? [];

    // Hỗ trợ cả key page (cũ) và current_page (Laravel paginator)
    final currentPage = json['page'] ?? json['current_page'] ?? 1;
    final perPage = json['per_page'] ?? json['perPage'] ?? 20;

    return MyPlacesData(
      places: rawPlaces.map((place) => PlaceModel.fromJson(place)).toList(),
      total: json['total'] ?? 0,
      page:
          currentPage is int ? currentPage : int.tryParse('$currentPage') ?? 1,
      perPage: perPage is int ? perPage : int.tryParse('$perPage') ?? 20,
      userId: json['user_id'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'places': places.map((place) => place.toJson()).toList(),
      'total': total,
      'page': page,
      'per_page': perPage,
      'user_id': userId,
    };
  }
}
