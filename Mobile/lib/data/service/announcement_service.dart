import '../../data/data_sources/remote/api_client.dart';
import '../../data/response/announcement/announcements_response.dart';

class AnnouncementService {
  final ApiClient _apiClient;
  AnnouncementService(this._apiClient);

  Future<AnnouncementsResponse> getAnnouncements() async {
    // Sử dụng Retrofit endpoint từ appService
    return await _apiClient.appService.getAnnouncements();
  }
}
