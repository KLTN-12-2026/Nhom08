import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:trove/presentation/bloc/bloc_factory.dart';
import 'package:trove/presentation/bloc/google_map_search/google_map_search_bloc.dart';
import 'package:trove/presentation/bloc/google_map_search/google_map_search_event.dart';
import 'package:trove/presentation/bloc/google_map_search/google_map_search_state.dart';
import 'package:trove/core/config/serpapi_config.dart';
import 'package:trove/presentation/widgets/custom_app_bar.dart';
import 'package:trove/presentation/widgets/tags/category_tag.dart';
import 'package:trove/presentation/widgets/input/primary_input.dart';
import '../../../core/config/themes/app_colors.dart';

class GoogleMapSearchScreen extends StatelessWidget {
  final String? initialQuery;
  final String? location;
  final String? hl;
  final String? gl;
  final String? googleDomain;
  final String? apiKey;

  const GoogleMapSearchScreen({
    Key? key,
    this.initialQuery,
    this.location,
    this.hl,
    this.gl,
    this.googleDomain,
    this.apiKey,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => blocFactory.createGoogleMapSearchBloc()
        ..add(
          initialQuery != null && initialQuery!.isNotEmpty
              ? GoogleMapSearchRequested(
                  query: initialQuery!,
                  location: location,
                  hl: hl ?? SerpApiConfig.defaultHl,
                  gl: gl ?? SerpApiConfig.defaultGl,
                  googleDomain:
                      googleDomain ?? SerpApiConfig.defaultGoogleDomain,
                  cr: SerpApiConfig.defaultCr,
                  lr: SerpApiConfig.defaultLr,
                  apiKey: apiKey,
                )
              : const GoogleMapSearchReset(),
        ),
      child: const _GoogleMapSearchContent(),
    );
  }
}

class _GoogleMapSearchContent extends StatefulWidget {
  const _GoogleMapSearchContent({Key? key}) : super(key: key);

  @override
  State<_GoogleMapSearchContent> createState() =>
      _GoogleMapSearchContentState();
}

