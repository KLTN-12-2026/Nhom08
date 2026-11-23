class FavoriteStatsResponse {
  final bool success;
  final String message;
  final FavoriteStatsData? data;

  const FavoriteStatsResponse({
    required this.success,
    required this.message,
    this.data,
  });

  factory FavoriteStatsResponse.fromJson(Map<String, dynamic> json) {
    return FavoriteStatsResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null
          ? FavoriteStatsData.fromJson(json['data'])
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

class FavoriteStatsData {
  final int totalFavorites;
  final Map<String, int> byCategory;

  const FavoriteStatsData({
    required this.totalFavorites,
    required this.byCategory,
  });

  factory FavoriteStatsData.fromJson(Map<String, dynamic> json) {
    return FavoriteStatsData(
      totalFavorites: json['total_favorites'] ?? 0,
      byCategory: Map<String, int>.from(json['by_category'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_favorites': totalFavorites,
      'by_category': byCategory,
    };
  }
}
