import 'package:trove/data/response/place/category_model.dart';

class CategoryCreateResponse {
  int? statusCode;
  String? message;
  bool? success;
  CategoryModel? data;

  CategoryCreateResponse(
      {this.statusCode, this.message, this.success, this.data});

  CategoryCreateResponse.fromJson(Map<String, dynamic> json) {
    statusCode = json['status_code'];
    message = json['message'];
    success = json['success'];
    data = json['data'] != null ? CategoryModel.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['status_code'] = statusCode;
    data['message'] = message;
    data['success'] = success;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}
