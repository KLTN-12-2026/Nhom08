import 'package:flutter/material.dart';
import 'package:trove/presentation/widgets/loading/gif_loading_widget.dart';

class LoadingService {
  static final LoadingService _instance = LoadingService._internal();
  factory LoadingService() => _instance;
  LoadingService._internal();

  bool _isLoading = false;
  String? _message;
  BuildContext? _context;

  bool get isLoading => _isLoading;
  String? get message => _message;

  /// Show loading overlay on current screen
  void showLoading(BuildContext context,
      {String? message, bool useGif = false}) {
    if (_isLoading) return;

    _context = context;
    _isLoading = true;
    _message = message;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => WillPopScope(
        onWillPop: () async => false,
        child: useGif
            ? GifLoadingDialog(message: message)
            : _LoadingDialog(message: message),
      ),
    );
  }

  /// Hide loading overlay
  void hideLoading() {
    if (!_isLoading || _context == null) return;

    _isLoading = false;
    _message = null;

    if (_context!.mounted) {
      Navigator.of(_context!, rootNavigator: true).pop();
    }
    _context = null;
  }

  /// Show loading with custom message
  void showLoadingWithMessage(BuildContext context, String message,
      {bool useGif = false}) {
    showLoading(context, message: message, useGif: useGif);
  }

  /// Show loading for a specific duration
  Future<void> showLoadingForDuration(
    BuildContext context, {
    String? message,
    Duration duration = const Duration(seconds: 2),
    bool useGif = false,
  }) async {
    showLoading(context, message: message, useGif: useGif);
    await Future.delayed(duration);
    hideLoading();
  }

  /// Show loading while executing a future
  Future<T> showLoadingWhile<T>(
    BuildContext context,
    Future<T> future, {
    String? message,
    bool useGif = false,
  }) async {
    showLoading(context, message: message, useGif: useGif);
    try {
      final result = await future;
      hideLoading();
      return result;
    } catch (e) {
      hideLoading();
      rethrow;
    }
  }
}

class _LoadingDialog extends StatelessWidget {
  final String? message;

  const _LoadingDialog({this.message});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
              strokeWidth: 3,
            ),
            if (message != null) ...[
              const SizedBox(height: 16),
              Text(
                message!,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// Extension for easy access
extension LoadingServiceExtension on BuildContext {
  void showLoading({String? message, bool useGif = false}) {
    LoadingService().showLoading(this, message: message, useGif: useGif);
  }

  void hideLoading() {
    LoadingService().hideLoading();
  }

  void showLoadingWithMessage(String message, {bool useGif = false}) {
    LoadingService().showLoadingWithMessage(this, message, useGif: useGif);
  }

  Future<void> showLoadingForDuration({
    String? message,
    Duration duration = const Duration(seconds: 2),
    bool useGif = false,
  }) {
    return LoadingService().showLoadingForDuration(
      this,
      message: message,
      duration: duration,
      useGif: useGif,
    );
  }

  Future<T> showLoadingWhile<T>(
    Future<T> future, {
    String? message,
    bool useGif = false,
  }) {
    return LoadingService().showLoadingWhile(
      this,
      future,
      message: message,
      useGif: useGif,
    );
  }

  // GIF specific methods
  void showGifLoading({String? message}) {
    showLoading(message: message, useGif: true);
  }

  void showGifLoadingWithMessage(String message) {
    showLoadingWithMessage(message, useGif: true);
  }

  Future<void> showGifLoadingForDuration({
    String? message,
    Duration duration = const Duration(seconds: 2),
  }) {
    return showLoadingForDuration(
      message: message,
      duration: duration,
      useGif: true,
    );
  }

  Future<T> showGifLoadingWhile<T>(
    Future<T> future, {
    String? message,
  }) {
    return showLoadingWhile(
      future,
      message: message,
      useGif: true,
    );
  }
}
