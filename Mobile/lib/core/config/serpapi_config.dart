/// Configuration cho SerpAPI
///
/// Để sử dụng SerpAPI, bạn cần đăng ký và lấy API key từ https://serpapi.com/
/// Sau đó thêm API key vào đây hoặc truyền trực tiếp khi khởi tạo service
class SerpApiConfig {
  /// API key của SerpAPI
  ///
  /// Lấy từ: https://serpapi.com/dashboard
  ///
  /// Nếu không set ở đây, có thể truyền trực tiếp khi gọi service methods
  static const String? apiKey =
      '16110ffc0a6c7d0f2e77fda42f1837aa50f33238b678b5d6493fef9f2f529501';

  /// Cấu hình mặc định cho Việt Nam
  static const String defaultGl = 'vn'; // Country code cho Việt Nam
  static const String defaultHl = 'vi'; // Language code cho tiếng Việt
  static const String defaultGoogleDomain = 'google.com.vn';
  static const String defaultCr =
      'countryVN'; // Country restriction cho Việt Nam
  static const String defaultLr =
      'lang_vi'; // Language restriction cho tiếng Việt
}
