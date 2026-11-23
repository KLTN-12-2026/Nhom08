import 'package:trove/data/data_sources/remote/api_client.dart';
import 'package:trove/data/response/movie/detail_response.dart';
import 'package:trove/data/response/movie/movie_model.dart';
import 'package:trove/data/response/movie/movies_response.dart';

class MovieService {
  final ApiClient _apiClient;

  MovieService(this._apiClient);

  static final List<MovieModel> initialMovies = [
    MovieModel(
      id: 1,
      title: "Người Nhện 4: Khởi Đầu Mới",
      slug: "spiderman-4",
      poster: "https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500/8Vt6egLkgugVTJU6v7v61nZIfEs.jpg",
      releaseDate: "Đang chiếu",
      genres: ["ACTION", "ADVENTURE"],
      language: "vi",
      rating: "100%",
      isActive: true,
      rawJson: {
        "description": "Peter Parker trở lại trong cuộc phiêu lưu đa vũ trụ mới đầy kịch tính. Đối mặt với những kẻ thù chưa từng xuất hiện, Spider-Man phải tìm cách bảo vệ không chỉ thành phố mà cả thực tại.\n\nPhim được đánh giá cao với những pha hành động mãn nhãn và cốt truyện sâu sắc về trách nhiệm và sự hy sinh của người anh hùng."
      },
    ),
    MovieModel(
      id: 2,
      title: "Conan Movie 29 (2026): Thiên Thần Báo Thù",
      slug: "conan-movie-29",
      poster: "https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500/rZ7eB1761WqEusM9387x27f5Dk7.jpg",
      releaseDate: "Đang chiếu",
      genres: ["ACTION", "FAMILY"],
      language: "vi",
      rating: "93%",
      isActive: true,
      rawJson: {
        "description": "Thám tử lừng danh Conan trở lại trong cuộc phiêu lưu thứ 29. Một loạt vụ nổ bí ẩn xảy ra tại các địa danh nổi tiếng khắp Nhật Bản, Conan cùng FBI và CIA hợp tác điều tra.\n\nPhim hứa hẹn mang đến những tình tiết kịch tính, hấp dẫn và cái kết bất ngờ."
      },
    ),
    MovieModel(
      id: 3,
      title: "The Odyssey",
      slug: "the-odyssey",
      poster: "https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500/d594m23U4PjGk87sYhY14o2F8rX.jpg",
      releaseDate: "Đang chiếu",
      genres: ["ACTION", "DRAMA", "MYTHOLOGY"],
      language: "en",
      rating: "98%",
      isActive: true,
      rawJson: {
        "description": "Bộ phim tiếp theo của Christopher Nolan, The Odyssey, là một sử thi hành động mang màu sắc thần thoại, được quay tại nhiều địa điểm trên khắp thế giới bằng công nghệ phim IMAX® hoàn toàn mới.\n\nPhim The Odyssey theo chân Odysseus trong hành trình trở về nhà sau cuộc chiến thành Troy, tràn ngập thử thách như cuộc chạm trán của ông với Polyphemus, các nàng tiên cá, Circe và kết thúc bằng cuộc đoàn tụ với vợ mình, Penelope."
      },
    ),
    MovieModel(
      id: 4,
      title: "Minions & Quái Vật",
      slug: "minions",
      poster: "https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500/wWba3074465O2jFL2t26galwXeI.jpg",
      releaseDate: "Đang chiếu",
      genres: ["ANIMATION", "COMEDY"],
      language: "vi",
      rating: "85%",
      isActive: true,
      rawJson: {
        "description": "Các Minions đáng yêu quay trở lại trong một cuộc phiêu lưu hài hước mới. Lần này, chúng vô tình giải phóng một quái vật cổ đại và phải tìm cách ngăn chặn thảm họa trước khi quá muộn.\n\nPhim mang đến những tràng cười không ngớt cùng bài học ý nghĩa về tình bạn."
      },
    ),
    MovieModel(
      id: 5,
      title: "Công Viên Giải Thoát",
      slug: "cong-vien-giai-thoat",
      poster: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=400&q=80",
      releaseDate: "Đang chiếu",
      genres: ["HORROR", "MYSTERY"],
      language: "vi",
      rating: "90%",
      isActive: true,
      rawJson: {
        "description": "Một nhóm bạn trẻ quyết định khám phá công viên bỏ hoang ngoại ô thành phố, nơi từng xảy ra những vụ mất tích bí ẩn. Họ sớm nhận ra mình đã bước vào một cái bẫy chết người không lối thoát."
      },
    ),
    MovieModel(
      id: 6,
      title: "Lời Nguyền Huyết Tộc",
      slug: "loi-nguyen-huyet-toc",
      poster: "https://images.unsplash.com/photo-1505635338219-0a113f6675e1?auto=format&fit=crop&w=400&q=80",
      releaseDate: "Đang chiếu",
      genres: ["HORROR", "THRILLER"],
      language: "vi",
      rating: "88%",
      isActive: true,
      rawJson: {
        "description": "Lời nguyền truyền kiếp đeo bám một gia đình quyền quý qua nhiều thế hệ. Khi người thừa kế cuối cùng quay về lâu đài cổ, những bí mật kinh hoàng dần được phơi bày dưới ánh trăng máu."
      },
    ),
    MovieModel(
      id: 7,
      title: "Deadpool & Wolverine",
      slug: "deadpool-wolverine",
      poster: "https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500/8cdWjvZqExXMgoHj6t2Gsa86glF.jpg",
      releaseDate: "Đang chiếu",
      genres: ["ACTION", "COMEDY", "SCI-FI"],
      language: "en",
      rating: "96%",
      isActive: true,
      rawJson: {
        "description": "Cặp đôi bá đạo nhất vũ trụ Marvel hội ngộ trong cuộc hành trình giải cứu thế giới đầy điên rồ, hài hước và ngập tràn những pha hành động mãn nhãn khó quên."
      },
    ),
    MovieModel(
      id: 8,
      title: "Inside Out 2: Những Mảnh Ghép Cảm Xúc 2",
      slug: "inside-out-2",
      poster: "https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500/vpnVM9B6mxgjYsANJmw4u84jgoj.jpg",
      releaseDate: "Đang chiếu",
      genres: ["ANIMATION", "FAMILY", "COMEDY"],
      language: "vi",
      rating: "95%",
      isActive: true,
      rawJson: {
        "description": "Cô bé Riley đã bước vào tuổi dậy thì, mang đến những cảm xúc mới toanh chưa từng xuất hiện tại trung tâm điều khiển cảm xúc: Lo Âu, Ghen Tị, Chán Nản và Xấu Hổ."
      },
    ),
  ];

