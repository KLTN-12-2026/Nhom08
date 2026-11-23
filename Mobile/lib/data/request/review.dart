class CreateReviewRequest {
  final int placeId;
  final double rating;
  final String? comment;
  final List<String>? images; // Base64 encoded images

  const CreateReviewRequest({
    required this.placeId,
    required this.rating,
    this.comment,
    this.images,
  });

  factory CreateReviewRequest.fromJson(Map<String, dynamic> json) {
    return CreateReviewRequest(
      placeId: json['place_id'] ?? json['cafe_id'] ?? 0,
      rating: (json['rating'] ?? 0.0).toDouble(),
      comment: json['comment'],
      images: json['images'] != null ? List<String>.from(json['images']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'place_id': placeId,
      'rating': rating,
      'comment': comment,
      'images': images,
    };
  }
}

class UpdateReviewRequest {
  final double? rating;
  final String? comment;

  const UpdateReviewRequest({
    this.rating,
    this.comment,
  });

  factory UpdateReviewRequest.fromJson(Map<String, dynamic> json) {
    return UpdateReviewRequest(
      rating:
          json['rating'] != null ? (json['rating'] as num).toDouble() : null,
      comment: json['comment'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'rating': rating,
      'comment': comment,
    };
  }
}
