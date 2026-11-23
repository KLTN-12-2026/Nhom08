/// Response for place deletion
class PlaceDeleteResponse {
  final bool success;
  final String message;
  final int? deletedPlaceId;
  final DateTime? deletedAt;

  const PlaceDeleteResponse({
    required this.success,
    required this.message,
    this.deletedPlaceId,
    this.deletedAt,
  });

  factory PlaceDeleteResponse.fromJson(Map<String, dynamic> json) {
    return PlaceDeleteResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? 'Place deletion failed',
      deletedPlaceId: json['deleted_place_id'],
      deletedAt: json['deleted_at'] != null
          ? DateTime.parse(json['deleted_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'deleted_place_id': deletedPlaceId,
      'deleted_at': deletedAt?.toIso8601String(),
    };
  }
}
