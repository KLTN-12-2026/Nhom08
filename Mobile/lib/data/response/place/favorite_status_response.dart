class FavoriteStatusResponse {
  final bool success;
  final String message;
  final FavoriteStatusData? data;

  const FavoriteStatusResponse({
    required this.success,
    required this.message,
    this.data,
  });

  factory FavoriteStatusResponse.fromJson(Map<String, dynamic> json) {
    return FavoriteStatusResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null
          ? FavoriteStatusData.fromJson(json['data'])
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

class FavoriteStatusData {
  final bool isFavorited;
  final int? favoriteId;

  const FavoriteStatusData({
    required this.isFavorited,
    this.favoriteId,
  });

  factory FavoriteStatusData.fromJson(Map<String, dynamic> json) {
    return FavoriteStatusData(
      isFavorited: json['is_favorite'] ?? false,
      favoriteId: json['favorite_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'is_favorite': isFavorited,
      'favorite_id': favoriteId,
    };
  }
}
