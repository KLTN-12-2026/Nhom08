import '../presentation/screen/place/widgets/filter/filter_model.dart';
import '../presentation/screen/place/widgets/price_widget.dart';

/// Service để xử lý business logic cho filter places
class PlaceFilterService {
  /// Kiểm tra xem filter có ý nghĩa không (có ít nhất một điều kiện filter)
  bool isMeaningfulFilter(FilterOptions filters) {
    final hasCategory = filters.selectedCategoryId != null;
    final hasTags = filters.selectedTags.isNotEmpty;
    final hasPrice = filters.priceRange != null ||
        filters.priceMin != null ||
        filters.priceMax != null;
    final hasRating = filters.minRating != null;
    final distanceValue = filters.distance ?? 0;
    final hasDistance = distanceValue > 0 &&
        filters.latitude != null &&
        filters.longitude != null;
    final hasSort = filters.sortBy != SortOption.relevance;
    final hasActivityGroups = filters.activityGroupIds.isNotEmpty;
    return hasCategory ||
        hasTags ||
        hasPrice ||
        hasRating ||
        hasDistance ||
        hasSort ||
        hasActivityGroups;
  }

  /// Map SortOption sang API parameters
  SortMapping mapSortOption(SortOption? sortOption) {
    switch (sortOption) {
      case SortOption.distance:
        return const SortMapping('distance', 'asc');
      case SortOption.rating:
        return const SortMapping('rating', 'desc');
      case SortOption.price:
        return const SortMapping('average_price', 'asc');
      case SortOption.newest:
        return const SortMapping('created_at', 'desc');
      case SortOption.relevance:
      default:
        return const SortMapping(null, null);
    }
  }

  /// Build filter query parameters từ FilterOptions
  FilterQueryParams buildFilterQuery({
    FilterOptions? filters,
    int? fallbackCategoryId,
  }) {
    List<int>? categoryIds;
    if (filters != null && filters.selectedCategoryId != null) {
      categoryIds = [filters.selectedCategoryId!];
    }
    if ((categoryIds == null || categoryIds.isEmpty) &&
        fallbackCategoryId != null) {
      categoryIds = [fallbackCategoryId];
    }

    int? priceMin = filters?.priceMin;
    int? priceMax = filters?.priceMax;
    if (filters?.priceRange != null) {
      switch (filters!.priceRange!) {
        case PriceRange.low:
          priceMax ??= 200000;
          priceMin = null;
          break;
        case PriceRange.medium:
          priceMin ??= 200000;
          priceMax ??= 500000;
          break;
        case PriceRange.high:
          priceMin ??= 500000;
          priceMax = null;
          break;
      }
    }

    // Convert tags Set to List for API
    final tags = filters != null && filters.selectedTags.isNotEmpty
        ? filters.selectedTags.toList()
        : null;

    final activityGroupIds =
        filters != null && filters.activityGroupIds.isNotEmpty
            ? filters.activityGroupIds.toList()
            : null;
    final sortMapping = mapSortOption(filters?.sortBy);
    final distanceKm = filters != null && (filters.distance ?? 0) > 0
        ? filters.distance
        : null;
    final shouldIncludeDistance = distanceKm != null &&
        filters?.latitude != null &&
        filters?.longitude != null;

    return FilterQueryParams(
      categoryIds: categoryIds?.isNotEmpty == true ? categoryIds : null,
      primaryCategoryId: categoryIds != null && categoryIds.isNotEmpty
          ? categoryIds.first
          : null,
      priceMin: priceMin,
      priceMax: priceMax,
      latitude: shouldIncludeDistance ? filters?.latitude : null,
      longitude: shouldIncludeDistance ? filters?.longitude : null,
      distanceKm: shouldIncludeDistance ? distanceKm : null,
      tags: tags?.isNotEmpty == true ? tags : null,
      tagIds: null,
      activityGroupIds: activityGroupIds,
      sortBy: sortMapping.sortBy,
      sortOrder: sortMapping.sortOrder,
    );
  }
}

/// Mapping cho sort option
class SortMapping {
  final String? sortBy;
  final String? sortOrder;
  const SortMapping(this.sortBy, this.sortOrder);
}

/// Query parameters cho filter API
class FilterQueryParams {
  final List<int>? categoryIds;
  final int? primaryCategoryId;
  final int? priceMin;
  final int? priceMax;
  final double? latitude;
  final double? longitude;
  final int? distanceKm;
  final List<String>? tags;
  final List<int>? tagIds;
  final List<int>? activityGroupIds; // Changed from List<String> to List<int>
  final String? sortBy;
  final String? sortOrder;

  const FilterQueryParams({
    this.categoryIds,
    this.primaryCategoryId,
    this.priceMin,
    this.priceMax,
    this.latitude,
    this.longitude,
    this.distanceKm,
    this.tags,
    this.tagIds,
    this.activityGroupIds,
    this.sortBy,
    this.sortOrder,
  });
}
