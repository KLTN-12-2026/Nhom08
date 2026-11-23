class ChangePasswordRequest {
  final String password;
  final String newPassword;

  const ChangePasswordRequest({
    required this.password,
    required this.newPassword,
  });

  factory ChangePasswordRequest.fromJson(Map<String, dynamic> json) {
    return ChangePasswordRequest(
      password: json['password'] ?? '',
      newPassword: json['new_password'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'password': password,
      'new_password': newPassword,
    };
  }
}

