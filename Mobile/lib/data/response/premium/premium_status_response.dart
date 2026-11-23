class PremiumStatusResponse {
  final bool success;
  final PremiumStatusData? data;
  final String? message;

  PremiumStatusResponse({
    required this.success,
    this.data,
    this.message,
  });

  factory PremiumStatusResponse.fromJson(Map<String, dynamic> json) {
    return PremiumStatusResponse(
      success: json['success'] as bool? ?? false,
      data: json['data'] != null
          ? PremiumStatusData.fromJson(json['data'] as Map<String, dynamic>)
          : null,
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'data': data?.toJson(),
      'message': message,
    };
  }
}

class PremiumStatusData {
  final bool isPremium;
  final String? premiumUntil;
  final int? daysRemaining;

  PremiumStatusData({
    required this.isPremium,
    this.premiumUntil,
    this.daysRemaining,
  });

  factory PremiumStatusData.fromJson(Map<String, dynamic> json) {
    return PremiumStatusData(
      isPremium: json['is_premium'] as bool? ?? false,
      premiumUntil: json['premium_until'] as String?,
      daysRemaining: json['days_remaining'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'is_premium': isPremium,
      'premium_until': premiumUntil,
      'days_remaining': daysRemaining,
    };
  }
}
