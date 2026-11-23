// lib/services/place_service.dart
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:trove/data/response/place/places_detail_response.dart';
import '../models/place.dart';
import '../models/category.dart';
import '../data/data_sources/remote/api_client.dart';
import '../data/request/place.dart';
import '../data/request/category.dart';
import '../data/request/review.dart';
import '../data/response/place/place_create_response.dart';
import '../data/response/place/place_delete_response.dart';
import '../data/response/place/place_update_response.dart';
import '../data/response/place/user_posts_response.dart';
import '../data/response/place/place_images_response.dart';
import '../data/response/place/place_image_delete_response.dart';
import '../data/response/place/favorite_place_response.dart';
import '../data/response/place/favorite_place_list_response.dart';
import '../data/response/place/favorite_status_response.dart';
import '../data/response/place/favorite_stats_response.dart';
import '../data/response/place/review_response.dart';
import '../data/response/place/review_list_response.dart';
import '../data/response/place/reaction_response.dart';

import '../data/response/place/reaction_stats_response.dart';

class PlaceService {
  final ApiClient _apiClient;

  PlaceService(this._apiClient);

  // ✅ Get all places - Direct mapping, no conversion needed!
  Future<List<Place>> getPlaces({
    int page = 1,
    int? perPage,
    int? categoryId,
    List<int>? categoryIds,
    List<int>? activityGroupIds,
    int? priceMin,
    int? priceMax,
    double? latitude,
    double? longitude,
    int? distanceKm,
    List<String>? tags,
    List<int>? tagIds,
    String? sortBy,
    String? sortOrder,
    String? searchQuery,
  }) async {
    try {
      // ✅ Chỉ dùng categoryIds (array format), không gửi categoryId nữa
      // Nếu có categoryId đơn lẻ, chuyển thành categoryIds = [categoryId]
      final finalCategoryIds = categoryIds?.isNotEmpty == true
          ? categoryIds
          : (categoryId != null ? [categoryId] : null);

      final response = await _apiClient.appService.getPlaces(
        categoryId: null, // ✅ Không gửi categoryId nữa, chỉ dùng categoryIds
        categoryIds: finalCategoryIds,
        activityGroupIds:
            activityGroupIds?.isNotEmpty == true ? activityGroupIds : null,
        priceMin: priceMin,
        priceMax: priceMax,
        latitude: latitude,
        longitude: longitude,
        distanceKm: distanceKm,
        tags: tags?.isNotEmpty == true ? tags : null,
        tagIds: tagIds?.isNotEmpty == true ? tagIds : null,
        sortBy: sortBy,
        sortOrder: sortOrder,
        searchQuery: searchQuery,
        page: page,
        perPage: perPage,
      );

      if (response.data?.places?.isEmpty ?? true) {
        print("⚠️ PlaceService: Places list empty! Returning empty list");
        return [];
      }

      // ✅ Ultra-simple direct mapping - No conversion needed!
      final places = response.data!.places!
          .map((placeJson) => Place.fromMap(placeJson.toJson()))
          .toList();

      return places;
    } catch (e) {
      print("❌ PlaceService error: $e");
      throw Exception('Failed to get places: $e');
    }
  }

  // ✅ Get places with filters - Direct mapping!
  // ⚠️ Deprecated: Nên dùng getPlaces() với categoryIds thay vì method này
  Future<List<Place>> getPlacesFiltered({
    String? category,
    int? categoryId,
    int page = 1,
  }) async {
    try {
      // ✅ Chuyển categoryId thành categoryIds format
      final categoryIds = categoryId != null ? [categoryId] : null;
      final response = await _apiClient.appService.getPlaces(
        category: category,
        categoryId: null,
        categoryIds: categoryIds,
        page: page,
      );
      final models = response.data?.places ?? [];
      return models.map((m) => Place.fromMap(m.toJson())).toList();
    } catch (e) {
      throw Exception('Failed to get filtered places: $e');
    }
  }

  // ✅ Search places - Direct mapping!
  Future<List<Place>> searchPlaces(String query) async {
    try {
      final response = await _apiClient.appService
          .searchPlaces(query, filterRequest: PlaceFilterRequest());
      return response.data!.places!
          .map((model) => Place.fromMap(model.toJson()))
          .toList();
    } catch (e) {
      throw Exception('Failed to search places: $e');
    }
  }

  // ✅ Get place by ID - Direct mapping!
  Future<PlaceDetailData?> getPlaceById(String id) async {
    try {
      final response = await _apiClient.appService.getPlace(id);

      if (response.data != null) {
        return response.data;
      } else {
        print("❌ PlaceService: Response hoặc data null");
        return null;
      }
    } catch (e) {
      print("❌ PlaceService error: $e");
      throw Exception('Failed to get place: $e');
    }
  }

  // ✅ No conversion methods needed - Direct mapping!

