/// Response for place image deletion
class PlaceImageDeleteResponse {
  final int placeId;
  final int deletedImageId;
  final bool gcsDeleted;

  const PlaceImageDeleteResponse({
    required this.placeId,
    required this.deletedImageId,
    required this.gcsDeleted,
  });

  factory PlaceImageDeleteResponse.fromJson(Map<String, dynamic> json) {
    return PlaceImageDeleteResponse(
      placeId: json['place_id'] ?? 0,
      deletedImageId: json['deleted_image_id'] ?? 0,
      gcsDeleted: json['gcs_deleted'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'place_id': placeId,
      'deleted_image_id': deletedImageId,
      'gcs_deleted': gcsDeleted,
    };
  }
}
