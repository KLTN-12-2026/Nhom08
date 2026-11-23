import 'dart:io';

import 'package:dio/dio.dart';
import 'package:retrofit/error_logger.dart';
import 'package:retrofit/http.dart';
import 'package:trove/data/request/auth/login_request.dart';
import 'package:trove/data/response/app_info/app_info_response.dart';
import 'package:trove/data/response/auth/user_info_response.dart';
import 'package:trove/data/response/place/places_detail_response.dart';

// ✅ Import từ thư mục requests
import '../../request/register.dart';
import '../../request/forget_password.dart';
import '../../request/refresh_token.dart';
import '../../request/place.dart';
import '../../request/change_password.dart';

// ✅ Import từ thư mục responses - AUTH
import '../../response/auth/authentication_response.dart';
import '../../response/auth/change_password_response.dart';

import '../../response/place/places_response.dart';
import '../../response/place/enum_options_response.dart';
import '../../response/place/place_create_response.dart';
import '../../response/place/place_images_response.dart';
import '../../response/place/place_image_delete_response.dart';
import '../../response/place/place_update_response.dart';
import '../../response/place/place_delete_response.dart';
import '../../response/place/anonymous_place_response.dart';
import '../../response/place/place_approval_response.dart';

import '../../response/place/user_posts_response.dart';
import '../../response/place/categories_response.dart';
import '../../response/place/category_create_response.dart';
import '../../response/place/favorite_place_response.dart';
import '../../response/place/favorite_place_list_response.dart';
import '../../response/place/favorite_status_response.dart';
import '../../response/place/favorite_stats_response.dart';
import '../../response/place/review_response.dart';
import '../../response/place/review_list_response.dart';
import '../../response/movie/movies_response.dart';
import '../../response/movie/detail_response.dart';
import '../../request/category.dart';
import '../../request/review.dart';
import '../../request/plan/create_plan_request.dart';
import '../../response/plan/activity_groups_response.dart';
import '../../response/plan/create_plan_response.dart';
import '../../response/plan/plans_response.dart';
import '../../response/plan/plan_detail_response.dart';
import '../../response/place/reaction_response.dart';
import '../../response/place/my_reaction_response.dart';
import '../../response/place/reaction_stats_response.dart';
import '../../response/announcement/announcements_response.dart';
import '../../response/premium/premium_status_response.dart';

part 'app_api.g.dart';

@RestApi(baseUrl: "api/")
abstract class AppServiceClient {
  factory AppServiceClient(Dio dio, {String baseUrl}) = _AppServiceClient;

  // ========== AUTH ENDPOINTS ==========
  @POST("login?platform=1")
  Future<AuthenticationResponse> login(@Body() LoginRequest request);

  @POST("register")
  Future<AuthenticationResponse> register(@Body() RegisterRequest request);

  @POST("auth/forget-password")
  Future<AuthenticationResponse> forgetPassword(
      @Body() ForgetPasswordRequest request);

  @POST("auth/reset-password")
  Future<AuthenticationResponse> resetPassword(
      @Body() ResetPasswordRequest request);

  @POST("refresh-token")
  Future<AuthenticationResponse> refreshToken(
      @Body() RefreshTokenRequest request);

  @POST("logout")
  Future<void> logout();

  // ========== DEVICE TOKEN ==========
  @POST("device-tokens")
  Future<void> registerDeviceToken(@Body() Map<String, dynamic> body);

  // ========== APP INFO ==========
  /// Lấy thông tin cấu hình app/backend
  /// GET /api/app-info
  @GET("app-info")
  Future<AppInfoResponse> getAppInfo();

  @GET("me")
  Future<UserInfoResponse> getCurrentUser();

  @PUT("me")
  Future<UserInfoResponse> updateUser(@Body() Map<String, dynamic> body);

  @POST("me/avatar")
  @MultiPart()
  Future<UserInfoResponse> updateAvatar({
    @Part(name: "avatar") required File avatar,
  });

  @PUT("change-password")
  Future<ChangePasswordResponse> changePassword(
      @Body() ChangePasswordRequest request);

  /// Get premium status
  @GET("me/premium")
  Future<PremiumStatusResponse> getPremiumStatus();

  // ========== PLACES ENDPOINTS ==========

