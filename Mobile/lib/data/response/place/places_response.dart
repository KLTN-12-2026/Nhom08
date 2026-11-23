import 'package:trove/data/response/place/place_model.dart';

class PlacesResponse {
  int? statusCode;
  String? message;
  bool? success;
  PlacesData? data;

  PlacesResponse({this.statusCode, this.message, this.success, this.data});

  PlacesResponse.fromJson(Map<String, dynamic> json) {
    statusCode = json['status_code'];
    message = json['message'];
    success = json['success'];
    data = json['data'] != null ? new PlacesData.fromJson(json['data']) : null;
  }
}

class PlacesData {
  List<PlaceModel>? places;
  int? total;
  int? skip;
  int? limit;

  PlacesData({this.places, this.total, this.skip, this.limit});

  PlacesData.fromJson(Map<String, dynamic> json) {
    final dynamic listCandidate = json['places'] ?? json['data'];
    if (listCandidate is List) {
      places = <PlaceModel>[];
      for (final v in listCandidate) {
        places!.add(new PlaceModel.fromJson(v));
      }
    }
    total = json['total'] ?? (places?.length ?? 0);
    skip = json['skip'];
    limit = json['limit'];
  }
}
