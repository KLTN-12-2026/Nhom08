class RegisterRequest {
  final String email;
  final String password;
  final String passwordConfirmation;
  final String name;
  final String? phone;
  final String? role;

  RegisterRequest({
    required this.email,
    required this.password,
    required this.passwordConfirmation,
    required this.name,
    this.phone,
    this.role,
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'name': name,
        'password': password,
        'password_confirmation': passwordConfirmation,
        if (phone != null) 'phone': phone,
        if (role != null) 'role': role,
      };
}
