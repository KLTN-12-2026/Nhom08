import 'package:trove/data/response/place/places_response.dart';

import 'place_model.dart';
import 'place_image_model.dart';

class PlaceUpdateResponse {
  bool? success;
  String? message;
  PlaceUpdateData? data;

  PlaceUpdateResponse({this.success, this.message, this.data});

  factory PlaceUpdateResponse.fromJson(Map<String, dynamic> json) {
    return PlaceUpdateResponse(
      success: json['success'],
      message: json['message'],
      data:
          json['data'] != null ? PlaceUpdateData.fromJson(json['data']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> result = {};
    result['success'] = success;
    result['message'] = message;
    if (data != null) {
      result['data'] = data!.toJson();
    }
    return result;
  }
}

class PlaceUpdateData {
  PlaceModel? place;
  List<PlaceImageModel>? uploadedImages;
  int? totalNewImages;
  bool? imagesReplaced;

  PlaceUpdateData({
    this.place,
    this.uploadedImages,
    this.totalNewImages,
    this.imagesReplaced,
  });

  factory PlaceUpdateData.fromJson(Map<String, dynamic> json) {
    // The API returns the place data directly, not wrapped in a 'place' field
    // So we need to check if this is a PlaceModel directly
    PlaceModel? placeModel;
    List<PlaceImageModel>? images;
    int? newImages;
    bool? replaced;

    // Check if the response contains place fields directly or wrapped
    if (json.containsKey('place')) {
      placeModel = PlaceModel.fromJson(json['place']);
      images = (json['uploaded_images'] as List?)
          ?.map((img) => PlaceImageModel.fromJson(img))
          .toList();
      newImages = json['total_new_images'];
      replaced = json['images_replaced'];
    } else {
      // The data IS the place model itself
      placeModel = PlaceModel.fromJson(json);
      images = [];
      newImages = 0;
      replaced = false;
    }

    return PlaceUpdateData(
      place: placeModel,
      uploadedImages: images ?? [],
      totalNewImages: newImages ?? 0,
      imagesReplaced: replaced ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> result = {};
    if (place != null) {
      result['place'] = place!.toJson();
    }
    if (uploadedImages != null) {
      result['uploaded_images'] =
          uploadedImages!.map((img) => img.toJson()).toList();
    }
    result['total_new_images'] = totalNewImages;
    result['images_replaced'] = imagesReplaced;
    return result;
  }
}
