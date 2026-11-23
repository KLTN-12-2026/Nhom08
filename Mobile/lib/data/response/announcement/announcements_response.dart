class AnnouncementsResponse {
  bool? success;
  String? message;
  List<AnnouncementsData>? data;

  AnnouncementsResponse({this.success, this.message, this.data});

  AnnouncementsResponse.fromJson(Map<String, dynamic> json) {
    success = json['success'];
    message = json['message'];
    if (json['data'] != null) {
      data = <AnnouncementsData>[];
      json['data'].forEach((v) {
        data!.add(new AnnouncementsData.fromJson(v));
      });
    }
  }
}

class AnnouncementsData {
  int? id;
  String? title;
  String? content;
  String? type;
  String? position;
  String? status;
  int? priority;
  String? startAt;
  String? endAt;
  String? createdAt;
  String? updatedAt;

  AnnouncementsData(
      {this.id,
      this.title,
      this.content,
      this.type,
      this.position,
      this.status,
      this.priority,
      this.startAt,
      this.endAt,
      this.createdAt,
      this.updatedAt});

  AnnouncementsData.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    title = json['title'];
    content = json['content'];
    type = json['type'];
    position = json['position'];
    status = json['status'];
    priority = json['priority'];
    startAt = json['start_at'];
    endAt = json['end_at'];
    createdAt = json['created_at'];
    updatedAt = json['updated_at'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['title'] = this.title;
    data['content'] = this.content;
    data['type'] = this.type;
    data['position'] = this.position;
    data['status'] = this.status;
    data['priority'] = this.priority;
    data['start_at'] = this.startAt;
    data['end_at'] = this.endAt;
    data['created_at'] = this.createdAt;
    data['updated_at'] = this.updatedAt;
    return data;
  }
}
