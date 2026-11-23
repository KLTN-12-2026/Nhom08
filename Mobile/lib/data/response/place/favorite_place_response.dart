class FavoritePlaceResponse {
  final bool success;
  final String message;
  final FavoritePlaceData? data;

  const FavoritePlaceResponse({
    required this.success,
    required this.message,
    this.data,
  });

  factory FavoritePlaceResponse.fromJson(Map<String, dynamic> json) {
    return FavoritePlaceResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null
          ? FavoritePlaceData.fromJson(json['data'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data?.toJson(),
    };
  }
}

class FavoritePlaceData {
  final int favoriteId;
  final bool? isFavorited;

  const FavoritePlaceData({
    required this.favoriteId,
    this.isFavorited,
  });

  factory FavoritePlaceData.fromJson(Map<String, dynamic> json) {
    // Check if is_favorited is directly in json
    final isFavorited = json['is_favorited'] as bool?;

    // Check for favorite_id in nested data or directly
    int favoriteId = 0;
    if (json['data'] != null && json['data'] is Map) {
      // If data is a nested object, check for id inside it
      favoriteId = json['data']['id'] ?? 0;
    } else if (json['id'] != null) {
      // If id is directly in json
      favoriteId = json['id'] is int
          ? json['id']
          : int.tryParse(json['id'].toString()) ?? 0;
    } else {
      // Fallback to favorite_id
      favoriteId = json['favorite_id'] ?? 0;
    }

    return FavoritePlaceData(
      favoriteId: favoriteId,
      isFavorited: isFavorited,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'favorite_id': favoriteId,
      'is_favorited': isFavorited,
    };
  }
}