  Future<List<MovieModel>> getMovies() async {
    try {
      final response = await _apiClient.appService.getMovies();

      if (response.success == true && response.data != null && response.data!.isNotEmpty) {
        print(
            "✅ MovieService: Get movies thành công - ${response.data!.length} movies");
        return response.data!;
      } else {
        print("⚠️ MovieService: Response không thành công hoặc trống. Sử dụng danh sách phim mặc định.");
        return initialMovies;
      }
    } catch (e) {
      print("❌ MovieService error: $e. Sử dụng danh sách phim mặc định.");
      return initialMovies;
    }
  }

  Future<MovileDetailData?> getMovieDetail(String slug) async {
    try {
      final response = await _apiClient.appService.getMovieDetail(slug);

      if (response.success == true && response.data != null) {
        print(
            "✅ MovieService: Get detail thành công - ${response.data!.title}");
        return response.data;
      } else {
        print("⚠️ MovieService: Response không thành công, tìm kiếm trong dữ liệu cục bộ.");
        return _fallbackDetail(slug);
      }
    } catch (e) {
      print("❌ MovieService error: $e, tìm kiếm trong dữ liệu cục bộ.");
      return _fallbackDetail(slug);
    }
  }

  MovileDetailData? _fallbackDetail(String slug) {
    try {
      final localMovie = initialMovies.firstWhere(
        (m) => m.slug == slug || m.computedSlug == slug,
      );
      return MovileDetailData(
        slug: localMovie.slug,
        title: localMovie.title,
        poster: localMovie.poster,
        releaseDate: localMovie.releaseDate,
        genres: localMovie.genres,
        rating: localMovie.rating,
        description: localMovie.rawJson?['description'] ??
            "Phim đang chiếu tại rạp Starlight Đà Nẵng. Hãy nhanh tay đặt vé để trải nghiệm tác phẩm điện ảnh xuất sắc này.",
        trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        pageUrl: "https://moveek.com/rap/starlight-da-nang/",
        isActive: localMovie.isActive,
      );
    } catch (_) {
      return null;
    }
  }
}
