// lib/services/favorite_service.dart
import '../data/data_sources/remote/api_client.dart';
import '../data/response/place/favorite_place_list_response.dart';
import '../data/response/place/favorite_place_response.dart';
import '../data/response/place/places_response.dart';
import '../models/place.dart';

class FavoriteService {
  final ApiClient _apiClient;

  FavoriteService(this._apiClient);

  // ✅ Get favorite places using new API /api/places/my-favorites
  Future<FavoritePlaceListResponse> getFavoritePlaces({
    int page = 1,
  }) async {
    try {
      print("🔍 FavoriteService: Gọi API getMyFavoritePlaces...");
      print("🔍 FavoriteService: page=$page");

      // Call new API directly to get response with total
      final PlacesResponse apiResponse =
          await _apiClient.appService.getMyFavoritePlaces(
        page: page,
      );

      print("🔍 FavoriteService: API response received");
      print(
          "🔍 FavoriteService: Places count: ${apiResponse.data?.places?.length ?? 0}");
      print("🔍 FavoriteService: Total: ${apiResponse.data?.total ?? 0}");

      // Get places from response
      final places = apiResponse.data?.places ?? [];

      // Convert PlaceModel to Place
      final placeList =
          places.map((placeJson) => Place.fromMap(placeJson.toJson())).toList();

      // Convert List<Place> to FavoritePlaceListResponse format
      final favoriteItems = placeList.map((place) {
        return FavoritePlaceItem(
          id: int.tryParse(place.id) ?? 0,
          userId: int.tryParse(place.createdBy ?? '0') ?? 0,
          placeId: int.tryParse(place.id) ?? 0,
          createdAt: place.createdAt.toIso8601String(),
          place: PlaceInfo(
            id: int.tryParse(place.id) ?? 0,
            name: place.name,
            address: place.address,
            description: place.description,
            category: place.categories?.isNotEmpty == true
                ? place.categories!.first.displayName
                : '',
            rating: place.rating,
            latitude: place.latitude,
            longitude: place.longitude,
            status: null,
            userId: int.tryParse(place.createdBy ?? '0') ?? 0,
            createdAt: place.createdAt.toIso8601String(),
            images: place.images.map((item) => item.getAbsoluteUrl()).toList(),
            isFavorited: place.isFavorited,
            favoriteId: null,
            categoryId: place.categoryId,
            averagePrice: place.price,
            price: place.price,
          ),
        );
      }).toList();

      // Get total from API response
      final total = apiResponse.data?.total ?? favoriteItems.length;

      // Create response in expected format
      final response = FavoritePlaceListResponse(
        success: apiResponse.success ?? true,
        message: apiResponse.message ?? 'Success',
        data: FavoritePlaceListData(
          favorites: favoriteItems,
          total: total,
          page: page,
          perPage: 20, // Default value, không truyền lên API nữa
        ),
      );

      print(
          "✅ FavoriteService: Get favorite places thành công - ${favoriteItems.length} favorites");
      return response;
    } catch (e) {
      print('❌ FavoriteService: Get favorite places error: $e');
      rethrow;
    }
  }

  // ✅ Remove favorite place (deprecated - use toggleFavoritePlace instead)
  Future<void> removeFavoritePlace(int placeId) async {
    try {
      print("🔍 FavoriteService: Gọi API toggleFavorite với ID: $placeId");

      await toggleFavoritePlace(placeId);

      print("✅ FavoriteService: Remove favorite place thành công");
    } catch (e) {
      print("❌ FavoriteService removeFavoritePlace error: $e");
      throw Exception('Failed to remove favorite place: $e');
    }
  }

  // ✅ Toggle favorite place status
  Future<FavoritePlaceResponse> toggleFavoritePlace(int placeId) async {
    try {
      print("🔍 FavoriteService: Gọi API toggleFavoritePlace với ID: $placeId");

      final response = await _apiClient.appService.toggleFavoritePlace({
        'place_id': placeId,
      });

      print("✅ FavoriteService: Toggle favorite place thành công");
      return response;
    } catch (e) {
      print("❌ FavoriteService toggleFavoritePlace error: $e");
      throw Exception('Failed to toggle favorite place: $e');
    }
  }
}
