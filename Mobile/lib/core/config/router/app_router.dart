import 'package:flutter/material.dart';

import 'package:go_router/go_router.dart';
import 'package:trove/core/config/global_keys.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:trove/presentation/bloc/bloc_factory.dart';
import 'package:trove/presentation/bloc/camera/camera_bloc.dart';
import 'package:trove/presentation/screen/camera/camera_screen.dart';
import 'package:trove/core/config/router/app_routes.dart';
import 'package:trove/presentation/screen/my_posts/my_posts_screen.dart';
import 'package:trove/presentation/screen/place_create/place_create_screen.dart';
import 'package:trove/presentation/screen/place_detail/place_detail_screen.dart';
import 'package:trove/presentation/screen/place/place_screen.dart';
import 'package:trove/presentation/screen/place_edit/place_edit_screen.dart';
import 'package:trove/presentation/screen/date/spin/spin_screen.dart';
import 'package:trove/presentation/screen/plan/plan_screen.dart';
import 'package:trove/presentation/screen/plan/create_plan_screen.dart';
import 'package:trove/models/place.dart';
import 'package:trove/presentation/screen/edit_info/edit_user_info_screen.dart';
import 'package:trove/core/config/themes/app_colors.dart';
import 'package:trove/presentation/screen/date/date_screen.dart';
import 'package:trove/presentation/screen/plan/detail_plan_screen.dart';
import 'package:trove/presentation/screen/fav_place/favorite_places_screen.dart';
import 'package:trove/presentation/screen/auth/change_password_screen.dart';
import 'package:trove/presentation/screen/notification/notification_screen.dart';
import 'package:trove/presentation/screen/announcement/announcement_screen.dart';
import 'package:trove/presentation/screen/in_app/in_app_screen.dart';
import 'package:trove/presentation/screen/movie/movie_screen.dart';
import 'package:trove/presentation/screen/google_map_search/google_map_search_screen.dart';
import 'package:trove/presentation/widgets/notification/nav_bar_visibility_notification.dart';
import 'package:trove/presentation/bloc/network/network_bloc.dart';
import 'package:trove/core/services/data_app_service.dart';
import 'package:trove/presentation/widgets/common/right_drawer_handle.dart';
import 'package:trove/presentation/screen/movie/movile_detail_screen.dart';
import 'package:trove/presentation/screen/image/image_view_screen.dart';
import 'dart:io'; // Added import for File

// Import các page
import 'package:trove/presentation/screen/splash/splash_screen.dart';
import 'package:trove/presentation/screen/support/submit_ticket_screen.dart';
import 'package:trove/presentation/screen/account/account_screen.dart';
import 'package:trove/presentation/screen/chatbox/chatbox_screen.dart';
import 'package:trove/presentation/screen/plan/smart_ai_planner_screen.dart';
import 'package:trove/presentation/screen/auth/auth_screen.dart';
import 'package:trove/presentation/screen/auth/forgot_password_screen.dart';
import 'package:trove/presentation/widgets/app_drawer.dart';
import 'package:trove/presentation/widgets/policy/privacy_policy_screen.dart';
import 'package:trove/presentation/widgets/policy/terms_of_use_screen.dart';

