// lib/presentation/bloc/bloc_factory.dart
import '../../core/services/service_provider.dart';
import 'place/place_bloc.dart';
import 'place/place_detail/place_detail_bloc.dart';
import 'auth/auth_bloc.dart';
import 'account/account_bloc.dart';
import 'category/category_bloc.dart';
import 'map/map_bloc.dart';
import 'splash/splash_bloc.dart';
import 'search_map/search_bloc.dart';
import 'favorite/favorite_bloc.dart';
import 'movie/movie_bloc.dart';
import 'movie/detail/movie_detail_bloc.dart';
import 'spin/spin_bloc.dart';
import 'place/place_edit/place_edit_bloc.dart';
import 'activity_group/activity_group_bloc.dart';
import 'plan/plan_bloc.dart';
import 'camera/camera_bloc.dart';
import 'plan/plan_detail_bloc.dart';
import 'google_map_search/google_map_search_bloc.dart';
import 'announcement/announcements_bloc.dart';
import 'filter_sheet/filter_sheet_bloc.dart';
import '../../data/repository/announcement_repository.dart';
import '../../presentation/screen/place/widgets/filter/filter_model.dart';

/// Factory để tạo BLoCs với dependencies từ ServiceProvider
class BlocFactory {
  static final BlocFactory _instance = BlocFactory._internal();
  factory BlocFactory() => _instance;
  BlocFactory._internal();

  // ✅ Place BLoCs
  PlaceBloc createPlaceBloc({bool isMyPlace = false}) {
    return PlaceBloc(
      placeService: serviceProvider.placeService,
      favoriteService: serviceProvider.favoriteService,
      categoryService: serviceProvider.categoryService,
      placeFilterService: serviceProvider.placeFilterService,
      isMyPlace: isMyPlace,
    );
  }

  PlaceDetailBloc createPlaceDetailBloc() {
    return PlaceDetailBloc(
      placeService: serviceProvider.placeService,
      favoriteService: serviceProvider.favoriteService,
    );
  }

  ActivityGroupBloc createActivityGroupBloc() {
    return ActivityGroupBloc(
      categoryService: serviceProvider.categoryService,
    );
  }

  // ✅ Place Edit BLoCs
  PlaceEditBloc createPlaceEditBloc() {
    return PlaceEditBloc(
      placeService: serviceProvider.placeService,
      categoryService: serviceProvider.categoryService,
    );
  }

  // ✅ Auth BLoCs
  AuthBloc createAuthBloc() {
    return AuthBloc(
      authService: serviceProvider.authService,
      fcmService: serviceProvider.fcmService,
    );
  }

  // ✅ Account BLoCs
  AccountBloc createAccountBloc() {
    return AccountBloc(accountService: serviceProvider.accountService);
  }

  // ✅ Category BLoCs
  CategoryBloc createCategoryBloc() {
    return CategoryBloc(categoryService: serviceProvider.categoryService);
  }

  // ✅ Map BLoCs
  MapBloc createMapBloc() {
    return MapBloc(mapboxService: serviceProvider.mapboxService);
  }

  // ✅ Search Map BLoCs
  SearchMapBloc createSearchMapBloc() {
    return SearchMapBloc(mapboxService: serviceProvider.mapboxService);
  }

  // ✅ Splash BLoCs
  SplashBloc createSplashBloc(AuthBloc authBloc) {
    return SplashBloc(
      authService: serviceProvider.authService,
      authBloc: authBloc,
      appPreferences: serviceProvider.appPreferences,
    );
  }

  // ✅ Favorite BLoCs
  FavoriteBloc createFavoriteBloc() {
    return FavoriteBloc(favoriteService: serviceProvider.favoriteService);
  }

  // ✅ Movie BLoCs
  MovieBloc createMovieBloc() {
    return MovieBloc(movieService: serviceProvider.movieService);
  }

  MovieDetailBloc createMovieDetailBloc() {
    return MovieDetailBloc(movieService: serviceProvider.movieService);
  }

  // ✅ Spin BLoCs
  SpinBloc createSpinBloc() {
    return SpinBloc(favoriteService: serviceProvider.favoriteService);
  }

  // ✅ Plan BLoCs
  PlanBloc createPlanBloc() {
    return PlanBloc(planService: serviceProvider.planService);
  }

  PlanDetailBloc createPlanDetailBloc() {
    return PlanDetailBloc(planService: serviceProvider.planService);
  }

  // ✅ Locket Camera BLoCs
  LocketCameraBloc createLocketCameraBloc() {
    return LocketCameraBloc();
  }

  // ✅ Google Map Search BLoCs
  GoogleMapSearchBloc createGoogleMapSearchBloc() {
    return GoogleMapSearchBloc(
      serpApiService: serviceProvider.serpApiService,
    );
  }

  // ✅ Announcements BLoCs
  AnnouncementsBloc createAnnouncementsBloc() {
    return AnnouncementsBloc(
      AnnouncementRepository(serviceProvider.announcementService),
    );
  }

  // ✅ Filter Sheet BLoCs
  FilterSheetBloc createFilterSheetBloc({FilterOptions? initialFilters}) {
    return FilterSheetBloc(
      categoryService: serviceProvider.categoryService,
      initialFilters: initialFilters,
    );
  }
}

// ✅ Global instance
final blocFactory = BlocFactory();
