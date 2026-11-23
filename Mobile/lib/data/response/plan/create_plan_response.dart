class CreatePlanResponse {
  final bool? success;
  final String? message;
  final Map<String, dynamic>? data;

  CreatePlanResponse({
    this.success,
    this.message,
    this.data,
  });

  factory CreatePlanResponse.fromJson(Map<String, dynamic> json) {
    return CreatePlanResponse(
      success: json['success'] as bool?,
      message: json['message'] as String?,
      data: json['data'] != null
          ? Map<String, dynamic>.from(json['data'] as Map)
          : null,
    );
  }
}
