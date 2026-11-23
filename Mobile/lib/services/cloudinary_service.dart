// lib/services/cloudinary_service.dart
import 'dart:io';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

/// Service for uploading images directly to Cloudinary
/// Supports both signed (with API key/secret) and unsigned (with preset) uploads
class CloudinaryService {
  // Load credentials from environment variables (.env file)
  static String get cloudName => dotenv.env['CLOUDINARY_CLOUD_NAME'] ?? '';
  static String get uploadPreset =>
      dotenv.env['CLOUDINARY_UPLOAD_PRESET'] ?? '';
  static String get apiKey => dotenv.env['CLOUDINARY_API_KEY'] ?? '';
  static String get apiSecret => dotenv.env['CLOUDINARY_API_SECRET'] ?? '';

  final Dio _dio;

  CloudinaryService({Dio? dio}) : _dio = dio ?? Dio();

  /// Compress an image file before upload
  /// Reduces file size by 60-80% while maintaining good quality
  Future<File?> _compressImage(File file) async {
    try {
      final dir = await getTemporaryDirectory();
      final targetPath = p.join(
        dir.path,
        '${DateTime.now().millisecondsSinceEpoch}_compressed${p.extension(file.path)}',
      );

      final result = await FlutterImageCompress.compressAndGetFile(
        file.absolute.path,
        targetPath,
        quality: 80, // Good balance between quality and file size
        minWidth: 1920, // Max width - good for most screens
        minHeight: 1920, // Max height
        format: CompressFormat.jpeg, // JPEG is best for photos
      );

      if (result != null) {
        final originalSize = await file.length();
        final compressedSize = await File(result.path).length();
        final reduction = ((originalSize - compressedSize) / originalSize * 100)
            .toStringAsFixed(1);
        print(
            '📦 Compressed: ${(originalSize / 1024).toStringAsFixed(0)}KB → ${(compressedSize / 1024).toStringAsFixed(0)}KB (-$reduction%)');
        return File(result.path);
      }

      return file; // Return original if compression fails
    } catch (e) {
      print('⚠️ Compression failed, using original: $e');
      return file; // Return original on error
    }
  }

  /// Upload a single image to Cloudinary using SIGNED upload
  /// No upload preset required - uses API key and secret for authentication
  /// Automatically compresses the image before upload
  /// Returns the secure URL of the uploaded image, or null on failure
  Future<String?> uploadImage(
    File file, {
    String folder = 'places',
    Function(double)? onProgress,
  }) async {
    try {
      // 🔍 Debug: Print configuration
      print('🔧 Cloudinary Config (Signed Upload):');
      print('   Cloud Name: $cloudName');
      print(
          '   API Key: ${apiKey.isNotEmpty ? "${apiKey.substring(0, 4)}..." : "NOT SET"}');
      print('   Folder: $folder');
      print('   File path: ${file.path}');

      // Validate configuration
      if (cloudName.isEmpty) {
        print('❌ ERROR: CLOUDINARY_CLOUD_NAME is not set in .env file');
        return null;
      }
      if (apiKey.isEmpty || apiSecret.isEmpty) {
        print(
            '❌ ERROR: CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET is not set in .env file');
        return null;
      }

      // Compress image first to reduce upload time
      final compressedFile = await _compressImage(file);
      if (compressedFile == null) {
        print('❌ Image compression returned null');
        return null;
      }

      // Generate timestamp for signature
      final timestamp = DateTime.now().millisecondsSinceEpoch ~/ 1000;

      // Create signature for signed upload
      final signature = _generateSignature(
        timestamp: timestamp,
        folder: folder,
      );

      // Build form data with signature
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          compressedFile.path,
          filename: compressedFile.path.split('/').last,
        ),
        'api_key': apiKey,
        'timestamp': timestamp,
        'signature': signature,
        'folder':
            folder, // Organize uploads by type (places, reviews, avatars, etc.)
      });

      print(
          '📤 Uploading to: https://api.cloudinary.com/v1_1/$cloudName/image/upload (SIGNED)');

      final response = await _dio.post(
        'https://api.cloudinary.com/v1_1/$cloudName/image/upload',
        data: formData,
        onSendProgress: (sent, total) {
          if (onProgress != null && total > 0) {
            onProgress(sent / total);
          }
        },
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final url = data['secure_url'] as String?;
        print('✅ Upload successful! URL: $url');
        return url;
      }

      print('⚠️ Unexpected status code: ${response.statusCode}');
      return null;
    } on DioException catch (e) {
      print('❌ Cloudinary upload failed');
      print('   Status code: ${e.response?.statusCode}');
      print('   Response data: ${e.response?.data}');
      print('   Error message: ${e.message}');

      // Parse Cloudinary error message if available
      if (e.response?.data != null) {
        try {
          final errorData = e.response!.data;
          if (errorData is Map && errorData.containsKey('error')) {
            print('   Cloudinary error: ${errorData['error']}');
          }
        } catch (_) {
          // Ignore parsing errors
        }
      }

      return null;
    } catch (e) {
      print('❌ Cloudinary upload failed: $e');
      return null;
    }
  }

  /// Generate SHA-256 signature for signed Cloudinary uploads
  /// Required when not using upload presets
  String _generateSignature({
    required int timestamp,
    required String folder,
  }) {
    // Build parameters string in alphabetical order (Cloudinary requirement)
    final params = 'folder=$folder&timestamp=$timestamp$apiSecret';

    // Generate SHA-1 hash (Cloudinary uses SHA-1, not SHA-256)
    final bytes = utf8.encode(params);
    final digest = sha1.convert(bytes);

    return digest.toString();
  }

  /// Upload multiple images to Cloudinary in parallel
  /// Returns a list of secure URLs (skips failed uploads)
  Future<List<String>> uploadMultiple(
    List<File> files, {
    Function(int completed, int total)? onProgress,
  }) async {
    if (files.isEmpty) return [];

    int completed = 0;
    final urls = <String>[];

    // Upload all images in parallel using Future.wait
    final uploadFutures = files.map((file) async {
      final url = await uploadImage(file);
      completed++;
      onProgress?.call(completed, files.length);
      return url;
    }).toList();

    final results = await Future.wait(uploadFutures);

    // Filter out null values (failed uploads)
    for (final url in results) {
      if (url != null) {
        urls.add(url);
      }
    }

    return urls;
  }

  /// Validate Cloudinary configuration
  bool isConfigured() {
    return cloudName.isNotEmpty && uploadPreset.isNotEmpty;
  }
}
