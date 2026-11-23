import 'movie_model.dart';

class MoviesResponse {
  final bool? success;
  final String? message;
  final List<MovieModel>? data;

  MoviesResponse({
    this.success,
    this.message,
    this.data,
  });

  factory MoviesResponse.fromJson(Map<String, dynamic> json) {
    return MoviesResponse(
      success: json['success'] as bool?,
      message: json['message'] as String?,
      data: json['data'] != null
          ? (json['data'] as List<dynamic>)
              .map((e) => MovieModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data?.map((e) => e.toJson()).toList(),
    };
  }
}
