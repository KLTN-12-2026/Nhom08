class ActivityGroupResponse {
  final bool? success;
  final String? message;
  final ActivityGroupPagination? data;

  ActivityGroupResponse({
    this.success,
    this.message,
    this.data,
  });

  List<ActivityGroup> get groups => data?.groups ?? const [];

  factory ActivityGroupResponse.fromJson(Map<String, dynamic> json) {
    final rawData = json['data'];
    ActivityGroupPagination? pagination;
    if (rawData is Map<String, dynamic>) {
      pagination = ActivityGroupPagination.fromJson(rawData);
    } else if (rawData is List) {
      pagination = ActivityGroupPagination(
        groups: rawData
            .map((item) => ActivityGroup.fromJson(
                item is Map<String, dynamic> ? item : <String, dynamic>{}))
            .toList(),
      );
    }
    return ActivityGroupResponse(
      success: json['success'] as bool?,
      message: json['message'] as String?,
      data: pagination,
    );
  }
}

class ActivityGroupPagination {
  final List<ActivityGroup> groups;
  final int? currentPage;
  final int? lastPage;
  final int? perPage;
  final int? total;

  ActivityGroupPagination({
    required this.groups,
    this.currentPage,
    this.lastPage,
    this.perPage,
    this.total,
  });

  factory ActivityGroupPagination.fromJson(Map<String, dynamic> json) {
    // Try multiple possible keys where groups might be located
    dynamic list;
    
    // First, try 'data' key (standard pagination format)
    if (json['data'] is List) {
      list = json['data'];
    }
    // If 'data' is a Map, it might be nested pagination - try 'data.data'
    else if (json['data'] is Map<String, dynamic>) {
      final nestedData = json['data'] as Map<String, dynamic>;
      if (nestedData['data'] is List) {
        list = nestedData['data'];
      } else if (nestedData['groups'] is List) {
        list = nestedData['groups'];
      }
    }
    // Try 'groups' key directly
    else if (json['groups'] is List) {
      list = json['groups'];
    }
    
    List<ActivityGroup> groups = [];
    if (list is List) {
      groups = list
          .map((item) => ActivityGroup.fromJson(
              item is Map<String, dynamic> ? item : <String, dynamic>{}))
          .toList();
    }
    return ActivityGroupPagination(
      groups: groups,
      currentPage: json['current_page'] as int?,
      lastPage: json['last_page'] as int?,
      perPage: json['per_page'] as int?,
      total: json['total'] as int?,
    );
  }
}

class ActivityGroup {
  final int? id;
  final String key;
  final String displayName;
  final String? description;
  final List<ActivityCategory> categories;

  ActivityGroup({
    this.id,
    required this.key,
    required this.displayName,
    this.description,
    required this.categories,
  });

  List<String> get activityKeys =>
      categories.map((category) => category.key).toList();

  factory ActivityGroup.fromJson(Map<String, dynamic> json) {
    final resolvedKey = (json['key'] ??
            json['slug'] ??
            json['name'] ??
            json['id']?.toString() ??
            '')
        .toString();
    final resolvedDisplayName = (json['display_name'] ??
            json['displayName'] ??
            json['label'] ??
            json['name'] ??
            resolvedKey)
        .toString();

    final rawCategories = json['categories'];
    List<ActivityCategory> categories = [];
    if (rawCategories is List) {
      categories = rawCategories
          .map((item) => ActivityCategory.fromJson(
              item is Map<String, dynamic> ? item : <String, dynamic>{}))
          .toList();
    }

    return ActivityGroup(
      id: json['id'] as int?,
      key: resolvedKey,
      displayName: resolvedDisplayName,
      description: json['description']?.toString(),
      categories: categories,
    );
  }
}

class ActivityCategory {
  final int? id;
  final String key;
  final String displayName;

  ActivityCategory({
    this.id,
    required this.key,
    required this.displayName,
  });

  factory ActivityCategory.fromJson(Map<String, dynamic> json) {
    final key = (json['name'] ?? json['key'] ?? json['id']?.toString() ?? '')
        .toString();
    final displayName =
        (json['display_name'] ?? json['displayName'] ?? key).toString();

    return ActivityCategory(
      id: json['id'] as int?,
      key: key,
      displayName: displayName,
    );
  }
}
