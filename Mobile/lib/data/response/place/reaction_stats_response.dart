class ReactionStatsResponse {
  final bool success;
  final String message;
  final ReactionStatsData? data;

  ReactionStatsResponse({
    required this.success,
    required this.message,
    this.data,
  });

  factory ReactionStatsResponse.fromJson(Map<String, dynamic> json) {
    return ReactionStatsResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null
          ? ReactionStatsData.fromJson(json['data'])
          : null,
    );
  }
}

class ReactionStatsData {
  final int total;
  final Map<String, int> breakdown;

  ReactionStatsData({
    required this.total,
    required this.breakdown,
  });

  factory ReactionStatsData.fromJson(Map<String, dynamic> json) {
    final breakdownData = json['breakdown'] as Map<String, dynamic>? ?? {};
    final breakdown =
        breakdownData.map((key, value) => MapEntry(key, value as int));

    return ReactionStatsData(
      total: json['total'] ?? 0,
      breakdown: breakdown,
    );
  }
}