final GoRouter appRouter = GoRouter(
  navigatorKey: navigatorKey,
  initialLocation: AppRoutes.splash,
  routes: [
    GoRoute(
      path: AppRoutes.splash,
      name: 'splash',
      builder: (context, state) => SplashScreen(),
    ),
    // TODO: Thêm OnboardingScreen sau
    // GoRoute(
    //   path: RoutePaths.onboarding,
    //   name: 'onboarding',
    //   builder: (context, state) => OnboardingScreen(),
    // ),
    GoRoute(
      path: AppRoutes.support,
      name: 'support',
      builder: (context, state) => SubmitTicketScreen(),
    ),
    // Account tab is handled inside the stateful shell; no top-level route here
    GoRoute(
      path: AppRoutes.auth,
      name: 'auth',
      builder: (context, state) => AuthScreen(),
    ),
    GoRoute(
      path: AppRoutes.forgotPassword,
      name: 'forgotPassword',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: AppRoutes.announcements,
      name: 'announcements',
      builder: (context, state) => const AnnouncementScreen(),
    ),
    GoRoute(
      path: AppRoutes.inApp,
      name: 'inApp',
      builder: (context, state) => const InAppScreen(),
    ),
    GoRoute(
      path: AppRoutes.movies,
      name: 'movies',
      builder: (context, state) => const MovieScreen(),
    ),
    GoRoute(
      path: AppRoutes.movieDetail,
      name: 'movieDetail',
      builder: (context, state) {
        final slug = state.pathParameters['slug']!;
        return MovieDetailScreen(slug: slug);
      },
    ),
    GoRoute(
      path: AppRoutes.imageView,
      name: 'imageView',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>;
        final imageUrls = extra['imageUrls'] as List<String>;
        final initialIndex = extra['initialIndex'] as int;
        return ImageViewScreen(
            imageUrls: imageUrls, initialIndex: initialIndex);
      },
    ),
    GoRoute(
      path: AppRoutes.googleMapSearch,
      name: 'googleMapSearch',
      builder: (context, state) => const GoogleMapSearchScreen(),
    ),
    GoRoute(
      path: AppRoutes.paywall,
      name: 'paywall',
      builder: (context, state) => const InAppScreen(),
    ),
    GoRoute(
      path: AppRoutes.privacyPolicy,
      name: 'privacyPolicy',
      builder: (context, state) => const PrivacyPolicyScreen(),
    ),
    GoRoute(
      path: AppRoutes.termsOfUse,
      name: 'termsOfUse',
      builder: (context, state) => const TermsOfUseScreen(),
    ),
    GoRoute(
      path: AppRoutes.placeCreate,
      name: 'placeCreate',
      builder: (context, state) {
        final images = state.extra as List<File>?;
        return CreatePlaceScreen(initialImages: images);
      },
    ),
    // ⚠️ IMPORTANT: placeEdit must come BEFORE placeDetail
    // Otherwise /places/123/edit will match /places/:id instead
    GoRoute(
      path: AppRoutes.placeEdit,
      name: 'placeEdit',
      builder: (context, state) {
        final place = state.extra as Place;
        return PlaceEditScreen(place: place);
      },
    ),
    GoRoute(
      path: AppRoutes.placeDetail,
      name: 'placeDetail',
      builder: (context, state) => PlaceDetailScreen(
        placeId: state.pathParameters['id']!,
      ),
    ),
    // --- Main shell with preserved tab state ---
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return _MainShellScaffold(navigationShell: navigationShell);
      },
      branches: [
        // Home branch
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: AppRoutes.camera,
              name: 'camera',
              builder: (context, state) => BlocProvider<LocketCameraBloc>(
                create: (context) => blocFactory.createLocketCameraBloc(),
                child: const TroveCameraScreen(),
              ),
            ),
          ],
        ),
        // Places branch (with detail nested)
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: AppRoutes.places,
              name: 'places',
              builder: (context, state) => PlaceScreen(),
            ),
          ],
        ),
        // Date Night branch
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: AppRoutes.date,
              name: 'dateTab',
              builder: (context, state) => const DateScreen(),
              routes: [
                GoRoute(
                  path: 'plan-detail/:id',
                  name: 'planDetail',
                  builder: (context, state) {
                    final id = int.parse(state.pathParameters['id']!);
                    return DetailPlanScreen(planId: id);
                  },
                ),
                GoRoute(
                  path: 'spin',
                  name: 'dateSpin',
                  builder: (context, state) => const SpinScreen(),
                ),
                GoRoute(
                  path: 'smart-ai-planner',
                  name: 'smartAIPlanner',
                  builder: (context, state) => const SmartAIPlannerScreen(),
                ),
                GoRoute(
                  path: 'plan',
                  name: 'datePlan',
                  builder: (context, state) => PlanScreen(),
                  routes: [
                    GoRoute(
                      path: 'create',
                      name: 'planCreate',
                      builder: (context, state) => CreatePlanScreen(),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        // Chatbox AI branch
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: AppRoutes.chatbox,
              name: 'chatboxTab',
              builder: (context, state) => const ChatboxScreen(),
            ),
          ],
        ),
        // Account branch
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: AppRoutes.account,
              name: 'accountTab',
              builder: (context, state) => AccountScreen(),
              routes: [
                GoRoute(
                  path: 'my-posts',
                  name: 'accountMyPosts',
                  builder: (context, state) => const MyPostsScreen(),
                ),
                GoRoute(
                  path: 'favorites',
                  name: 'accountFavorites',
                  builder: (context, state) => const FavoritePlacesScreen(),
                ),
                GoRoute(
                  path: 'change-password',
                  name: 'accountChangePassword',
                  builder: (context, state) => const ChangePasswordScreen(),
                ),
                GoRoute(
                  path: 'notifications',
                  name: 'accountNotifications',
                  builder: (context, state) => NotificationScreen(),
                ),
                GoRoute(
                  path: 'announcements',
                  name: 'accountAnnouncements',
                  builder: (context, state) => const AnnouncementScreen(),
                ),
                GoRoute(
                  path: 'edit-profile',
                  name: 'accountEditProfile',
                  builder: (context, state) => const EditUserInfoScreen(),
                ),
              ],
            ),
          ],
        ),
      ],
    ),

    // (Categories tab now lives inside the shell)

    // // --- Movies group ---
    // GoRoute(
    //   path: RoutePaths.movies,
    //   name: 'movies',
    //   builder: (context, state) => const MoviesTabScreen(),
    //   routes: [
    //     GoRoute(
    //       path: 'schedule',
    //       name: 'movieSchedule',
    //       builder: (context, state) => const MovieScheduleScreen(),
    //     ),
    //   ],
    // ),

    // --- Plans group ---
    // GoRoute(
    //   path: RoutePaths.plans,
    //   name: 'plans',
    //   builder: (context, state) => const PlanListScreen(),
    //   routes: [
    //     GoRoute(
    //       path: ':id',
    //       name: 'planDetail',
    //       builder: (context, state) {
    //         final id = state.pathParameters['id']!;
    //         return PlaceDetailScreen(planId: id);
    //       },
    //     ),
    //   ],
    // ),
  ],
);