  // ===== Categories =====
  Future<List<Category>> getCategories() async {
    try {
      final res = await _apiClient.appService.getCategories();
      final models = res.data ?? [];
      return models
          .map((m) => Category(
                id: m.id ?? 0,
                name: m.name ?? '',
                displayName: m.displayName ?? (m.name ?? ''),
                description: m.description,
                isActive: m.isActive ?? true,
                createdAt:
                    m.createdAt != null ? DateTime.parse(m.createdAt!) : null,
                updatedAt:
                    m.updatedAt != null ? DateTime.parse(m.updatedAt!) : null,
              ))
          .toList();
    } catch (e) {
      throw Exception('Failed to load categories: $e');
    }
  }

  Future<Category> createCategory({
    required String name,
    required String displayName,
    String? description,
  }) async {
    try {
      final response =
          await _apiClient.appService.createCategory(CreateCategoryRequest(
        name: name,
        displayName: displayName,
        description: description,
      ));

      final created = response.data;
      if (created == null) {
        throw Exception('Create category returned empty data');
      }

      return Category(
        id: created.id ?? 0,
        name: created.name ?? '',
        displayName: created.displayName ?? (created.name ?? ''),
        description: created.description,
        isActive: created.isActive ?? true,
        createdAt: created.createdAt != null
            ? DateTime.parse(created.createdAt!)
            : null,
        updatedAt: created.updatedAt != null
            ? DateTime.parse(created.updatedAt!)
            : null,
      );
    } catch (e) {
      throw Exception('Failed to create category: $e');
    }
  }

  // ✅ Create place
  Future<PlaceCreateResponse> createPlace({
    required String placeData,
    List<File>? images,
  }) async {
    try {
      final response = await _apiClient.appService.createPlace(
        placeData: placeData,
        files: images,
      );

      return response;
    } catch (e) {
      print("❌ PlaceService createPlace error: $e");
      throw Exception('Failed to create place: $e');
    }
  }

  // ✅ Create place (V2) - send fields directly as multipart per backend spec
  Future<PlaceCreateResponse> createPlaceV2({
    required CreatePlaceRequest request,
    List<File> images = const [],
  }) async {
    try {
      final mpFiles = <MultipartFile>[];
      for (final file in images) {
        final filename = file.path.split('/').last;
        mpFiles
            .add(await MultipartFile.fromFile(file.path, filename: filename));
      }
      final form = await request.toFormData(images: mpFiles);

      final res = await _apiClient.dio.post('api/places', data: form);
      return PlaceCreateResponse.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      print("❌ PlaceService createPlaceV2 error: $e");
      rethrow;
    }
  }

  // ✅ Upload images for place
  Future<PlaceImagesResponse> uploadImages({
    required int placeId,
    required List<File> images,
  }) async {
    try {
      final response = await _apiClient.appService.uploadPlaceImages(
        placeId: placeId,
        files: images,
      );

      return response;
    } catch (e) {
      print("❌ PlaceService uploadImages error: $e");
      throw Exception('Failed to upload images: $e');
    }
  }

  // ✅ Delete place
  Future<PlaceDeleteResponse> deletePlace(int placeId) async {
    try {
      final response = await _apiClient.appService.deletePlace(placeId);

      return response;
    } catch (e) {
      print("❌ PlaceService deletePlace error: $e");
      throw Exception('Failed to delete place: $e');
    }
  }

  // ✅ Update place
  Future<PlaceUpdateResponse> updatePlace({
    required int placeId,
    required UpdatePlaceRequest request,
    List<File>? images,
  }) async {
    try {
      final formData = await request.toFormData(images: images);
      final response = await _apiClient.appService.updatePlace(
        placeId: placeId,
        body: formData,
      );
      return response;
    } catch (e) {
      throw Exception('Failed to update place: $e');
    }
  }

  // ✅ Get current user's places
  Future<UserPostsResponse> getMyPlaces({
    int page = 1,
    String? status,
  }) async {
    try {
      final response = await _apiClient.appService.getMyPlaces(
        page: page,
        status: status,
      );

      if (response.success) {
        return response;
      } else {
        print("❌ PlaceService: Get my places thất bại");
        throw Exception(response.message);
      }
    } catch (e) {
      print('❌ PlaceService: Get my places error: $e');
      rethrow;
    }
  }

  Future<PlaceImagesResponse> getPlaceImages({
    required int placeId,
    int page = 1,
  }) async {
    try {
      final res = await _apiClient.appService.getPlaceImages(
        placeId: placeId,
        page: page,
      );
      return res;
    } catch (e) {
      throw Exception('Failed to load images: $e');
    }
  }

  Future<PlaceImageDeleteResponse> deletePlaceImage({
    required int placeId,
    required int imageId,
  }) async {
    try {
      final res = await _apiClient.appService.deletePlaceImage(
        placeId: placeId,
        imageId: imageId,
      );
      return res;
    } catch (e) {
      throw Exception('Failed to delete image: $e');
    }
  }

