// lib/domain/exceptions/place_exception.dart
abstract class PlaceException implements Exception {
  final String message;
  const PlaceException(this.message);
}

class PlaceNotFoundException extends PlaceException {
  const PlaceNotFoundException(String message) : super(message);
}

class PlaceValidationException extends PlaceException {
  const PlaceValidationException(String message) : super(message);
}

class PlaceGeneralException extends PlaceException {
  const PlaceGeneralException(String message) : super(message);
}