class _MainShellScaffold extends StatefulWidget {
  final StatefulNavigationShell navigationShell;

  const _MainShellScaffold({required this.navigationShell});

  @override
  State<_MainShellScaffold> createState() => _MainShellScaffoldState();
}

class _MainShellScaffoldState extends State<_MainShellScaffold> {
  final ValueNotifier<bool> _isBottomVisible = ValueNotifier<bool>(true);

  @override
  void dispose() {
    _isBottomVisible.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return NotificationListener<NavBarVisibilityNotification>(
      onNotification: (notification) {
        _isBottomVisible.value = notification.isVisible;
        return true;
      },
      child: ValueListenableBuilder<bool>(
        valueListenable: _isBottomVisible,
        builder: (context, visible, child) {
          final bottomInset = MediaQuery.of(context).padding.bottom;
          final targetHeight =
              visible ? kBottomNavigationBarHeight + bottomInset + 2 : 0.0;

          return Scaffold(
            endDrawer: const AppDrawer(), // Available from right side
            body: Stack(
              children: [
                widget.navigationShell,
                const RightDrawerHandle(),
              ],
            ),
            bottomNavigationBar: AnimatedContainer(
              duration: const Duration(milliseconds: 280),
              curve: Curves.easeInOut,
              height: targetHeight,
              child: ClipRect(
                child: Align(
                  alignment: Alignment.topCenter,
                  heightFactor: 1,
                  child: visible
                      ? BlocBuilder<NetworkBloc, NetworkState>(
                          builder: (context, networkState) {
                            return Column(
                              children: [
                                if (networkState is NetworkFailure)
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.orange.shade50,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Center(
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.wifi_off,
                                            color: Colors.orange.shade700,
                                            size: 16,
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            'Mất kết nối Internet',
                                            style: TextStyle(
                                              color: Colors.orange.shade700,
                                              fontWeight: FontWeight.w700,
                                            ),
                                            textAlign: TextAlign.center,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                Theme(
                                  data: Theme.of(context).copyWith(
                                    splashFactory: NoSplash.splashFactory,
                                    highlightColor: Colors.transparent,
                                  ),
                                  child: ValueListenableBuilder<AppMetrics>(
                                    valueListenable:
                                        DataAppService.instance.rxMetrics,
                                    builder: (context, metrics, child) {
                                      final claimingCount =
                                          metrics.claimingTotal;
                                      return _CustomBottomNavigationBar(
                                        currentIndex:
                                            widget.navigationShell.currentIndex,
                                        onTap: (index) => widget.navigationShell
                                            .goBranch(index),
                                        claimingCount: claimingCount,
                                      );
                                    },
                                  ),
                                ),
                              ],
                            );
                          },
                        )
                      : const SizedBox.shrink(),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _CustomBottomNavigationBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final int claimingCount;

  const _CustomBottomNavigationBar({
    required this.currentIndex,
    required this.onTap,
    required this.claimingCount,
  });

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            height: kBottomNavigationBarHeight,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(
                  context: context,
                  index: 0,
                  icon: Icons.camera_alt_outlined,
                  label: 'Camera',
                ),
                _buildNavItem(
                  context: context,
                  index: 1,
                  icon: Icons.location_on_outlined,
                  label: 'Địa điểm',
                ),
                _buildNavItem(
                  context: context,
                  index: 2,
                  icon: Icons.calendar_today_outlined,
                  label: 'Lên kế hoạch',
                  badgeCount: claimingCount,
                ),
                _buildNavItem(
                  context: context,
                  index: 3,
                  icon: Icons.auto_awesome_outlined,
                  label: 'Trợ lý AI',
                ),
                _buildNavItem(
                  context: context,
                  index: 4,
                  icon: Icons.person_outline,
                  label: 'Tôi',
                ),
              ],
            ),
          ),
          SizedBox(height: bottomPadding),
        ],
      ),
    );
  }

  Widget _buildNavItem({
    required BuildContext context,
    required int index,
    required IconData icon,
    required String label,
    int? badgeCount,
  }) {
    final isSelected = currentIndex == index;
    final color = isSelected ? primaryColor : Colors.black87;

    return Expanded(
      child: InkWell(
        onTap: () => onTap(index),
        splashFactory: NoSplash.splashFactory,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Top indicator line
            Container(
              height: 3,
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: isSelected ? primaryColor : Colors.transparent,
                borderRadius: BorderRadius.circular(1.5),
              ),
            ),
            const SizedBox(height: 8),
            // Icon with optional badge
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                Icon(
                  icon,
                  size: 22,
                  color: color,
                ),
                if (badgeCount != null && badgeCount > 0)
                  Positioned(
                    top: -4,
                    right: -10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 5,
                        vertical: 1,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.redAccent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        badgeCount > 99 ? '99+' : '$badgeCount',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            // Label
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: color,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
