// lib/data/response/plan/plans_response.dart
import '../../../models/plan.dart';

class PlansResponse {
  final bool success;
  final String? message;
  final List<Plan> data;
  final PlansMeta? meta;

  PlansResponse({
    required this.success,
    this.message,
    required this.data,
    this.meta,
  });

  factory PlansResponse.fromJson(Map<String, dynamic> json) {
    return PlansResponse(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String?,
      data: (json['data'] as List<dynamic>?)
              ?.map((e) => Plan.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      meta: json['meta'] != null
          ? PlansMeta.fromJson(json['meta'] as Map<String, dynamic>)
          : null,
    );
  }
}

class PlansMeta {
  final int currentPage;
  final int lastPage;
  final int perPage;
  final int total;

  PlansMeta({
    required this.currentPage,
    required this.lastPage,
    required this.perPage,
    required this.total,
  });

  factory PlansMeta.fromJson(Map<String, dynamic> json) {
    return PlansMeta(
      currentPage: json['current_page'] as int? ?? 1,
      lastPage: json['last_page'] as int? ?? 1,
      perPage: json['per_page'] as int? ?? 20,
      total: json['total'] as int? ?? 0,
    );
  }
}
