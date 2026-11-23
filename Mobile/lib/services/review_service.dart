// lib/services/review_service.dart
import '../data/data_sources/remote/api_client.dart';
import '../data/request/review.dart';
import '../data/response/place/review_response.dart';
import '../data/response/place/review_list_response.dart';

class ReviewService {
  final ApiClient _apiClient;

  ReviewService(this._apiClient);

  /// Get all reviews with optional filters
  Future<ReviewListResponse> getReviews({
    int? placeId,
    double? rating,
    int page = 1,
  }) async {
    try {
      print(
          "🔍 ReviewService: Getting reviews (placeId: $placeId, rating: $rating)");
      final response = await _apiClient.appService.getReviews(
        placeId: placeId,
        rating: rating,
        page: page,
      );
      print("✅ ReviewService: Reviews retrieved successfully");
      return response;
    } catch (e) {
      print("❌ ReviewService getReviews error: $e");
      throw Exception('Failed to get reviews: $e');
    }
  }

  /// Get reviews for a specific place
  Future<ReviewListResponse> getPlaceReviews({
    required int placeId,
    int page = 1,
    String? sortBy,
    String? sortOrder,
  }) async {
    try {
      print("🔍 ReviewService: Getting reviews for place $placeId");
      final response = await _apiClient.appService.getPlaceReviews(
        placeId: placeId,
        page: page,
        sortBy: sortBy ?? 'created_at',
        sortOrder: sortOrder ?? 'desc',
      );
      print(
          "✅ ReviewService: Reviews retrieved successfully (${response.reviews.length} reviews)");
      return response;
    } catch (e) {
      print("❌ ReviewService getPlaceReviews error: $e");
      throw Exception('Failed to get place reviews: $e');
    }
  }

  /// Create a new review
  Future<ReviewResponse> createReview({
    required int placeId,
    required double rating,
    required String comment,
  }) async {
    try {
      print("🔍 ReviewService: Creating review for place $placeId");
      final request = CreateReviewRequest(
        placeId: placeId,
        rating: rating,
        comment: comment.isNotEmpty ? comment : null,
      );
      final response = await _apiClient.appService.createReview(request);
      print("✅ ReviewService: Review created successfully");
      return response;
    } catch (e) {
      print("❌ ReviewService createReview error: $e");
      throw Exception('Failed to create review: $e');
    }
  }

  /// Update a review
  Future<ReviewResponse> updateReview({
    required int reviewId,
    double? rating,
    String? comment,
  }) async {
    try {
      print("🔍 ReviewService: Updating review $reviewId");
      final request = UpdateReviewRequest(
        rating: rating,
        comment: comment,
      );
      final response = await _apiClient.appService.updateReview(
        reviewId: reviewId,
        request: request,
      );
      print("✅ ReviewService: Review updated successfully");
      return response;
    } catch (e) {
      print("❌ ReviewService updateReview error: $e");
      throw Exception('Failed to update review: $e');
    }
  }

  /// Delete a review
  Future<void> deleteReview(int reviewId) async {
    try {
      print("🔍 ReviewService: Deleting review $reviewId");
      await _apiClient.appService.deleteReview(reviewId);
      print("✅ ReviewService: Review deleted successfully");
    } catch (e) {
      print("❌ ReviewService deleteReview error: $e");
      throw Exception('Failed to delete review: $e');
    }
  }
}
