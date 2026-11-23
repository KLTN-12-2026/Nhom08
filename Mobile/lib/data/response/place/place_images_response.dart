import 'place_image_model.dart';

/// Response for place images
class PlaceImagesResponse {
  final int placeId;
  final List<PlaceImageModel> images;
  final int total;
  final int page;
  final int perPage;

  const PlaceImagesResponse({
    required this.placeId,
    required this.images,
    required this.total,
    required this.page,
    required this.perPage,
  });

  factory PlaceImagesResponse.fromJson(Map<String, dynamic> json) {
    return PlaceImagesResponse(
      placeId: json['place_id'] ?? 0,
      images: (json['images'] as List?)
          ?.map((img) => PlaceImageModel.fromJson(img))
          .toList() ?? [],
      total: json['total'] ?? 0,
      page: json['page'] ?? 1,
      perPage: json['per_page'] ?? 20,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'place_id': placeId,
      'images': images.map((img) => img.toJson()).toList(),
      'total': total,
      'page': page,
      'per_page': perPage,
    };
  }
}
