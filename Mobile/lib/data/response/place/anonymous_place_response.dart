/// Response for anonymous place creation
class AnonymousPlaceResponse {
  final int id;
  final String name;
  final String address;
  final String category;
  final String status;
  final bool isAnonymous;
  final int totalImages;
  final DateTime createdAt;

  const AnonymousPlaceResponse({
    required this.id,
    required this.name,
    required this.address,
    required this.category,
    required this.status,
    required this.isAnonymous,
    required this.totalImages,
    required this.createdAt,
  });

  factory AnonymousPlaceResponse.fromJson(Map<String, dynamic> json) {
    return AnonymousPlaceResponse(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      category: json['category'] ?? '',
      status: json['status'] ?? '',
      isAnonymous: json['is_anonymous'] ?? false,
      totalImages: json['total_images'] ?? 0,
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'category': category,
      'status': status,
      'is_anonymous': isAnonymous,
      'total_images': totalImages,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
