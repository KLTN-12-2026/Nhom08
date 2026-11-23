/// Utility functions for formatting prices
class PriceFormatter {
  /// Format price with Vietnamese-style comma separators
  ///
  /// Examples:
  /// - 500 -> "500"
  /// - 1500 -> "1,500"
  /// - 2500000 -> "2,500,000"
  static String formatPrice(num price) {
    // Convert to string and add commas
    final priceStr = price.toInt().toString();
    final buffer = StringBuffer();

    // Add commas from right to left
    for (int i = 0; i < priceStr.length; i++) {
      if (i > 0 && (priceStr.length - i) % 3 == 0) {
        buffer.write(',');
      }
      buffer.write(priceStr[i]);
    }

    return buffer.toString();
  }
}