  // ===== Favorites =====
  Future<FavoritePlaceResponse> toggleFavoritePlace(int placeId) async {
    try {
      final response = await _apiClient.appService.toggleFavoritePlace({
        'place_id': placeId,
      });

      return response;
    } catch (e) {
      print("❌ PlaceService toggleFavoritePlace error: $e");
      throw Exception('Failed to toggle favorite: $e');
    }
  }

  Future<FavoritePlaceListResponse> getFavoritePlaces({
    int page = 1,
  }) async {
    try {
      final response = await _apiClient.appService.getFavoritePlaces(
        page: page,
      );

      return response;
    } catch (e) {
      print("❌ PlaceService getFavoritePlaces error: $e");
      throw Exception('Failed to get favorite places: $e');
    }
  }

  // ✅ Get my favorite places
  Future<List<Place>> getMyFavoritePlaces({
    int page = 1,
  }) async {
    try {
      final response = await _apiClient.appService.getMyFavoritePlaces(
        page: page,
      );

      if (response.data?.places?.isEmpty ?? true) {
        print("⚠️ PlaceService: My favorite places list empty!");
        return [];
      }

      // Map PlaceModel to Place
      final places = response.data!.places!
          .map((placeJson) => Place.fromMap(placeJson.toJson()))
          .toList();
      return places;
    } catch (e) {
      print("❌ PlaceService getMyFavoritePlaces error: $e");
      throw Exception('Failed to get my favorite places: $e');
    }
  }

  Future<FavoriteStatusResponse> checkFavoriteStatus(int placeId) async {
    try {
      final response = await _apiClient.appService.checkFavoriteStatus(placeId);

      return response;
    } catch (e) {
      print("❌ PlaceService checkFavoriteStatus error: $e");
      throw Exception('Failed to check favorite status: $e');
    }
  }

  Future<FavoriteStatsResponse> getFavoriteStats() async {
    try {
      final response = await _apiClient.appService.getFavoriteStats();

      return response;
    } catch (e) {
      print("❌ PlaceService getFavoriteStats error: $e");
      throw Exception('Failed to get favorite stats: $e');
    }
  }

  // ========== REVIEW METHODS ==========

  Future<ReviewResponse> createReview(CreateReviewRequest request) async {
    try {
      final response = await _apiClient.appService.createReview(request);

      return response;
    } catch (e) {
      print("❌ PlaceService createReview error: $e");
      throw Exception('Failed to create review: $e');
    }
  }

  Future<ReviewListResponse> getPlaceReviews({
    required int placeId,
    int page = 1,
  }) async {
    try {
      final response = await _apiClient.appService.getPlaceReviews(
        placeId: placeId,
        page: page,
      );

      return response;
    } catch (e) {
      print("❌ PlaceService getPlaceReviews error: $e");
      throw Exception('Failed to get place reviews: $e');
    }
  }

  Future<ReviewListResponse> getMyReviews({
    int page = 1,
  }) async {
    try {
      final response = await _apiClient.appService.getMyReviews(
        page: page,
      );

      return response;
    } catch (e) {
      print("❌ PlaceService getMyReviews error: $e");
      throw Exception('Failed to get my reviews: $e');
    }
  }

  Future<ReviewResponse> updateReview({
    required int reviewId,
    required UpdateReviewRequest request,
  }) async {
    try {
      final response = await _apiClient.appService.updateReview(
        reviewId: reviewId,
        request: request,
      );

      return response;
    } catch (e) {
      print("❌ PlaceService updateReview error: $e");
      throw Exception('Failed to update review: $e');
    }
  }

  Future<void> deleteReview(int reviewId) async {
    try {
      await _apiClient.appService.deleteReview(reviewId);
    } catch (e) {
      print("❌ PlaceService deleteReview error: $e");
      throw Exception('Failed to delete review: $e');
    }
  }

  // ========== REACTIONS ==========

  /// Toggle reaction for a place
  Future<ReactionResponse> toggleReaction(int placeId, int reactionType) async {
    try {
      final response = await _apiClient.appService.toggleReaction(
        placeId: placeId,
        body: {'reaction_type': reactionType},
      );

      return response;
    } catch (e) {
      print("❌ PlaceService toggleReaction error: $e");
      throw Exception('Failed to toggle reaction: $e');
    }
  }

  /// Get user's reaction for a place
  Future<int?> getMyReaction(int placeId) async {
    try {
      final response = await _apiClient.appService.getMyReaction(
        placeId: placeId,
      );

      return response.data?.reactionType;
    } catch (e) {
      print("❌ PlaceService getMyReaction error: $e");
      // Return null if no reaction found
      return null;
    }
  }

  /// Get reaction statistics for a place
  Future<ReactionStatsResponse> getReactionStats(int placeId) async {
    try {
      final response = await _apiClient.appService.getReactionStats(
        placeId: placeId,
      );

      return response;
    } catch (e) {
      print("❌ PlaceService getReactionStats error: $e");
      throw Exception('Failed to get reaction stats: $e');
    }
  }
}
