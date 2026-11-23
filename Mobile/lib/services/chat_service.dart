// lib/services/chat_service.dart
import '../data/data_sources/remote/api_client.dart';

class ChatService {
  final ApiClient _apiClient; // ignore: unused_field

  ChatService(this._apiClient);

  // ✅ TODO: Implement chat functionality
  // This service will be implemented when chat features are needed
  Future<void> sendMessage(String message) async {
    try {
      // TODO: Implement chat API
      throw UnimplementedError('Chat functionality not implemented yet');
    } catch (e) {
      print('Send message error: $e');
      rethrow;
    }
  }

  Future<List<dynamic>> getMessages() async {
    try {
      // TODO: Implement get messages API
      throw UnimplementedError('Chat functionality not implemented yet');
    } catch (e) {
      print('Get messages error: $e');
      rethrow;
    }
  }
}
