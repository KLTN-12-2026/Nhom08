// lib/services/account_service.dart
import 'dart:io';
import '../models/user.dart';
import '../data/data_sources/remote/api_client.dart';
import '../data/response/auth/user_info_response.dart';
import '../data/response/place/user_posts_response.dart';
import '../data/data_sources/local/token_manager.dart';
import '../core/services/service_provider.dart';
import 'cloudinary_service.dart';

import '../core/data/data_main.dart';

class AccountService {
  final ApiClient _apiClient;

  AccountService(this._apiClient);

  // ✅ Logout
  Future<void> logout() async {
    try {
      await _apiClient.appService.logout();
    } catch (e) {
    } finally {
      await TokenManager.clearTokens();
      await serviceProvider.appPreferences.clearAuth();
      dataMain.clear(); // Clear DataMain on logout
    }
  }

  // ✅ Change password
  Future<void> changePassword(String newPassword) async {
    try {
      // TODO: implement BE endpoint and wire here
      // await _apiClient.appService.changePassword(newPassword);
      throw UnimplementedError('changePassword not implemented');
    } catch (e) {
      print('Change password error: $e');
      rethrow;
    }
  }

  // ✅ Update profile
  Future<void> updateProfile(Map<String, dynamic> updates) async {
    try {
      final response = await _apiClient.appService.updateUser(updates);

      // Update DataMain với user info mới
      if (response.data != null) {
        final updatedUser = response.toUser();
        if (updatedUser != null) {
          dataMain.updateUserInfo(updatedUser);
        }
      }
    } catch (e) {
      rethrow;
    }
  }

  // ✅ Update avatar
  // Following MOBILE_HANDOVER.md: Upload to Cloudinary first, then send URL to backend
  Future<void> updateAvatar(File avatar) async {
    try {
      // Step 1: Upload to Cloudinary first
      final cloudinaryService = CloudinaryService();
      final avatarUrl = await cloudinaryService.uploadImage(
        avatar,
        folder: 'avatars', // Organize avatar uploads separately
      );

      if (avatarUrl == null) {
        throw Exception('Failed to upload avatar to Cloudinary');
      }

      // Step 2: Send URL to backend (recommended approach per MOBILE_HANDOVER.md)
      final response = await _apiClient.appService.updateUser({
        'avatar_url': avatarUrl,
      });

      // Update DataMain với user info mới
      if (response.data != null) {
        final updatedUser = response.toUser();
        if (updatedUser != null) {
          dataMain.updateUserInfo(updatedUser);
        }
      }
    } catch (e) {
      rethrow;
    }
  }

  // ✅ Get user info
  Future<User?> getUserInfo() async {
    try {
      // Check DataMain first
      if (dataMain.currentUser != null) {
        return dataMain.currentUser;
      }

      final response = await _apiClient.appService.getCurrentUser();
      final user = response.toUser();

      // Save to DataMain for future use
      if (user != null) {
        dataMain.setUserInfo(user);
      }

      return user;
    } catch (e) {
      throw Exception('Failed to get user info: $e');
    }
  }

  // ✅ Get my places
  Future<UserPostsResponse> getMyPlaces({
    int page = 1,
    String? status,
  }) async {
    try {
      // Gọi endpoint mới /api/places/my-places (yêu cầu auth)
      // Nếu status == null -> không truyền param để BE trả tất cả trạng thái
      final response = await _apiClient.appService.getMyPlaces(
        page: page,
        status: status,
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  // ✅ Delete my place
  Future<void> deleteMyPlace(int placeId) async {
    try {
      await _apiClient.appService.deletePlace(placeId);
    } catch (e) {
      throw Exception('Failed to delete place: $e');
    }
  }
}
