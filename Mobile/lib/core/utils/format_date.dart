import 'package:intl/intl.dart';

/// Format a [DateTime] to string with given [pattern] and optional [locale].
/// - Returns [placeholder] when [date] is null or formatting fails.
String formatDate(
  DateTime? date, {
  String pattern = 'dd/MM/yyyy',
  String? locale,
  String placeholder = '',
}) {
  if (date == null) return placeholder;
  try {
    return DateFormat(pattern, locale).format(date);
  } catch (_) {
    return placeholder;
  }
}

/// Convenience: format ISO string safely.
String formatDateFromIso(
  String? isoString, {
  String pattern = 'dd/MM/yyyy',
  String? locale,
  String placeholder = '',
}) {
  if (isoString == null || isoString.isEmpty) return placeholder;
  try {
    final dt = DateTime.parse(isoString);
    return formatDate(dt,
        pattern: pattern, locale: locale, placeholder: placeholder);
  } catch (_) {
    return placeholder;
  }
}








