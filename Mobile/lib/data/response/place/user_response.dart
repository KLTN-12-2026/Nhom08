class UserResponse {
  final int id;
  final String username;
  final String? name;
  final String? avatar;

  const UserResponse({
    required this.id,
    required this.username,
    this.name,
    this.avatar,
  });

  factory UserResponse.fromJson(Map<String, dynamic> json) {
    return UserResponse(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      name: json['name'],
      avatar: json['avatar'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'name': name,
      'avatar': avatar,
    };
  }

  String get displayName {
    if (name != null && name!.isNotEmpty) {
      return name!;
    }
    return username;
  }
}
