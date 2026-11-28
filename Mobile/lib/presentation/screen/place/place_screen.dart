import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:trove/presentation/bloc/auth/auth_bloc.dart';
import 'package:trove/presentation/bloc/auth/auth_state.dart';
import 'package:trove/presentation/bloc/bloc_factory.dart';
import 'package:trove/presentation/bloc/place_screen/place_screen_bloc.dart';
import 'package:trove/presentation/bloc/place/place_bloc.dart';
import 'package:trove/presentation/bloc/activity_group/activity_group_bloc.dart';
import 'package:trove/presentation/bloc/announcement/announcements_bloc.dart';
import 'package:trove/presentation/bloc/announcement/announcements_event.dart';
import 'package:trove/presentation/widgets/api_mode_badge.dart';
import 'package:trove/presentation/screen/place/widgets/filter/filter_model.dart';
import 'package:trove/presentation/screen/place/widgets/place_search_bar.dart';
import 'package:trove/presentation/screen/place/widgets/place_filter_chips.dart';
import 'package:trove/presentation/screen/place/widgets/activity_group_filter.dart';
import 'package:trove/presentation/screen/place/widgets/places_list.dart';
import 'package:trove/presentation/screen/place/widgets/place_tab.dart';
import 'package:trove/presentation/widgets/notification/nav_bar_visibility_notification.dart';
import 'package:trove/presentation/widgets/eula/eula_bottom_sheet.dart';

class PlaceScreen extends StatelessWidget {
  final bool isMyPlace;
  const PlaceScreen({Key? key, this.isMyPlace = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<PlaceBloc>(
          create: (context) {
            final bloc = blocFactory.createPlaceBloc(isMyPlace: isMyPlace)
              ..add(PlacesRequested())
              ..add(LocationRequested());
            return bloc;
          },
        ),
        BlocProvider<ActivityGroupBloc>(
          create: (context) => blocFactory.createActivityGroupBloc()
            ..add(const ActivityGroupsRequested()),
        ),
        BlocProvider<AnnouncementsBloc>(
          create: (context) =>
              blocFactory.createAnnouncementsBloc()..add(FetchAnnouncements()),
        ),
        BlocProvider<PlaceScreenBloc>(
          create: (_) => PlaceScreenBloc(),
        ),
      ],
      child: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, authState) {
          return _PlaceScreenContent(isMyPlace: isMyPlace);
        },
      ),
    );
  }
}

class _PlaceScreenContent extends StatefulWidget {
  final bool isMyPlace;
  const _PlaceScreenContent({Key? key, required this.isMyPlace})
      : super(key: key);

  @override
  State<_PlaceScreenContent> createState() => _PlaceScreenContentState();
}

class _PlaceScreenContentState extends State<_PlaceScreenContent> {
  final ScrollController _scrollController = ScrollController();
  static const String _eulaAcceptedKey = 'eula_accepted';

  @override
  void initState() {
    super.initState();
    // _scrollController.addListener(_onScroll); // Tắt auto-hide khi scroll
    // Show bottom navigation bar when entering this screen
    WidgetsBinding.instance.addPostFrameCallback((_) {
      NavBarVisibilityNotification(true).dispatch(context);
    });
    _checkAndShowEula();
  }

  Future<void> _checkAndShowEula() async {
    final prefs = await SharedPreferences.getInstance();
    final hasAcceptedEula = prefs.getBool(_eulaAcceptedKey) ?? false;

    if (!hasAcceptedEula && mounted) {
      await Future.delayed(const Duration(milliseconds: 500));

      if (mounted) {
        final accepted = await showEulaBottomSheet(context);

        if (accepted == true) {
          await prefs.setBool(_eulaAcceptedKey, true);
        } else {
          // User must accept EULA to use the app
          // Show again after a short delay
          await Future.delayed(const Duration(milliseconds: 300));
          if (mounted) {
            _checkAndShowEula();
          }
        }
      }
    }
  }

  @override
  void dispose() {
    // _scrollController.removeListener(_onScroll); // Không cần remove vì không add
    _scrollController.dispose();
    super.dispose();
  }

  // void _onScroll() {
  //   final offset = _scrollController.offset;
  //   context.read<PlaceScreenBloc>().add(UpdateScrollOffsetEvent(offset));
  // }

  @override
  Widget build(BuildContext context) {
    return BlocListener<PlaceScreenBloc, PlaceScreenState>(
      listenWhen: (previous, current) =>
          previous.isNavBarVisible != current.isNavBarVisible,
      listener: (context, state) {
        // Notify the app router to show/hide bottom navigation
        NavBarVisibilityNotification(state.isNavBarVisible).dispatch(context);
      },
      child: SafeArea(
        child: Scaffold(
          body: BlocBuilder<PlaceBloc, PlaceState>(
            builder: (context, state) {
              return RefreshIndicator(
                onRefresh: () async {
                  context.read<PlaceBloc>().add(const PlacesRefreshed());
                },
                child: NotificationListener<ScrollNotification>(
                  onNotification: (notification) {
                    if (notification.metrics.pixels >=
                            notification.metrics.maxScrollExtent - 200 &&
                        state is PlacesLoaded &&
                        state.hasMore &&
                        !state.isLoadingMore) {
                      context.read<PlaceBloc>().add(PlacesLoadMore(
                            categoryId: state.categoryId,
                            search: state.searchQuery,
                          ));
                    }
                    return false;
                  },
                  child: CustomScrollView(
                    controller: _scrollController,
                    physics: const AlwaysScrollableScrollPhysics(),
                    slivers: [
                      const SliverToBoxAdapter(
                        child: Padding(
                          padding: EdgeInsets.fromLTRB(16, 16, 16, 0),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: ApiModeBadge(),
                          ),
                        ),
                      ),
                      PlaceSearchBar(state: state),
                      _buildFilters(context, state),
                      PlacesList(state: state, isMyPlace: widget.isMyPlace),
                    ],
                  ),
                ),
              );
            },
          ),
          floatingActionButton: const PlaceFloatingActionButton(),
        ),
      ),
    );
  }

  Widget _buildFilters(BuildContext context, PlaceState state) {
    bool hasActiveFilters = false;
    if (state is PlacesLoaded && state.activeFilters != null) {
      hasActiveFilters = _hasActiveFilters(state.activeFilters!);
    }

    if (hasActiveFilters) {
      return PlaceFilterChips(state: state);
    }

    return ActivityGroupFilter(state: state);
  }

  bool _hasActiveFilters(FilterOptions filters) {
    return filters.selectedTags.isNotEmpty ||
        filters.priceRange != null ||
        (filters.priceMin != null || filters.priceMax != null) ||
        (filters.distance != null && filters.distance! > 0) ||
        filters.sortBy != SortOption.relevance;
  }
}