class _GoogleMapSearchContentState extends State<_GoogleMapSearchContent> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<GoogleMapSearchBloc>().add(const LocationRequested());
    // Sync search text với state
    _searchController.addListener(_onSearchTextChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchTextChanged);
    _searchController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  void _onSearchTextChanged() {
    final text = _searchController.text;
    // Chỉ dispatch event nếu text khác với state hiện tại để tránh loop
    final currentState = context.read<GoogleMapSearchBloc>().state;
    if (text != currentState.searchText) {
      context.read<GoogleMapSearchBloc>().add(
            SearchTextChanged(text),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Tìm kiếm với Google Map',
      ),
      body: Column(
        children: [
          _buildSearchBar(context),
          Expanded(
            child: BlocBuilder<GoogleMapSearchBloc, GoogleMapSearchState>(
              builder: (context, state) {
                if (state is GoogleMapSearchLoading) {
                  return _buildLoadingWidget();
                }

                if (state is GoogleMapSearchError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.red,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          state.message,
                          style: const TextStyle(color: Colors.red),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        BlocBuilder<GoogleMapSearchBloc, GoogleMapSearchState>(
                          builder: (context, currentState) {
                            return ElevatedButton(
                              onPressed: () {
                                context.read<GoogleMapSearchBloc>().add(
                                      GoogleMapSearchRequested(
                                        query: currentState.searchText,
                                        location: currentState.currentAddress,
                                        hl: SerpApiConfig.defaultHl,
                                        gl: SerpApiConfig.defaultGl,
                                        googleDomain:
                                            SerpApiConfig.defaultGoogleDomain,
                                        latitude: currentState.currentLatitude,
                                        longitude:
                                            currentState.currentLongitude,
                                        cr: SerpApiConfig.defaultCr,
                                        lr: SerpApiConfig.defaultLr,
                                      ),
                                    );
                              },
                              child: const Text('Thử lại'),
                            );
                          },
                        ),
                      ],
                    ),
                  );
                }

                if (state is GoogleMapSearchSuccess) {
                  return _buildResults(context, state);
                }

                if (state is GoogleMapSearchPlacesSuccess) {
                  return _buildPlacesList(context, state.places);
                }

                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        height: 160,
                        child: Image.asset(
                          'assets/gifs/dog_spin.gif',
                          fit: BoxFit.contain,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Chọn địa điểm tìm kiếm',
                        style: TextStyle(
                          color: textSecondary,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return BlocConsumer<GoogleMapSearchBloc, GoogleMapSearchState>(
      listener: (context, state) {
        // Sync TextEditingController với state
        if (_searchController.text != state.searchText) {
          _searchController.text = state.searchText;
        }
        if (state.currentAddress != null &&
            _locationController.text != state.currentAddress) {
          _locationController.text = state.currentAddress!;
        }
      },
      builder: (context, state) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header với nút expand / collapse
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Tìm kiếm nâng cao',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: textSecondary,
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      state.isSearchExpanded
                          ? Icons.expand_less
                          : Icons.expand_more,
                      color: textSecondary,
                      size: 20,
                    ),
                    onPressed: () {
                      context
                          .read<GoogleMapSearchBloc>()
                          .add(const SearchExpandedToggled());
                    },
                    tooltip: state.isSearchExpanded
                        ? 'Thu gọn'
                        : 'Mở rộng bộ lọc tìm kiếm',
                  ),
                ],
              ),
              if (state.isSearchExpanded) ...[
                PrimaryInput(
                  controller: _searchController,
                  hintText: 'Tìm kiếm...',
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 8,
                  ),
                  suffixIcon: state.searchText.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 18),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () {
                            _searchController.clear();
                            context
                                .read<GoogleMapSearchBloc>()
                                .add(const GoogleMapSearchReset());
                          },
                        )
                      : null,
                  onChanged: (query) {
                    // SearchTextChanged được xử lý trong listener
                  },
                  onFieldSubmitted: (query) {
                    if (query.isNotEmpty) {
                      _performSearch(state);
                    }
                  },
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    IconButton(
                      icon: state.isLoadingAddress
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                              ),
                            )
                          : const Icon(Icons.my_location, color: primaryColor),
                      onPressed: state.isLoadingAddress
                          ? null
                          : () {
                              context
                                  .read<GoogleMapSearchBloc>()
                                  .add(const LocationRequested());
                            },
                      tooltip: 'Lấy vị trí hiện tại',
                      style: IconButton.styleFrom(
                        backgroundColor: primaryColor.withOpacity(0.1),
                        padding: const EdgeInsets.all(8),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: state.currentAddress != null
                          ? Text(
                              state.currentAddress!,
                              style: const TextStyle(
                                fontSize: 13,
                                color: textSecondary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            )
                          : const Text(
                              'Chưa có vị trí',
                              style: TextStyle(
                                fontSize: 13,
                                color: textSecondary,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
              ],
              _buildPopularKeywords(context, state),
            ],
          ),
        );
      },
    );
  }

  /// Thực hiện search
  void _performSearch(GoogleMapSearchState state) {
    if (state.searchText.isNotEmpty) {
      context.read<GoogleMapSearchBloc>().add(
            GoogleMapSearchRequested(
              query: state.searchText,
              location: state.currentAddress,
              hl: SerpApiConfig.defaultHl,
              gl: SerpApiConfig.defaultGl,
              googleDomain: SerpApiConfig.defaultGoogleDomain,
              latitude: state.currentLatitude,
              longitude: state.currentLongitude,
              cr: SerpApiConfig.defaultCr,
              lr: SerpApiConfig.defaultLr,
            ),
          );
    }
  }

  /// Widget loading thân thiện
  Widget _buildLoadingWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
          ),
          const SizedBox(height: 24),
          Text(
            'Đang tìm kiếm...',
            style: TextStyle(
              fontSize: 16,
              color: textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Vui lòng đợi trong giây lát',
            style: TextStyle(
              fontSize: 13,
              color: textSecondary.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  /// Widget hiển thị các từ khóa phổ biến
  Widget _buildPopularKeywords(
      BuildContext context, GoogleMapSearchState state) {
    final popularKeywords = [
      'Quán ăn',
      'Cà phê',
      'Nhà hàng',
      'Khách sạn',
      'Quán bar',
      'Trà sữa',
    ];

    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 4,
          runSpacing: 4,
          children: popularKeywords.map((keyword) {
            final isSelected = state.selectedKeyword == keyword;
            return CategoryTag(
              text: keyword,
              isSelected: isSelected,
              onTap: () {
                print("STATE $keyword");
                final newKeyword = isSelected ? null : keyword;
                context
                    .read<GoogleMapSearchBloc>()
                    .add(KeywordSelected(newKeyword));

                if (newKeyword != null) {
                  _searchController.text = keyword;
                  // Perform search with the keyword directly
                  context.read<GoogleMapSearchBloc>().add(
                        GoogleMapSearchRequested(
                          query: keyword,
                          location: state.currentAddress,
                          hl: SerpApiConfig.defaultHl,
                          gl: SerpApiConfig.defaultGl,
                          googleDomain: SerpApiConfig.defaultGoogleDomain,
                          latitude: state.currentLatitude,
                          longitude: state.currentLongitude,
                          cr: SerpApiConfig.defaultCr,
                          lr: SerpApiConfig.defaultLr,
                        ),
                      );
                } else {
                  _searchController.clear();
                  context
                      .read<GoogleMapSearchBloc>()
                      .add(const GoogleMapSearchReset());
                }
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildResults(
    BuildContext context,
    GoogleMapSearchSuccess state,
  ) {
    if (state.places.isEmpty) {
      return const Center(
        child: Text(
          'Không tìm thấy kết quả',
          style: TextStyle(color: textSecondary),
        ),
      );
    }

    return _buildPlacesList(context, state.places);
  }

  Widget _buildPlacesList(
    BuildContext context,
    List<Map<String, dynamic>> places,
  ) {
    if (places.isEmpty) {
      return const Center(
        child: Text(
          'Không tìm thấy địa điểm',
          style: TextStyle(color: textSecondary),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      itemCount: places.length,
      itemBuilder: (context, index) {
        final place = places[index];
        return _buildPlaceCard(context, place);
      },
    );
  }

  Widget _buildPlaceCard(
    BuildContext context,
    Map<String, dynamic> place,
  ) {
    final title = place['title'] as String? ?? 'Không có tên';
    final address = place['address'] as String? ?? '';
    final rating = place['rating'] as num?;
    final reviews = place['reviews'] as num?;
    final price = place['price'] as String?;
    final thumbnail = place['thumbnail'] as String?;
    final type = place['type'] as String?;

    return Card(
      margin: const EdgeInsets.only(bottom: 6),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: InkWell(
        onTap: () {
          _showPlaceDetails(context, place);
        },
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thumbnail
              if (thumbnail != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: Image.network(
                    thumbnail,
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 60,
                        height: 60,
                        color: backgroundSecondary,
                        child: const Icon(Icons.image,
                            color: textSecondary, size: 20),
                      );
                    },
                  ),
                )
              else
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: backgroundSecondary,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child:
                      const Icon(Icons.place, color: textSecondary, size: 20),
                ),
              const SizedBox(width: 8),
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (type != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        type,
                        style: const TextStyle(
                          fontSize: 11,
                          color: textSecondary,
                        ),
                      ),
                    ],
                    if (address.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on,
                            size: 12,
                            color: textSecondary,
                          ),
                          const SizedBox(width: 2),
                          Expanded(
                            child: Text(
                              address,
                              style: const TextStyle(
                                fontSize: 11,
                                color: textSecondary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        if (rating != null) ...[
                          const FaIcon(
                            FontAwesomeIcons.solidStar,
                            size: 12,
                            color: Colors.amber,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            rating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          if (reviews != null) ...[
                            const SizedBox(width: 2),
                            Text(
                              '(${reviews.toStringAsFixed(0)})',
                              style: const TextStyle(
                                fontSize: 10,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ],
                        if (price != null) ...[
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.green.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(3),
                            ),
                            child: Text(
                              price,
                              style: const TextStyle(
                                fontSize: 10,
                                color: Colors.green,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showPlaceDetails(BuildContext context, Map<String, dynamic> place) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place['title'] as String? ?? 'Không có tên',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (place['type'] != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        place['type'] as String,
                        style: const TextStyle(
                          fontSize: 14,
                          color: textSecondary,
                        ),
                      ),
                    ],
                    if (place['address'] != null) ...[
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              place['address'] as String,
                              style: const TextStyle(fontSize: 16),
                            ),
                          ),
                        ],
                      ),
                    ],
                    if (place['rating'] != null) ...[
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          const FaIcon(
                            FontAwesomeIcons.solidStar,
                            color: Colors.amber,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${place['rating']}',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (place['reviews'] != null) ...[
                            const SizedBox(width: 8),
                            Text(
                              '(${place['reviews']} đánh giá)',
                              style: const TextStyle(
                                fontSize: 14,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                    if (place['price'] != null) ...[
                      const SizedBox(height: 16),
                      Text(
                        'Giá: ${place['price']}',
                        style: const TextStyle(fontSize: 16),
                      ),
                    ],
                    if (place['description'] != null) ...[
                      const SizedBox(height: 16),
                      Text(
                        place['description'] as String,
                        style: const TextStyle(
                          fontSize: 14,
                          color: textSecondary,
                        ),
                      ),
                    ],
                    if (place['gps_coordinates'] != null) ...[
                      const SizedBox(height: 16),
                      const Text(
                        'Tọa độ GPS:',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Lat: ${place['gps_coordinates']['latitude']}, '
                        'Lng: ${place['gps_coordinates']['longitude']}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
