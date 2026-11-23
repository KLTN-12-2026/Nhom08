class MyReactionResponse {
  final bool success;
  final String message;
  final MyReactionData? data;

  MyReactionResponse({
    required this.success,
    required this.message,
    this.data,
  });

  factory MyReactionResponse.fromJson(Map<String, dynamic> json) {
    return MyReactionResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null ? MyReactionData.fromJson(json['data']) : null,
    );
  }
}

class MyReactionData {
  final int? reactionType;

  MyReactionData({this.reactionType});

  factory MyReactionData.fromJson(Map<String, dynamic> json) {
    return MyReactionData(
      reactionType: json['reaction_type'],
    );
  }
}
