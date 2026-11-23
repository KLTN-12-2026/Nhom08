class AppRoutes {
  // Auth
  static const String auth = '/auth';
  static const String changePassword = '/change-password';
  static const String forgotPassword = '/forgot-password';

  // Core
  static const String splash = '/';
  static const String support = '/support';
  static const String account = '/account';
  static const String camera = '/camera';
  static const String inApp = '/in-app';
  static const String movies = '/movies';
  static const String movieDetail = '/movies/:slug';
  static const String googleMapSearch = '/google-map-search';
  static const String imageView = '/image-view';
  static const String chatbox = '/chatbox';

  // Places
  static const String places = '/places';
  static const String placeCreate = '/places/create';
  static const String placeDetail = '/places/:id';
  static const String placeEdit = '/places/:id/edit';

  // Date / Plan
  static const String date = '/date';
  static const String planDetail = '/date/plan-detail/:id';
  static const String dateSpin = '/date/spin';
  static const String datePlan = '/date/plan';
  static const String planCreate = '/date/plan/create';
  static const String smartAIPlanner = '/date/smart-ai-planner';

  // Account nested
  static const String accountMyPosts = '/account/my-posts';
  static const String accountFavorites = '/account/favorites';
  static const String accountNotifications = '/account/notifications';
  static const String announcements = '/announcements';
  static const String accountChangePassword = '/account/change-password';
  static const String accountEditProfile = '/account/edit-profile';

  // Premium / Subscription
  static const String paywall = '/paywall';

  // Policies (required for App Store compliance)
  static const String privacyPolicy = '/privacy-policy';
  static const String termsOfUse = '/terms-of-use';
}
