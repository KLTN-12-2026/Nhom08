import React, { useState, useEffect } from "react";
import { Card, Tag, Button, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import useLanguageStore from "../../stores/languageStore.ts";
import RepositoryManager from "../../data/repositoryManager";

interface Movie {
  id: number | string;
  title: string;
  genres: string[];
  date: string;
  rating: string;
  image: string;
  description: string;
  keywords: string[];
  moveekUrl: string;
}

const initialMovies: Movie[] = [
  {
    id: 1,
    title: "Người Nhện 4: Khởi Đầu Mới",
    genres: ["ACTION", "ADVENTURE"],
    date: "Đang chiếu",
    rating: "100%",
    image: "/images/movies/spiderman.png",
    description: "Peter Parker trở lại trong cuộc phiêu lưu đa vũ trụ mới đầy kịch tính. Đối mặt với những kẻ thù chưa từng xuất hiện, Spider-Man phải tìm cách bảo vệ không chỉ thành phố mà cả thực tại.\n\nPhim được đánh giá cao với những pha hành động mãn nhãn và cốt truyện sâu sắc về trách nhiệm và sự hy sinh của người anh hùng.",
    keywords: ["Người Nhện 4", "lịch chiếu Spider-Man", "mua vé Spider-Man", "review phim Spider-Man"],
    moveekUrl: "https://moveek.com"
  },
  {
    id: 2,
    title: "Conan Movie 29 (2026): Thiên Thần Báo Thù",
    genres: ["ACTION", "FAMILY"],
    date: "Đang chiếu",
    rating: "93%",
    image: "/images/movies/conan.png",
    description: "Thám tử lừng danh Conan trở lại trong cuộc phiêu lưu thứ 29. Một loạt vụ nổ bí ẩn xảy ra tại các địa danh nổi tiếng khắp Nhật Bản, Conan cùng FBI và CIA hợp tác điều tra.\n\nPhim hứa hẹn mang đến những tình tiết kịch tính, hấp dẫn và cái kết bất ngờ.",
    keywords: ["Conan Movie 29", "lịch chiếu Conan", "mua vé Conan", "review phim Conan"],
    moveekUrl: "https://moveek.com"
  },
  {
    id: 3,
    title: "The Odyssey",
    genres: ["ACTION", "DRAMA", "MYTHOLOGY"],
    date: "Đang chiếu",
    rating: "98%",
    image: "/images/movies/odyssey.png",
    description: "Bộ phim tiếp theo của Christopher Nolan, The Odyssey, là một sử thi hành động mang màu sắc thần thoại, được quay tại nhiều địa điểm trên khắp thế giới bằng công nghệ phim IMAX® hoàn toàn mới.\n\nPhim The Odyssey theo chân Odysseus trong hành trình trở về nhà sau cuộc chiến thành Troy, tràn ngập thử thách như cuộc chạm trán của ông với Polyphemus, các nàng tiên cá, Circe và kết thúc bằng cuộc đoàn tụ với vợ mình, Penelope.",
    keywords: ["The Odyssey", "lịch chiếu The Odyssey", "mua vé The Odyssey", "review phim The Odyssey"],
    moveekUrl: "https://moveek.com"
  },
  {
    id: 4,
    title: "Minions & Quái Vật",
    genres: ["ANIMATION", "COMEDY"],
    date: "Đang chiếu",
    rating: "85%",
    image: "/images/movies/minions.png",
    description: "Các Minions đáng yêu quay trở lại trong một cuộc phiêu lưu hài hước mới. Lần này, chúng vô tình giải phóng một quái vật cổ đại và phải tìm cách ngăn chặn thảm họa trước khi quá muộn.\n\nPhim mang đến những tràng cười không ngớt cùng bài học ý nghĩa về tình bạn.",
    keywords: ["Minions", "lịch chiếu Minions", "mua vé Minions", "review phim Minions"],
    moveekUrl: "https://moveek.com"
  },
  {
    id: 5,
    title: "Công Viên Giải Thoát",
    genres: ["HORROR", "MYSTERY"],
    date: "Đang chiếu",
    rating: "90%",
    image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=400&q=80",
    description: "Một nhóm bạn trẻ quyết định khám phá công viên bỏ hoang ngoại ô thành phố, nơi từng xảy ra những vụ mất tích bí ẩn. Họ sớm nhận ra mình đã bước vào một cái bẫy chết người không lối thoát.",
    keywords: ["Công Viên Giải Thoát", "lịch chiếu Công Viên Giải Thoát", "đặt vé Công Viên Giải Thoát"],
    moveekUrl: "https://moveek.com"
  },
  {
    id: 6,
    title: "Lời Nguyền Huyết Tộc",
    genres: ["HORROR", "THRILLER"],
    date: "Đang chiếu",
    rating: "88%",
    image: "https://images.unsplash.com/photo-1505635338219-0a113f6675e1?auto=format&fit=crop&w=400&q=80",
    description: "Lời nguyền truyền kiếp đeo bám một gia đình quyền quý qua nhiều thế hệ. Khi người thừa kế cuối cùng quay về lâu đài cổ, những bí mật kinh hoàng dần được phơi bày dưới ánh trăng máu.",
    keywords: ["Lời Nguyền Huyết Tộc", "lịch chiếu Lời Nguyền Huyết Tộc", "vé phim kinh dị"],
    moveekUrl: "https://moveek.com"
  },
  {
    id: 7,
    title: "Deadpool & Wolverine",
    genres: ["ACTION", "COMEDY", "SCI-FI"],
    date: "Đang chiếu",
    rating: "96%",
    image: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&w=400&q=80",
    description: "Cặp đôi bá đạo nhất vũ trụ Marvel hội ngộ trong cuộc hành trình giải cứu thế giới đầy điên rồ, hài hước và ngập tràn những pha hành động mãn nhãn khó quên.",
    keywords: ["Deadpool & Wolverine", "Deadpool 3", "lịch chiếu Deadpool", "mua vé Deadpool"],
    moveekUrl: "https://moveek.com"
  },
  {
    id: 8,
    title: "Inside Out 2: Những Mảnh Ghép Cảm Xúc 2",
    genres: ["ANIMATION", "FAMILY", "COMEDY"],
    date: "Đang chiếu",
    rating: "95%",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80",
    description: "Cô bé Riley đã bước vào tuổi dậy thì, mang đến những cảm xúc mới toanh chưa từng xuất hiện tại trung tâm điều khiển cảm xúc: Lo Âu, Ghen Tị, Chán Nản và Xấu Hổ.",
    keywords: ["Inside Out 2", "Những Mảnh Ghép Cảm Xúc 2", "lịch chiếu Inside Out 2", "mua vé Inside Out 2"],
    moveekUrl: "https://moveek.com"
  }
];

export default function CustomerMovies() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguageStore();

  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const res = await RepositoryManager.places.getLiveMovies();
        if (res && res.success && Array.isArray(res.data)) {
          const apiList = res.data.map((m: any) => ({
            id: m.id || Math.random().toString(),
            title: m.title || "Không có tiêu đề",
            genres: Array.isArray(m.genres) ? m.genres : [],
            date: m.release_date || "Đang chiếu",
            rating: m.rating || "90%",
            image: m.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80",
            description: m.description || "Phim đang chiếu tại cụm rạp Đà Nẵng. Hãy nhanh tay đặt vé để trải nghiệm tác phẩm điện ảnh xuất sắc này.",
            keywords: [m.title || "Phim", "Đà Nẵng", "Lịch chiếu phim"],
            moveekUrl: m.slug ? `https://moveek.com/phim/${m.slug}/` : "https://moveek.com",
          }));
          if (apiList.length > 0) {
            setMovies(apiList);
          }
        }
      } catch (error) {
        console.error("Failed to fetch live movies", error);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Spin size="large" />
      </div>
    );
  }

  // Detail mode: show specific movie
  if (id) {
    const movie = movies.find(m => m.id === Number(id));
    if (!movie) return <div className="text-center py-20 text-gray-400 font-bold">{t("movies.movieNotFound")}</div>;

    return (
      <div className="w-full max-w-4xl mx-auto py-10 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24 space-y-8">
        {/* Hero Cover Image */}
        <div className="w-full h-[400px] rounded-[32px] overflow-hidden relative shadow-lg">
          <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Title + Rating Badge */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-black text-black dark:text-white leading-tight">{movie.title}</h1>
          <span className="bg-[#FFCB37] text-black font-black text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm">
            ★ {movie.rating}
          </span>
        </div>

        {/* Info detail banner */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-amber-500" /> {t("movies.cinemaLocation")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-2">
              <i className="fa-regular fa-calendar" /> {t("movies.weeklyShowtimes")}
            </p>
          </div>
          <a
            href={movie.moveekUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black font-bold rounded-xl text-xs text-center transition-all shadow-sm shrink-0"
          >
            {t("movies.buyTickets")}
          </a>
        </div>

        {/* Keyword Tags */}
        <div className="flex flex-wrap gap-2">
          {movie.keywords.map((kw, i) => (
            <span key={i} className="px-4 py-2 border border-[#FFCB37] text-[#E6B000] font-bold text-xs rounded-full hover:bg-[#FFCB37]/10 transition-colors cursor-pointer">
              {kw}
            </span>
          ))}
        </div>

        {/* Introduction / Description */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-[32px] p-8 shadow-sm">
          <h2 className="text-xl font-black text-black dark:text-white mb-4">{t("movies.intro") || "Giới thiệu phim"}</h2>
          <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line text-sm font-semibold">
            {movie.description}
          </div>
        </Card>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-2">
          {movie.genres.map((g, i) => (
            <Tag key={i} className="rounded-full font-black text-[11px] border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 px-3 py-1 !text-gray-600 dark:!text-gray-300">
              {g}
            </Tag>
          ))}
        </div>
      </div>
    );
  }

  // List mode: Trending Now grid
  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24 space-y-8">
      <div className="border-b border-gray-150 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">
            {t("movies.pageTitle")}
          </h1>
          <p className="text-gray-500 font-semibold text-sm mt-1">
            {t("movies.pageSub")}
          </p>
        </div>
      </div>

      {/* Movies Poster Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/movies/${movie.id}`)}
            className="group cursor-pointer"
          >
            {/* Poster Image */}
            <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-md relative bg-gray-100 dark:bg-gray-850">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Movie Info Below Poster */}
            <div className="mt-3 space-y-1.5">
              <h3 className="font-black text-sm text-black dark:text-white leading-tight line-clamp-2 group-hover:text-[#E6B000] transition-colors">
                {movie.title}
              </h3>
              <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                <span className="flex items-center gap-1">
                  <i className="fa-regular fa-clock" /> {movie.date === "Đang chiếu" ? t("movies.nowShowing") : movie.date}
                </span>
                <span className="flex items-center gap-1 text-[#FFCB37]">
                  ★ {movie.rating}
                </span>
              </div>
              {/* Genre Tags */}
              <div className="flex flex-wrap gap-1">
                {movie.genres.map((g, i) => (
                  <Tag key={i} className="rounded-md font-black text-[9px] border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 px-1.5 py-0 m-0 !text-gray-600 dark:!text-gray-300">
                    {g}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
