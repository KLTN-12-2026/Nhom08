// lib/data/repository/announcement_repository.dart
import '../../data/service/announcement_service.dart';
import '../../data/response/announcement/announcements_response.dart';

class AnnouncementRepository {
  final AnnouncementService _service;
  AnnouncementRepository(this._service);

  Future<AnnouncementsResponse> fetchAnnouncements() {
    return _service.getAnnouncements();
  }
}
