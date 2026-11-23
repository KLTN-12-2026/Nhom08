class CategoryModel {
  final int? id;
  final String? name;
  final String? displayName;
  final String? description;
  final bool? isActive;
  final String? createdAt;
  final String? updatedAt;

  CategoryModel({
    this.id,
    this.name,
    this.displayName,
    this.description,
    this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) => CategoryModel(
        id: json['id'] as int?,
        name: json['name'] as String?,
        displayName: json['display_name'] as String?,
        description: json['description'] as String?,
        isActive: json['is_active'] as bool?,
        createdAt: json['created_at'] as String?,
        updatedAt: json['updated_at'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'display_name': displayName,
        'description': description,
        'is_active': isActive,
        'created_at': createdAt,
        'updated_at': updatedAt,
      };
}
