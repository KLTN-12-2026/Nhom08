// lib/core/services/service_provider.dart
import '../../data/service/announcement_service.dart';
import '../../data/data_sources/remote/api_client.dart';
import '../../services/place_service.dart';
import '../../services/place_filter_service.dart';
import '../../services/auth_service.dart';
import '../../services/account_service.dart';
import '../../services/activity_service.dart';
import '../../services/category_cache_service.dart';
import '../../services/chat_service.dart';
import '../../services/mapbox_service.dart';
import '../../services/favorite_service.dart';
import '../../services/review_service.dart';
import '../../services/movie_service.dart';
import '../../services/plan_service.dart';
import '../../services/serpapi_service.dart';
import '../../services/weather_service.dart';
import '../../services/cloudinary_service.dart';
import '../services/fcm_service.dart';
import '../../data/data_sources/local/app_prefs.dart';
import '../data/data_main.dart';
import 'data_app_service.dart';
import '../config/serpapi_config.dart';
import '../config/api_mode.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Simple service provider thay thế GetIt
class ServiceProvider {
  static final ServiceProvider _instance = ServiceProvider._internal();
  factory ServiceProvider() => _instance;
  ServiceProvider._internal();

  // ✅ Services
  late final ApiClient _apiClient;
  late final PlaceService _placeService;
  late final AnnouncementService _announcementService;
  late final PlaceFilterService _placeFilterService;
  late final AuthService _authService;
  late final AccountService _accountService;
  late final CategoryService _categoryService;
  late final CategoryCacheService _categoryCacheService;
  late final ChatService _chatService;
  late final MapboxService _mapboxService;
  late final FavoriteService _favoriteService;
  late final ReviewService _reviewService;
  late final MovieService _movieService;
  late final PlanService _planService;
  // Khởi tạo SerpAPI service ngay trong constructor để đảm bảo luôn sẵn sàng
  // Sử dụng API key từ config
  final SerpApiService _serpApiService = SerpApiService(
    apiKey: SerpApiConfig.apiKey,
  );
  final WeatherService _weatherService = WeatherService();
  final CloudinaryService _cloudinaryService = CloudinaryService();
  late final FcmService _fcmService;
  late final AppPreferences _appPreferences;

  // ✅ DataMain - Global data storage
  final DataMain _dataMain = DataMain();

  // ✅ DataAppService - App metrics and data
  final DataAppService _dataAppService = DataAppService.instance;

  // ✅ Initialize all services
  Future<void> initialize() async {
    // Initialize SharedPreferences
    final sharedPreferences = await SharedPreferences.getInstance();
    _appPreferences = AppPreferences(sharedPreferences);

    // ✅ Check API mode từ SharedPreferences và sử dụng baseUrl tương ứng
    String baseUrl;
    try {
      const String apiModeKey = 'api_mode';
      final savedMode = sharedPreferences.getString(apiModeKey);

      ApiMode mode;
      if (savedMode != null) {
        // Load từ SharedPreferences
        mode = ApiMode.values.firstWhere(
          (m) => m.name == savedMode,
          orElse: () => ApiMode.production,
        );
      } else {
        mode = ApiMode.production;
      }

      baseUrl = mode.baseUrl;
      print('✅ ServiceProvider: Initializing ApiClient with baseUrl: $baseUrl');
    } catch (e) {
      // Fallback về production nếu có lỗi
      print('⚠️ ServiceProvider: Error loading API mode, using production: $e');
      baseUrl = ApiMode.production.baseUrl;
    }

    // Initialize API client với baseUrl từ API mode
    _apiClient = ApiClient(
      baseUrl: baseUrl,
      onTokenExpired: () {
        print('Token expired - need to handle navigation');
      },
    );

    // Initialize services
    _placeService = PlaceService(_apiClient);
    _announcementService = AnnouncementService(_apiClient);
    _placeFilterService = PlaceFilterService();
    _authService = AuthService(_apiClient);
    _accountService = AccountService(_apiClient);
    _categoryCacheService = CategoryCacheService();
    await _categoryCacheService.init();
    _categoryService = CategoryService(
      apiClient: _apiClient,
      cacheService: _categoryCacheService,
    );
    _chatService = ChatService(_apiClient);
    _mapboxService = MapboxService();
    _favoriteService = FavoriteService(_apiClient);
    _reviewService = ReviewService(_apiClient);
    _movieService = MovieService(_apiClient);
    _planService = PlanService(_apiClient);
    // SerpAPI service đã được khởi tạo trong constructor
    _fcmService = FcmService(apiClient: _apiClient);

    // Fetch app-info khi khởi tạo app (không chặn luồng nếu lỗi)
    try {
      final info = await _apiClient.appService.getAppInfo();
      _dataAppService.updateAppInfo(info);
    } catch (e) {
      // Chỉ log trong debug, không làm crash app
      // ignore: avoid_print
      print('⚠️ ServiceProvider: Failed to load app-info: $e');
    }
  }

  // ✅ Getters
  ApiClient get apiClient => _apiClient;
  AnnouncementService get announcementService => _announcementService;
  PlaceService get placeService => _placeService;
  PlaceFilterService get placeFilterService => _placeFilterService;
  AuthService get authService => _authService;
  AccountService get accountService => _accountService;
  CategoryService get categoryService => _categoryService;
  CategoryCacheService get categoryCacheService => _categoryCacheService;
  ChatService get chatService => _chatService;
  MapboxService get mapboxService => _mapboxService;
  FavoriteService get favoriteService => _favoriteService;
  ReviewService get reviewService => _reviewService;
  MovieService get movieService => _movieService;
  PlanService get planService => _planService;
  SerpApiService get serpApiService => _serpApiService;
  WeatherService get weatherService => _weatherService;
  CloudinaryService get cloudinaryService => _cloudinaryService;
  FcmService get fcmService => _fcmService;
  AppPreferences get appPreferences => _appPreferences;
  DataMain get dataMain => _dataMain;
  DataAppService get dataAppService => _dataAppService;

  // ✅ Dispose resources
  void dispose() {
    // Services don't need explicit disposal
    // BLoCs will be disposed by their respective screens
  }
}

// ✅ Global instance
final serviceProvider = ServiceProvider();
