import 'category_model.dart';

class CategoriesResponse {
  final int? statusCode;
  final String? message;
  final bool? success;
  final List<CategoryModel>? data;

  CategoriesResponse({
    this.statusCode,
    this.message,
    this.success,
    this.data,
  });

  factory CategoriesResponse.fromJson(Map<String, dynamic> json) =>
      CategoriesResponse(
        statusCode: json['status_code'] as int?,
        message: json['message'] as String?,
        success: json['success'] as bool?,
        data: (() {
          final dynamic wrapper = json['data'];
          List<dynamic>? list;
          if (wrapper is List) {
            list = wrapper;
          } else if (wrapper is Map<String, dynamic>) {
            final dynamic inner = wrapper['data'];
            if (inner is List) {
              list = inner;
            }
          }
          return list
              ?.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>))
              .toList();
        })(),
      );

  Map<String, dynamic> toJson() => {
        'status_code': statusCode,
        'message': message,
        'success': success,
        'data': data?.map((e) => e.toJson()).toList(),
      };
}
