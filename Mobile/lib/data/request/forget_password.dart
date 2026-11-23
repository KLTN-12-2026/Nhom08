class ForgetPasswordRequest {
  final String email;

  ForgetPasswordRequest({required this.email});

  Map<String, dynamic> toJson() => {
        'email': email,
      };
}

class ResetPasswordRequest {
  final String email;
  final String token;
  final String newPassword;

  ResetPasswordRequest({
    required this.email,
    required this.token,
    required this.newPassword,
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'token': token,
        'new_password': newPassword,
      };
}
