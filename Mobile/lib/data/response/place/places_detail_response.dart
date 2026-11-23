import 'package:trove/models/category.dart';
import 'package:trove/models/media_item.dart';
import 'package:trove/models/place.dart';
import 'package:trove/models/review.dart';
import 'package:trove/models/user.dart';
import 'package:trove/data/response/plan/activity_groups_response.dart';

class PlaceDetailResponse {
  bool? success;
  String? message;
  PlaceDetailData? data;

  PlaceDetailResponse({this.success, this.message, this.data});

  PlaceDetailResponse.fromJson(Map<String, dynamic> json) {
    success = json['success'];
    message = json['message'];
    data = json['data'] != null ? PlaceDetailData.fromJson(json['data']) : null;
  }
}

class PlaceDetailData {
  int? id;
  int? userId;
  String? name;
  String? address;
  double? latitude;
  double? longitude;
  String? description;
  List<Category>? categories;
  double? averagePrice;
  double? rating;
  double? averageRating;
  int? reviewsCount;
  int? totalReaction;
  int? status;
  String? contactEmail;
  String? contactPhone;
  dynamic adminNotes;
  bool? isAnonymous;
  bool? isFavorited;
  List<String>? tags;
  List<MediaItem>? media;
  User? user;
  List<ReviewModel>? reviews;
  String? createdAt;
  String? updatedAt;
  List<ActivityGroup>? activityGroups;

  PlaceDetailData({
    this.id,
    this.userId,
    this.name,
    this.address,
    this.latitude,
    this.longitude,
    this.description,
    this.categories,
    this.averagePrice,
    this.rating,
    this.averageRating,
    this.reviewsCount,
    this.totalReaction,
    this.status,
    this.contactEmail,
    this.contactPhone,
    this.adminNotes,
    this.isAnonymous,
    this.isFavorited,
    this.tags,
    this.media,
    this.user,
    this.reviews,
    this.createdAt,
    this.updatedAt,
    this.activityGroups,
  });

  PlaceDetailData copyWith({
    int? id,
    int? userId,
    String? name,
    String? address,
    double? latitude,
    double? longitude,
    String? description,
    List<Category>? categories,
    double? averagePrice,
    double? rating,
    double? averageRating,
    int? reviewsCount,
    int? totalReaction,
    int? status,
    String? contactEmail,
    String? contactPhone,
    dynamic adminNotes,
    bool? isAnonymous,
    bool? isFavorited,
    List<String>? tags,
    List<MediaItem>? media,
    User? user,
    List<ReviewModel>? reviews,
    String? createdAt,
    String? updatedAt,
    List<ActivityGroup>? activityGroups,
  }) {
    return PlaceDetailData(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      address: address ?? this.address,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      description: description ?? this.description,
      categories: categories ?? this.categories,
      averagePrice: averagePrice ?? this.averagePrice,
      rating: rating ?? this.rating,
      averageRating: averageRating ?? this.averageRating,
      reviewsCount: reviewsCount ?? this.reviewsCount,
      totalReaction: totalReaction ?? this.totalReaction,
      status: status ?? this.status,
      contactEmail: contactEmail ?? this.contactEmail,
      contactPhone: contactPhone ?? this.contactPhone,
      adminNotes: adminNotes ?? this.adminNotes,
      isAnonymous: isAnonymous ?? this.isAnonymous,
      isFavorited: isFavorited ?? this.isFavorited,
      tags: tags ?? this.tags,
      media: media ?? this.media,
      user: user ?? this.user,
      reviews: reviews ?? this.reviews,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      activityGroups: activityGroups ?? this.activityGroups,
    );
  }

  PlaceDetailData.fromJson(Map<String, dynamic> json) {
    id = (json['id'] as num?)?.toInt();
    userId = (json['user_id'] as num?)?.toInt();
    name = json['name'];
    address = json['address'];
    latitude = (json['latitude'] is num)
        ? (json['latitude'] as num).toDouble()
        : double.tryParse('${json['latitude']}');
    longitude = (json['longitude'] is num)
        ? (json['longitude'] as num).toDouble()
        : double.tryParse('${json['longitude']}');
    description = json['description'];
    if (json['categories'] != null) {
      categories = <Category>[];
      json['categories'].forEach((v) {
        categories!.add(Category.fromJson(v));
      });
    }
    averagePrice = (json['average_price'] as num?)?.toDouble();
    rating = (json['rating'] as num?)?.toDouble();
    averageRating = (json['average_rating'] as num?)?.toDouble();
    reviewsCount = (json['reviews_count'] as num?)?.toInt();
    totalReaction = (json['total_reaction'] as num?)?.toInt();
    status = (json['status'] as num?)?.toInt();
    contactEmail = json['contact_email'];
    contactPhone = json['contact_phone'];
    adminNotes = json['admin_notes'];
    isAnonymous = json['is_anonymous'];
    isFavorited = json['is_favorited'];
    tags = json['tags'] != null ? List<String>.from(json['tags']) : null;
    if (json['media'] != null) {
      media = <MediaItem>[];
      json['media'].forEach((v) {
        media!.add(MediaItem.fromJson(v));
      });
    }
    user = json['user'] != null ? User.fromJson(json['user']) : null;
    if (json['reviews'] != null) {
      reviews = <ReviewModel>[];
      json['reviews'].forEach((v) {
        if (v is Map<String, dynamic>) {
          reviews!.add(ReviewModel.fromMap(v));
        }
      });
    }
    createdAt = json['created_at'];
    updatedAt = json['updated_at'];

    // Parse activity groups
    if (json['activity_groups'] != null && json['activity_groups'] is List) {
      activityGroups = <ActivityGroup>[];
      json['activity_groups'].forEach((v) {
        if (v is Map<String, dynamic>) {
          activityGroups!.add(ActivityGroup.fromJson(v));
        }
      });
    }
  }

  Place toDomain() {
    final parsedCategories = categories;
    final parsedReviews = reviews;
    return Place(
      id: (id ?? '').toString(),
      name: name ?? '',
      description: description ?? '',
      address: address ?? '',
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      categoryId: parsedCategories != null && parsedCategories.isNotEmpty
          ? parsedCategories.first.id
          : null,
      rating: rating ?? 0,
      averageRating: averageRating,
      reviewsCount: reviewsCount,
      images: media ?? [],
      createdAt: createdAt != null
          ? DateTime.tryParse(createdAt!) ?? DateTime.now()
          : DateTime.now(),
      createdBy: userId?.toString(),
      isFavorited: isFavorited ?? false,
      price: averagePrice,
      categories: parsedCategories,
      tags: tags,
      reviews: parsedReviews,
      totalReaction: totalReaction ?? 0,
      activityGroups: activityGroups,
    );
  }
}
