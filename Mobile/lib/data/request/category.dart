class CreateCategoryRequest {
  String name;
  String displayName;
  String? description;
  bool? isActive;

  CreateCategoryRequest({
    required this.name,
    required this.displayName,
    this.description,
    this.isActive,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['name'] = name;
    data['display_name'] = displayName;
    if (description != null) data['description'] = description;
    if (isActive != null) data['is_active'] = isActive;
    return data;
  }
}

class CategoryCreateRequest {
  final String name;
  final String displayName;
  final String? description;

  CategoryCreateRequest({
    required this.name,
    required this.displayName,
    this.description,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'display_name': displayName,
        if (description != null) 'description': description,
      };
}
