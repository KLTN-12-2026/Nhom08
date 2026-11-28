import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/config/themes/app_colors.dart';
import '../../../../presentation/widgets/snackbar/app_snack.dart';
import '../../../../presentation/bloc/place/place_detail/place_detail_bloc.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ImageUploadDialog extends StatefulWidget {
  final List<XFile> initialImages;
  final int placeId;
  final BuildContext parentContext;

  const ImageUploadDialog({
    Key? key,
    required this.initialImages,
    required this.placeId,
    required this.parentContext,
  }) : super(key: key);

  @override
  State<ImageUploadDialog> createState() => _ImageUploadDialogState();
}

class _ImageUploadDialogState extends State<ImageUploadDialog> {
  late List<XFile> _images;
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    _images = List.from(widget.initialImages);
  }

  Future<void> _pickMoreImages() async {
    final picker = ImagePicker();
    try {
      final List<XFile> pickedFiles = await picker.pickMultiImage();
      if (pickedFiles.isNotEmpty) {
        setState(() {
          _images.addAll(pickedFiles);
        });
      }
    } catch (e) {
      print('Error picking more images: ');
    }
  }

  void _removeImage(int index) {
    setState(() {
      _images.removeAt(index);
    });
    if (_images.isEmpty) {
      Navigator.of(context).pop();
    }
  }

  void _uploadImages() {
    setState(() {
      _isUploading = true;
    });

    final files = _images.map((xFile) => File(xFile.path)).toList();

    widget.parentContext.read<PlaceDetailBloc>().add(
          PlaceDetailImagesUploaded(
            placeId: widget.placeId,
            images: files,
          ),
        );

    Navigator.of(context).pop();

    widget.parentContext.success('Đang tải ảnh lên...');
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Xem trước ảnh',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 120,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _images.length + 1,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  if (index == _images.length) {
                    return GestureDetector(
                      onTap: _pickMoreImages,
                      child: Container(
                        width: 100,
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey[400]!),
                        ),
                        child: const Center(
                          child: Icon(Icons.add, size: 32, color: Colors.grey),
                        ),
                      ),
                    );
                  }

                  final image = _images[index];
                  return Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.file(
                          File(image.path),
                          width: 100,
                          height: 120,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Positioned(
                        top: 4,
                        right: 4,
                        child: GestureDetector(
                          onTap: () => _removeImage(index),
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.black54,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.close,
                              size: 16,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text(
                    'Hủy',
                    style: TextStyle(color: textSecondary),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isUploading ? null : _uploadImages,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: _isUploading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Gửi'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

