/// Image model for place images
class PlaceImageModel {
  final int id;
  final String url;
  final String fileName;
  final int size;
  final int? width;
  final int? height;
  final String? format;
  final DateTime createdAt;

  const PlaceImageModel({
    required this.id,
    required this.url,
    required this.fileName,
    required this.size,
    this.width,
    this.height,
    this.format,
    required this.createdAt,
  });

  factory PlaceImageModel.fromJson(Map<String, dynamic> json) {
    return PlaceImageModel(
      id: json['id'] ?? 0,
      url: json['url'] ?? '',
      fileName: json['file_name'] ?? '',
      size: json['size'] ?? 0,
      width: json['width'],
      height: json['height'],
      format: json['format'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'url': url,
      'file_name': fileName,
      'size': size,
      'width': width,
      'height': height,
      'format': format,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
