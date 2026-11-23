// lib/data/response/plan/plan_detail_response.dart
import '../../../models/plan.dart';

class PlanDetailResponse {
  final bool success;
  final String? message;
  final Plan? data;

  PlanDetailResponse({
    required this.success,
    this.message,
    this.data,
  });

  factory PlanDetailResponse.fromJson(Map<String, dynamic> json) {
    return PlanDetailResponse(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String?,
      data: json['data'] != null
          ? Plan.fromJson(json['data'] as Map<String, dynamic>)
          : null,
    );
  }
}
