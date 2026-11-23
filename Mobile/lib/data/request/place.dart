import 'dart:io';
import 'package:dio/dio.dart';

/// Create place (multipart) request that mirrors backend body
class CreatePlaceRequest {
  final String name;
  final String address;
  final double? latitude;
  final double? longitude;
  final String? description;
  final List<int> categoryIds;
  final int? averagePrice;
  final double? rating;
  final String? contactEmail;
  final String? contactPhone;
  final bool isAnonymous;
  final List<String> tags;
  final List<String>? imageUrls; // URLs from Cloudinary

  const CreatePlaceRequest({
    required this.name,
    required this.address,
    this.latitude,
    this.longitude,
    this.description,
    this.categoryIds = const [],
    this.averagePrice,
    this.rating,
    this.contactEmail,
    this.contactPhone,
    this.isAnonymous = false,
    this.tags = const [],
    this.imageUrls, // Optional image URLs from Cloudinary
  });

  /// Build multipart FormData matching:
  /// - name, address, latitude, longitude, description, average_price, rating, contact_email, contact_phone, is_anonymous
  /// - category_ids[] (array)
  /// - tags[] (array)
  Future<FormData> toFormData({List<MultipartFile> images = const []}) async {
    final form = FormData();
    form.fields.add(MapEntry('name', name));
    form.fields.add(MapEntry('address', address));
    if (latitude != null) {
      form.fields.add(MapEntry('latitude', latitude.toString()));
    }
    if (longitude != null) {
      form.fields.add(MapEntry('longitude', longitude.toString()));
    }
    if (description != null && description!.trim().isNotEmpty) {
      form.fields.add(MapEntry('description', description!.trim()));
    }
    if (averagePrice != null) {
      form.fields.add(MapEntry('average_price', averagePrice.toString()));
    }
    if (rating != null) {
      form.fields.add(MapEntry('rating', rating.toString()));
    }
    if (contactEmail != null && contactEmail!.isNotEmpty) {
      form.fields.add(MapEntry('contact_email', contactEmail!));
    }
    if (contactPhone != null && contactPhone!.isNotEmpty) {
      form.fields.add(MapEntry('contact_phone', contactPhone!));
    }
    form.fields.add(MapEntry('is_anonymous', isAnonymous ? '1' : '0'));

    for (final id in categoryIds) {
      form.fields.add(MapEntry('category_ids[]', id.toString()));
    }
    for (final t in tags) {
      form.fields.add(MapEntry('tags[]', t));
    }
    // Support both file uploads (existing) and URLs (new Cloudinary flow)
    if (images.isNotEmpty) {
      form.files.addAll(images.map((f) => MapEntry('images[]', f)));
    }
    // Add image URLs if provided (from Cloudinary)
    if (imageUrls != null && imageUrls!.isNotEmpty) {
      for (final url in imageUrls!) {
        form.fields.add(MapEntry('image_urls[]', url));
      }
    }
    return form;
  }
}

class PlaceFilterRequest {
  final String? category;
  final String? priceRange;
  final String? style;
  final String? ambience;
  final double? minRating;
  final double? maxRating;
  final String? searchQuery;

  const PlaceFilterRequest({
    this.category,
    this.priceRange,
    this.style,
    this.ambience,
    this.minRating,
    this.maxRating,
    this.searchQuery,
  });

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (category != null) map['category'] = category;
    if (priceRange != null) map['price_range'] = priceRange;
    if (style != null) map['style'] = style;
    if (ambience != null) map['ambience'] = ambience;
    if (minRating != null) map['min_rating'] = minRating;
    if (maxRating != null) map['max_rating'] = maxRating;
    if (searchQuery != null) map['query'] = searchQuery;
    return map;
  }
}

class UpdatePlaceRequest {
  final String? name;
  final String? address;
  final double? latitude;
  final double? longitude;
  final String? description;
  final List<int>? categoryIds; // Legacy - kept for backward compatibility
  final int? activityGroupId; // New: activity group ID
  final int? averagePrice;
  final double? rating;
  final String? contactEmail;
  final String? contactPhone;
  final bool? isAnonymous;
  final List<String>? tags;
  final List<String>? imageUrls; // Cloudinary URLs (existing + new)

  const UpdatePlaceRequest({
    this.name,
    this.address,
    this.latitude,
    this.longitude,
    this.description,
    this.categoryIds,
    this.activityGroupId, // New field
    this.averagePrice,
    this.rating,
    this.contactEmail,
    this.contactPhone,
    this.isAnonymous,
    this.tags,
    this.imageUrls, // Optional image URLs
  });

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (name != null) map['name'] = name;
    if (address != null) map['address'] = address;
    if (latitude != null) map['latitude'] = latitude;
    if (longitude != null) map['longitude'] = longitude;
    if (description != null) map['description'] = description;
    if (categoryIds != null) map['category_ids'] = categoryIds;
    if (activityGroupId != null) map['activity_group_id'] = activityGroupId;
    if (averagePrice != null) map['average_price'] = averagePrice;
    if (rating != null) map['rating'] = rating;
    if (contactEmail != null) map['contact_email'] = contactEmail;
    if (contactPhone != null) map['contact_phone'] = contactPhone;
    if (isAnonymous != null) map['is_anonymous'] = isAnonymous;
    if (tags != null) map['tags'] = tags;
    return map;
  }

  Future<FormData> toFormData({List<File>? images}) async {
    final form = FormData();
    form.fields.add(const MapEntry('_method', 'PUT'));

    if (name != null) form.fields.add(MapEntry('name', name!));
    if (address != null) form.fields.add(MapEntry('address', address!));
    if (latitude != null)
      form.fields.add(MapEntry('latitude', latitude.toString()));
    if (longitude != null)
      form.fields.add(MapEntry('longitude', longitude.toString()));
    if (description != null)
      form.fields.add(MapEntry('description', description!));
    if (averagePrice != null)
      form.fields.add(MapEntry('average_price', averagePrice.toString()));
    if (rating != null) form.fields.add(MapEntry('rating', rating.toString()));
    if (contactEmail != null)
      form.fields.add(MapEntry('contact_email', contactEmail!));
    if (contactPhone != null)
      form.fields.add(MapEntry('contact_phone', contactPhone!));
    if (isAnonymous != null)
      form.fields.add(MapEntry('is_anonymous', isAnonymous! ? '1' : '0'));

    if (categoryIds != null) {
      for (final id in categoryIds!) {
        form.fields.add(MapEntry('category_ids[]', id.toString()));
      }
    }

    if (activityGroupId != null) {
      form.fields
          .add(MapEntry('activity_group_id', activityGroupId.toString()));
    }

    if (tags != null) {
      for (final t in tags!) {
        form.fields.add(MapEntry('tags[]', t));
      }
    }

    // ✅ NEW: Send image URLs (Cloudinary-first approach)
    if (imageUrls != null && imageUrls!.isNotEmpty) {
      for (final url in imageUrls!) {
        form.fields.add(MapEntry('image_urls[]', url));
      }
    }
    // ⚠️ LEGACY: File upload (fallback, not recommended)
    else if (images != null && images.isNotEmpty) {
      for (final img in images) {
        final filename = img.path.split('/').last;
        form.files.add(MapEntry(
          'images[]',
          await MultipartFile.fromFile(img.path, filename: filename),
        ));
      }
    }

    return form;
  }
}
