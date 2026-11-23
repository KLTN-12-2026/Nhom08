class FavoritePlaceListResponse {
  final bool success;
  final String message;
  final FavoritePlaceListData? data;

  const FavoritePlaceListResponse({
    required this.success,
    required this.message,
    this.data,
  });

  factory FavoritePlaceListResponse.fromJson(Map<String, dynamic> json) {
    return FavoritePlaceListResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null
          ? FavoritePlaceListData.fromJson(json['data'])
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

class FavoritePlaceListData {
  final List<FavoritePlaceItem> favorites;
  final int total;
  final int page;
  final int perPage;

  const FavoritePlaceListData({
    required this.favorites,
    required this.total,
    required this.page,
    required this.perPage,
  });

  factory FavoritePlaceListData.fromJson(Map<String, dynamic> json) {
    return FavoritePlaceListData(
      favorites: (json['favorites'] as List<dynamic>?)
              ?.map((item) => FavoritePlaceItem.fromJson(item))
              .toList() ??
          [],
      total: json['total'] ?? 0,
      page: json['page'] ?? 1,
      perPage: json['per_page'] ?? 20,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'favorites': favorites.map((item) => item.toJson()).toList(),
      'total': total,
      'page': page,
      'per_page': perPage,
    };
  }
}

class FavoritePlaceItem {
  final int id;
  final int userId;
  final int placeId;
  final String createdAt;
  final PlaceInfo place;

  const FavoritePlaceItem({
    required this.id,
    required this.userId,
    required this.placeId,
    required this.createdAt,
    required this.place,
  });

  factory FavoritePlaceItem.fromJson(Map<String, dynamic> json) {
    return FavoritePlaceItem(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      placeId: json['place_id'] ?? 0,
      createdAt: json['created_at'] ?? '',
      place: PlaceInfo.fromJson(json['place'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'place_id': placeId,
      'created_at': createdAt,
      'place': place.toJson(),
    };
  }
}

class PlaceInfo {
  final int id;
  final String name;
  final String address;
  final String description;
  final String category;
  final double rating;
  final double latitude;
  final double longitude;
  final int? status;
  final int userId;
  final String createdAt;
  final List<String> images;
  final bool isFavorited;
  final int? favoriteId;
  final int? categoryId;
  final num? averagePrice;
  final num? price;

  const PlaceInfo({
    required this.id,
    required this.name,
    required this.address,
    required this.description,
    required this.category,
    required this.rating,
    required this.latitude,
    required this.longitude,
    this.status,
    required this.userId,
    required this.createdAt,
    required this.images,
    required this.isFavorited,
    this.favoriteId,
    this.categoryId,
    this.averagePrice,
    this.price,
  });

  factory PlaceInfo.fromJson(Map<String, dynamic> json) {
    List<String> parseImages(dynamic raw) {
      if (raw is List) {
        if (raw.isEmpty) return [];
        if (raw.first is String) {
          return raw.cast<String>();
        }
        // Try objects with url
        return raw
            .map((e) => (e is Map<String, dynamic>) ? (e['url'] ?? '') : '')
            .whereType<String>()
            .where((e) => e.isNotEmpty)
            .toList();
      }
      return [];
    }

    return PlaceInfo(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      rating: (json['rating'] ?? 0.0).toDouble(),
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      status: json['status'] is int
          ? json['status']
          : int.tryParse(json['status']?.toString() ?? ''),
      userId: json['user_id'] ?? 0,
      createdAt: json['created_at'] ?? '',
      images: parseImages(json['images']),
      isFavorited: json['is_favorite'] ?? false,
      favoriteId: json['favorite_id'],
      categoryId: json['category_id'],
      averagePrice: json['average_price'],
      price: json['price'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'description': description,
      'category': category,
      'rating': rating,
      'latitude': latitude,
      'longitude': longitude,
      'status': status,
      'user_id': userId,
      'created_at': createdAt,
      'images': images,
      'is_favorite': isFavorited,
      'favorite_id': favoriteId,
      'category_id': categoryId,
      'average_price': averagePrice,
      'price': price,
    };
  }
}
