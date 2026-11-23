import 'package:trove/data/response/place/places_response.dart';

import 'place_model.dart';

/// Response for place approval
class PlaceApprovalResponse {
  final PlaceModel place;

  const PlaceApprovalResponse({required this.place});

  factory PlaceApprovalResponse.fromJson(Map<String, dynamic> json) {
    return PlaceApprovalResponse(
      place: PlaceModel.fromJson(json),
    );
  }

  Map<String, dynamic> toJson() {
    return place.toJson();
  }
}
