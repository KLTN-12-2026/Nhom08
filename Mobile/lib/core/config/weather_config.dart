class WeatherConfig {
  // OpenWeatherMap API key - cần thêm vào .env hoặc config
  // Bạn có thể lấy free API key tại: https://openweathermap.org/api
  static const String apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
  
  // Base URL cho OpenWeatherMap API
  static const String baseUrl = 'https://api.openweathermap.org/data/2.5';
  
  // Default language (tiếng Việt)
  static const String defaultLang = 'vi';
  
  // Default units (metric = Celsius)
  static const String defaultUnits = 'metric';
}

