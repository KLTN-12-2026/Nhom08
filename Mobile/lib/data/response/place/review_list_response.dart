import 'review_response.dart';

class ReviewListResponse {
  final List<ReviewResponse> reviews;
  final int total;
  final int currentPage;
  final int lastPage;
  final int perPage;
  final double? averageRating;

  const ReviewListResponse({
    required this.reviews,
    required this.total,
    required this.currentPage,
    required this.lastPage,
    required this.perPage,
    this.averageRating,
  });

  factory ReviewListResponse.fromJson(Map<String, dynamic> json) {
    // Handle response structure: {success, message, data: {data: [...], current_page, last_page, per_page, total}}
    final data = json['data'] ?? json;
    final reviewsList = data['data'] as List<dynamic>? ?? [];

    return ReviewListResponse(
      reviews: reviewsList
          .map((review) =>
              ReviewResponse.fromJson(review as Map<String, dynamic>))
          .toList(),
      total: data['total'] ?? 0,
      currentPage: data['current_page'] ?? 1,
      lastPage: data['last_page'] ?? 1,
      perPage: data['per_page'] ?? 20,
      averageRating: data['average_rating'] != null
          ? (data['average_rating'] as num).toDouble()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'data': reviews.map((review) => review.toJson()).toList(),
      'total': total,
      'current_page': currentPage,
      'last_page': lastPage,
      'per_page': perPage,
      'average_rating': averageRating,
    };
  }

  // Helper getter for backward compatibility
  int get page => currentPage;
}
