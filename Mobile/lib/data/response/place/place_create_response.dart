import 'package:trove/data/response/place/place_model.dart';

class PlaceCreateResponse {
  int? statusCode;
  String? message;
  bool? success;
  Data? data;

  PlaceCreateResponse({this.statusCode, this.message, this.success, this.data});

  PlaceCreateResponse.fromJson(Map<String, dynamic> json) {
    statusCode = json['status_code'];
    message = json['message'];
    success = json['success'];
    data = json['data'] != null ? new Data.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['status_code'] = this.statusCode;
    data['message'] = this.message;
    data['success'] = this.success;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class Data {
  PlaceModel? place;
  int? totalImages;

  Data({this.place, this.totalImages});

  Data.fromJson(Map<String, dynamic> json) {
    place =
        json['place'] != null ? new PlaceModel.fromJson(json['place']) : null;
    totalImages = json['total_images'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.place != null) {
      data['place'] = this.place!.toJson();
    }
    data['total_images'] = this.totalImages;
    return data;
  }
}
