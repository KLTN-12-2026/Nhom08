// lib/data/request/category/create_category_request.dart
class CreateCategoryRequest {
  final String name;
  final String displayName;
  final String? description;
  final bool isActive;

  CreateCategoryRequest({
    required this.name,
    required this.displayName,
    this.description,
    required this.isActive,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'displayName': displayName,
      'description': description,
      'isActive': isActive,
    };
  }
}
