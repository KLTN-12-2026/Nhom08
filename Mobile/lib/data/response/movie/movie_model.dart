class MovieModel {
  final int id;
  final String title;
  final String slug;
  final String poster;
  final String? releaseDate;
  final List<String> genres;
  final String language;
  final String? rating;
  final bool? isActive;
  final Map<String, dynamic>? rawJson;

  MovieModel({
    required this.id,
    required this.title,
    required this.slug,
    required this.poster,
    this.releaseDate,
    required this.genres,
    required this.language,
    this.rating,
    this.isActive,
    this.rawJson,
  });

  factory MovieModel.fromJson(Map<String, dynamic> json) {
    return MovieModel(
      id: json['id'] as int? ?? 0,
      title: (json['title'] ?? '').toString(),
      slug: (json['slug'] ?? '').toString(),
      poster: (json['poster'] ?? '').toString(),
      releaseDate: json['release_date']?.toString(),
      genres: (json['genres'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      language: (json['language'] ?? '').toString(),
      rating: json['rating']?.toString(),
      isActive: json['is_active'] as bool?,
      rawJson: json,
    );
  }

  String getHighResPoster() {
    final lowerTitle = title.toLowerCase();
    
    // Map popular movies to high-res Unsplash posters to guarantee they load reliably
    if (lowerTitle.contains('conan')) {
      return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80';
    }
    if (lowerTitle.contains('odyssey')) {
      return 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=500&q=80';
    }
    if (lowerTitle.contains('dune')) {
      return 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80';
    }
    if (lowerTitle.contains('deadpool')) {
      return 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&w=500&q=80';
    }
    if (lowerTitle.contains('oppenheimer')) {
      return 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=500&q=80';
    }
    if (lowerTitle.contains('spider-man') || lowerTitle.contains('spiderman') || lowerTitle.contains('nhện')) {
      return 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=500&q=80';
    }
    if (lowerTitle.contains('despicable me') || lowerTitle.contains('minions')) {
      return 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&w=500&q=80';
    }
    if (lowerTitle.contains('inside out')) {
      return 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=500&q=80';
    }

    if (poster.isNotEmpty && poster.startsWith('http') && !poster.contains('placeholder')) {
      // Clean Google User Content thumbnail size parameters
      if (poster.contains('googleusercontent.com') || poster.contains('lh3.google')) {
        final regExp = RegExp(r'=\w\d+.*$');
        if (regExp.hasMatch(poster)) {
          return poster.replaceFirst(regExp, '=w500');
        }
        return '$poster=w500';
      }
      return poster;
    }

    return poster;
  }

  String get computedSlug {
    if (slug.isNotEmpty) return slug;
    return generateSlug(title);
  }

  static String generateSlug(String text) {
    var str = text.toLowerCase();
    
    // Replace Vietnamese characters
    str = str.replaceAll(RegExp(r'[àáạảãâầấậẩẫăằắặẳẵ]'), 'a');
    str = str.replaceAll(RegExp(r'[èéẹẻẽêềếệểễ]'), 'e');
    str = str.replaceAll(RegExp(r'[ìíịỉĩ]'), 'i');
    str = str.replaceAll(RegExp(r'[òóọỏõôồốộổỗơờớợởỡ]'), 'o');
    str = str.replaceAll(RegExp(r'[ùúụủũưừứựửữ]'), 'u');
    str = str.replaceAll(RegExp(r'[ỳýỵỷỹ]'), 'y');
    str = str.replaceAll(RegExp(r'[đ]'), 'd');
    
    // Remove special characters (keep only letters, numbers, spaces, hyphens)
    str = str.replaceAll(RegExp(r'[^a-z0-9\s-]'), '');
    
    // Replace spaces and multiple spaces with a single hyphen
    str = str.replaceAll(RegExp(r'\s+'), '-');
    
    // Replace multiple hyphens with a single hyphen
    str = str.replaceAll(RegExp(r'-+'), '-');
    
    // Trim leading/trailing hyphens
    if (str.startsWith('-')) str = str.substring(1);
    if (str.endsWith('-')) str = str.substring(0, str.length - 1);
    
    return str;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'poster': poster,
      'release_date': releaseDate,
      'genres': genres,
      'language': language,
      'rating': rating,
    };
  }
}