  /// Get all places with filtering
  @GET("places")
  Future<PlacesResponse> getPlaces({
    @Query("category") String? category,
    @Query("filters[category_id]") int? categoryId,
    @Query("category_ids[]") List<int>? categoryIds,
    @Query("activity_group_ids[]") List<int>? activityGroupIds,
    @Query("price_range") String? priceRange,
    @Query("price_min") int? priceMin,
    @Query("price_max") int? priceMax,
    @Query("min_rating") double? minRating,
    @Query("max_rating") double? maxRating,
    @Query("query") String? searchQuery,
    @Query("filters[user_id]") int? filterUserId,
    @Query("latitude") double? latitude,
    @Query("longitude") double? longitude,
    @Query("distance_km") int? distanceKm,
    @Query("tags[]") List<String>? tags,
    @Query("tag_ids[]") List<int>? tagIds,
    @Query("sort_by") String? sortBy,
    @Query("sort_order") String? sortOrder,
    @Query("page") int page = 1,
    @Query("per_page") int? perPage,
  });

  /// Get place by ID
  @GET("places/{placeId}")
  Future<PlaceDetailResponse> getPlace(@Path("placeId") String placeId);

  /// Get my favorite places
  @GET("places/my-favorites")
  Future<PlacesResponse> getMyFavoritePlaces({
    @Query("page") int page = 1,
  });

  /// Create new place
  @POST("places")
  @MultiPart()
  Future<PlaceCreateResponse> createPlace({
    @Part(name: "place_data") required String placeData,
    @Part(name: "files") List<File>? files,
  });

  /// Contribute / upload images for place
  @POST("places/{placeId}/contribute")
  @MultiPart()
  Future<PlaceImagesResponse> uploadPlaceImages({
    @Path("placeId") required int placeId,
    @Part(name: "files") required List<File> files,
  });

  /// Get place images
  @GET("places/{placeId}/images")
  Future<PlaceImagesResponse> getPlaceImages({
    @Path("placeId") required int placeId,
    @Query("page") int page = 1,
  });

  /// Delete place image
  @DELETE("places/{placeId}/images/{imageId}")
  Future<PlaceImageDeleteResponse> deletePlaceImage({
    @Path("placeId") required int placeId,
    @Path("imageId") required int imageId,
  });

  /// Update place
  /// Using POST with _method="PUT" in body (handled by UpdatePlaceRequest)
  @POST("places/{placeId}")
  Future<PlaceUpdateResponse> updatePlace({
    @Path("placeId") required int placeId,
    @Body() required FormData body,
  });

  /// Delete place
  @DELETE("places/{placeId}")
  Future<PlaceDeleteResponse> deletePlace(
    @Path("placeId") int placeId, {
    @Query("force") bool force = false,
    @Query("reason") String? reason,
  });

  /// Get enum options
  @GET("places/options/enums")
  Future<EnumOptionsResponse> getEnumOptions();

  /// Search places with POST
  @POST("places/search")
  Future<PlacesResponse> searchPlaces(
    String query, {
    @Body() required PlaceFilterRequest filterRequest,
    @Query("page") int page = 1,
  });

  /// Create anonymous place
  @POST("places/anonymous")
  @MultiPart()
  Future<AnonymousPlaceResponse> createAnonymousPlace({
    @Part(name: "place_data") required String placeData,
    @Part(name: "files") List<File>? files,
  });

  /// Get pending places (admin only)
  @GET("places/pending")
  Future<PlacesResponse> getPendingPlaces({
    @Query("page") int page = 1,
  });

  /// Approve/reject place (admin only)
  @PUT("places/{placeId}/approve")
  Future<PlaceApprovalResponse> approvePlace({
    @Path("placeId") required int placeId,
  });

  // ========== USER POSTS ENDPOINTS ==========

  /// Get current user's places/posts
  @GET("places/my-places")
  Future<UserPostsResponse> getMyPlaces({
    @Query("page") int page = 1,
    @Query("status") String? status, // APPROVED, PENDING, REJECTED
  });

  // ========== CATEGORIES ENDPOINTS ==========
  @GET("categories")
  Future<CategoriesResponse> getCategories();

  @POST("categories")
  Future<CategoryCreateResponse> createCategory(
      @Body() CreateCategoryRequest request);

  // ========== FAVORITES ENDPOINTS ==========

  /// Get user's favorite places with pagination
  @GET("favorites/places")
  Future<FavoritePlaceListResponse> getFavoritePlaces({
    @Query("page") int page = 1,
  });

  // ----- New RESTful favorite places APIs -----
  /// Get all favorite places (RESTful)
  @GET("favorite-places")
  Future<FavoritePlaceListResponse> getAllFavoritePlaces({
    @Query("page") int page = 1,
  });

  /// Add a place to favorites (RESTful)
  @POST("favorite-places")
  Future<FavoritePlaceResponse> addFavoritePlace(
    @Body() Map<String, dynamic> body,
  );

