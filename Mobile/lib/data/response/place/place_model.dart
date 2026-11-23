class PlaceModel {
  int? id;
  String? name;
  int? userId;
  String? address;
  String? description;
  String? category;
  int? categoryId;
  String? priceRange;
  double? price;
  String? style;
  String? ambience;
  double? rating;
  double? averageRating;
  int? reviewsCount;
  double? latitude;
  double? longitude;
  int? status;
  String? contactEmail;
  String? contactPhone;
  String? adminNotes;
  bool? isAnonymous;
  bool? isFavorited;
  List<Images>? images;
  List<CategoryModel>? categories;
  List<String>? tags;
  List<dynamic>? reviews;
  String? createdAt;
  int? totalReaction;
  List<ActivityGroupModel>? activityGroups;

  PlaceModel(
      {this.id,
      this.name,
      this.userId,
      this.address,
      this.description,
      this.category,
      this.categoryId,
      this.priceRange,
      this.price,
      this.style,
      this.ambience,
      this.rating,
      this.averageRating,
      this.reviewsCount,
      this.latitude,
      this.longitude,
      this.status,
      this.contactEmail,
      this.contactPhone,
      this.adminNotes,
      this.isAnonymous,
      this.isFavorited,
      this.images,
      this.categories,
      this.tags,
      this.reviews,
      this.createdAt,
      this.totalReaction,
      this.activityGroups});

  PlaceModel.fromJson(Map<String, dynamic> json) {
    id = (json['id'] as num?)?.toInt();
    name = json['name'];
    userId = (json['user_id'] as num?)?.toInt();
    address = json['address'];
    description = json['description'];
    category = json['category'];
    categoryId = (json['category_id'] as num?)?.toInt();
    priceRange = json['price_range'];
    price = ((json['average_price'] ?? json['price']) as num?)?.toDouble();
    style = json['style'];
    ambience = json['ambience'];
    rating = (json['rating'] as num?)?.toDouble();
    averageRating = (json['average_rating'] as num?)?.toDouble();
    reviewsCount = (json['reviews_count'] as num?)?.toInt();
    latitude = (json['latitude'] as num?)?.toDouble();
    longitude = (json['longitude'] as num?)?.toDouble();
    status = json['status'] is int
        ? json['status']
        : int.tryParse(json['status']?.toString() ?? '');
    contactEmail = json['contact_email'];
    contactPhone = json['contact_phone'];
    adminNotes = json['admin_notes'];
    isAnonymous = json['is_anonymous'];
    // Support both is_favorite and is_favorited from API
    isFavorited = json['is_favorited'];

    // Parse images from 'media' field (new API format) or 'images' field (old API format)
    if (json['media'] != null && json['media'] is List) {
      // New API format: media array
      images = <Images>[];
      (json['media'] as List).forEach((v) {
        if (v is Map<String, dynamic>) {
          images!.add(new Images.fromJson(v));
        }
      });
    } else if (json['images'] != null) {
      // Old API format: images array
      images = <Images>[];
      json['images'].forEach((v) {
        images!.add(new Images.fromJson(v));
      });
    }
    if (json['categories'] != null) {
      categories = <CategoryModel>[];
      json['categories'].forEach((v) {
        categories!.add(new CategoryModel.fromJson(v));
      });
    }
    if (json['tags'] != null) {
      tags = <String>[];
      json['tags'].forEach((v) {
        tags!.add(v.toString());
      });
    }
    if (json['reviews'] != null && json['reviews'] is List) {
      reviews = List<dynamic>.from(json['reviews']);
    }
    createdAt = json['created_at'];
    totalReaction = (json['total_reaction'] as num?)?.toInt();

    // Parse activity groups
    if (json['activity_groups'] != null && json['activity_groups'] is List) {
      activityGroups = <ActivityGroupModel>[];
      (json['activity_groups'] as List).forEach((v) {
        if (v is Map<String, dynamic>) {
          activityGroups!.add(ActivityGroupModel.fromJson(v));
        }
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['name'] = this.name;
    data['user_id'] = this.userId;
    data['address'] = this.address;
    data['description'] = this.description;
    data['category'] = this.category;
    data['category_id'] = this.categoryId;
    data['price_range'] = this.priceRange;
    data['price'] = this.price;
    data['style'] = this.style;
    data['ambience'] = this.ambience;
    data['rating'] = this.rating;
    data['average_rating'] = this.averageRating;
    data['reviews_count'] = this.reviewsCount;
    data['latitude'] = this.latitude;
    data['longitude'] = this.longitude;
    data['status'] = this.status;
    data['contact_email'] = this.contactEmail;
    data['contact_phone'] = this.contactPhone;
    data['admin_notes'] = this.adminNotes;
    data['is_anonymous'] = this.isAnonymous;
    data['is_favorited'] = this.isFavorited;
    if (this.images != null) {
      data['images'] = this.images!.map((v) => v.toJson()).toList();
    }
    if (this.categories != null) {
      data['categories'] = this.categories!.map((v) => v.toJson()).toList();
    }
    if (this.tags != null) {
      data['tags'] = this.tags;
    }
    if (this.reviews != null) {
      data['reviews'] = this.reviews;
    }
    data['created_at'] = this.createdAt;
    data['total_reaction'] = this.totalReaction;
    if (this.activityGroups != null) {
      data['activity_groups'] =
          this.activityGroups!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class CategoryModel {
  int? id;
  String? name;
  String? displayName;

  CategoryModel({this.id, this.name, this.displayName});

  CategoryModel.fromJson(Map<String, dynamic> json) {
    id = (json['id'] as num?)?.toInt();
    name = json['name'];
    displayName = json['display_name'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['name'] = this.name;
    data['display_name'] = this.displayName;
    return data;
  }
}

class Images {
  int? id;
  String? url;

  Images({this.id, this.url});

  Images.fromJson(Map<String, dynamic> json) {
    id = (json['id'] as num?)?.toInt();
    url = json['url'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['url'] = this.url;
    return data;
  }
}

class ActivityGroupModel {
  int? id;
  String? key;
  String? name;

  ActivityGroupModel({this.id, this.key, this.name});

  String get displayName => name ?? key ?? '';

  ActivityGroupModel.fromJson(Map<String, dynamic> json) {
    id = (json['id'] as num?)?.toInt();
    key = json['key'];
    name = json['name'] ?? json['display_name'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['key'] = this.key;
    data['name'] = this.name;
    return data;
  }
}
