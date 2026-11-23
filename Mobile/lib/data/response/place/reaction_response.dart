class ReactionResponse {
  final bool success;
  final String message;
  final ReactionData? data;

  ReactionResponse({
    required this.success,
    required this.message,
    this.data,
  });

  factory ReactionResponse.fromJson(Map<String, dynamic> json) {
    return ReactionResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null ? ReactionData.fromJson(json['data']) : null,
    );
  }
}

class ReactionData {
  final int? reactionType;
  final String? message;

  ReactionData({
    this.reactionType,
    this.message,
  });

  factory ReactionData.fromJson(Map<String, dynamic> json) {
    return ReactionData(
      reactionType: json['reaction_type'],
      message: json['message'],
    );
  }
}
