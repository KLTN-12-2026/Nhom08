import 'package:trove/models/user.dart';

class UserInfoResponse {
  int? statusCode;
  String? message;
  bool? success;
  UserInfoData? data;

  UserInfoResponse({this.statusCode, this.message, this.success, this.data});

  UserInfoResponse.fromJson(Map<String, dynamic> json) {
    statusCode = json['status_code'];
    message = json['message'];
    success = json['success'];
    data = json['data'] != null ? UserInfoData.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['status_code'] = this.statusCode;
    data['message'] = this.message;
    data['success'] = this.success;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class UserInfoData {
  int? id;
  String? username;
  String? email;
  String? name;
  String? role;
  bool? isActive;
  String? phoneNumber;
  String? avatar;
  String? createdAt;
  TokenInfo? tokenInfo;
  WalletData? wallet;
  bool? isLimit;
  int? placesLimit;

  UserInfoData(
      {this.id,
      this.username,
      this.email,
      this.name,
      this.role,
      this.isActive,
      this.phoneNumber,
      this.avatar,
      this.createdAt,
      this.tokenInfo,
      this.wallet,
      this.isLimit,
      this.placesLimit});

  UserInfoData.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    username = json['username'];
    email = json['email'];
    name = json['name'];
    role = json['role'];
    isActive = json['is_active'];
    phoneNumber = json['phone_number'];
    avatar = json['avatar'];
    createdAt = json['created_at'];
    tokenInfo = json['token_info'] != null
        ? new TokenInfo.fromJson(json['token_info'])
        : null;
    wallet =
        json['wallet'] != null ? new WalletData.fromJson(json['wallet']) : null;
    isLimit = json['is_limit'];
    placesLimit = json['places_limit'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    data['username'] = username;
    data['email'] = email;
    data['name'] = name;
    data['role'] = role;
    data['is_active'] = isActive;
    data['phone_number'] = phoneNumber;
    data['avatar'] = avatar;
    data['created_at'] = createdAt;
    if (tokenInfo != null) {
      data['token_info'] = tokenInfo!.toJson();
    }
    if (wallet != null) {
      data['wallet'] = wallet!.toJson();
    }
    data['is_limit'] = isLimit;
    data['places_limit'] = placesLimit;
    return data;
  }
}

class WalletData {
  int? points;
  int? level;
  int? totalEarned;
  int? totalSpent;

  WalletData({this.points, this.level, this.totalEarned, this.totalSpent});

  WalletData.fromJson(Map<String, dynamic> json) {
    points = json['points'];
    level = json['level'];
    totalEarned = json['total_earned'];
    totalSpent = json['total_spent'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['points'] = this.points;
    data['level'] = this.level;
    data['total_earned'] = this.totalEarned;
    data['total_spent'] = this.totalSpent;
    return data;
  }
}

class TokenInfo {
  String? username;
  String? role;
  String? tokenType;

  TokenInfo({this.username, this.role, this.tokenType});

  TokenInfo.fromJson(Map<String, dynamic> json) {
    username = json['username'];
    role = json['role'];
    tokenType = json['token_type'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['username'] = this.username;
    data['role'] = this.role;
    data['token_type'] = this.tokenType;
    return data;
  }
}

extension UserInfoResponseMapper on UserInfoResponse {
  User? toUser() {
    return data?.toUser();
  }
}

extension UserInfoDataMapper on UserInfoData {
  User toUser() {
    Wallet? walletData;
    if (wallet != null) {
      walletData = Wallet(
        points: wallet!.points ?? 0,
        level: wallet!.level ?? 1,
        totalEarned: wallet!.totalEarned ?? 0,
        totalSpent: wallet!.totalSpent ?? 0,
      );
    }

    return User(
      id: id?.toString() ?? '',
      email: email ?? '',
      name: _buildName(),
      phone: phoneNumber,
      avatar: avatar,
      createdAt: createdAt != null ? DateTime.tryParse(createdAt!) : null,
      isActive: isActive ?? true,
      wallet: walletData,
      isLimit: isLimit ?? false,
      placesLimit: placesLimit ?? 0,
    );
  }

  String _buildName() {
    if (name != null && name!.isNotEmpty) {
      return name!;
    }
    return username ?? '';
  }
}