  /// Get a favorite place by ID (RESTful)
  @GET("favorite-places/{id}")
  Future<FavoritePlaceResponse> getFavoritePlaceById(
    @Path("id") int id,
  );

  /// Update a favorite place (RESTful)
  @PUT("favorite-places/{id}")
  Future<FavoritePlaceResponse> updateFavoritePlace(
    @Path("id") int id,
    @Body() Map<String, dynamic> body,
  );

  /// Remove a place from favorites (RESTful)
  @DELETE("favorite-places/{id}")
  Future<void> removeFavoritePlace(
    @Path("id") int id,
  );

  /// Toggle favorite place status (RESTful)
  @POST("favorite-places/toggle")
  Future<FavoritePlaceResponse> toggleFavoritePlace(
    @Body() Map<String, dynamic> body,
  );

  /// Check if place is in favorites
  @GET("favorites/{placeId}/check")
  Future<FavoriteStatusResponse> checkFavoriteStatus(
    @Path("placeId") int placeId,
  );

  /// Get favorite statistics
  @GET("favorites/stats")
  Future<FavoriteStatsResponse> getFavoriteStats();

  // ========== REACTIONS ENDPOINTS ==========

  /// Toggle reaction for a place
  @POST("places/{placeId}/reactions")
  Future<ReactionResponse> toggleReaction({
    @Path("placeId") required int placeId,
    @Body() required Map<String, dynamic> body,
  });

  /// Get user's reaction for a place
  @GET("places/{placeId}/reactions/my-reaction")
  Future<MyReactionResponse> getMyReaction({
    @Path("placeId") required int placeId,
  });

  /// Get reaction statistics for a place
  @GET("places/{placeId}/reactions/stats")
  Future<ReactionStatsResponse> getReactionStats({
    @Path("placeId") required int placeId,
  });

  /// Delete user's reaction for a place
  @DELETE("places/{placeId}/reactions")
  Future<void> deleteReaction({
    @Path("placeId") required int placeId,
  });

  // ========== REVIEWS ENDPOINTS ==========

  /// Get all reviews with filters
  @GET("reviews")
  Future<ReviewListResponse> getReviews({
    @Query("place_id") int? placeId,
    @Query("rating") double? rating,
    @Query("page") int page = 1,
  });

  /// Create a new review
  @POST("reviews")
  Future<ReviewResponse> createReview(@Body() CreateReviewRequest request);

  /// Get reviews for a place
  @GET("reviews/place/{placeId}")
  Future<ReviewListResponse> getPlaceReviews({
    @Path("placeId") required int placeId,
    @Query("page") int page = 1,
    @Query("sort_by") String? sortBy,
    @Query("sort_order") String? sortOrder,
  });

  /// Get user's reviews
  @GET("reviews/my-reviews")
  Future<ReviewListResponse> getMyReviews({
    @Query("page") int page = 1,
  });

  /// Update a review
  @PUT("reviews/{reviewId}")
  Future<ReviewResponse> updateReview({
    @Path("reviewId") required int reviewId,
    @Body() required UpdateReviewRequest request,
  });

  /// Delete a review
  @DELETE("reviews/{reviewId}")
  Future<void> deleteReview(@Path("reviewId") int reviewId);

  // ========== MOVIE ENDPOINTS ==========
  @GET("places/movie")
  Future<MoviesResponse> getMovies();

  @GET("movies/{slug}")
  Future<MovileDetailResponse> getMovieDetail(@Path("slug") String slug);

  // ========== DATE PLAN ENDPOINTS ==========

  /// Get activity groups
  @GET("activity-groups")
  Future<ActivityGroupResponse> getActivityGroups();

  /// Generate a new plan
  @POST("plans")
  Future<CreatePlanResponse> createPlan(@Body() CreatePlanRequest request);

  /// Get saved plans
  @GET("plans/saved")
  Future<PlansResponse> getSavedPlans({
    @Query("page") int page = 20,
  });

  /// Save a plan
  @POST("plans/{planId}/save")
  Future<PlanDetailResponse> savePlan(@Path("planId") int planId);

  /// Delete a plan
  @DELETE("plans/{planId}")
  Future<void> deletePlan(@Path("planId") int planId);

  /// Get plan detail
  @GET("plans/{planId}")
  Future<PlanDetailResponse> getPlanDetail(@Path("planId") int planId);

  // ========== ANNOUNCEMENTS ENDPOINTS ==========
  /// Get all announcements
  @GET("announcements")
  Future<AnnouncementsResponse> getAnnouncements();
}
