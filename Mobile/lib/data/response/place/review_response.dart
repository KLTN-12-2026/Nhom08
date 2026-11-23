import 'user_response.dart';

class ReviewResponse {
  final int id;
  final int? placeId;
  final UserResponse? user;
  final double rating;
  final String? comment;
  final String? createdAt;
  final String? updatedAt;

  const ReviewResponse({
    required this.id,
    this.placeId,
    this.user,
    required this.rating,
    this.comment,
    this.createdAt,
    this.updatedAt,
  });

  factory ReviewResponse.fromJson(Map<String, dynamic> json) {
    return ReviewResponse(
      id: json['id'] ?? 0,
      placeId: json['place_id'] ?? json['cafe_id'],
      user: json['user'] != null
          ? UserResponse.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      rating: (json['rating'] ?? 0.0).toDouble(),
      comment: json['comment'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'place_id': placeId,
      'user': user?.toJson(),
      'rating': rating,
      'comment': comment,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  // Helper getters for backward compatibility
  int get userId => user?.id ?? 0;
  String? get userName => user?.displayName;
}
