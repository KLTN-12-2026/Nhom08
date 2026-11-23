import 'dart:io';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class DisplayImage extends StatelessWidget {
  final double radius;
  final IconData fallbackIcon;
  final Color backgroundColor;
  final String? imageUrl;
  final File? imageFile;
  final String? emptyImageAsset;

  const DisplayImage({
    this.radius = 35,
    this.fallbackIcon = Icons.person,
    this.backgroundColor = Colors.grey,
    this.imageUrl,
    this.imageFile,
    this.emptyImageAsset,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: radius * 2,
      height: radius * 2,
      child: CircleAvatar(
        radius: radius,
        backgroundColor: backgroundColor.withOpacity(0.3),
        child: ClipOval(
          child: Builder(
            builder: (context) {
              try {
                if (imageFile != null) {
                  return Image.file(
                    imageFile!,
                    width: radius * 2,
                    height: radius * 2,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      print('Image.file Error: $error');
                      return _buildEmptyPlaceholder();
                    },
                  );
                } else if (imageUrl != null) {
                  return CachedNetworkImage(
                    imageUrl: imageUrl!,
                    width: radius * 2,
                    height: radius * 2,
                    fit: BoxFit.cover,
                    placeholder: (context, url) =>
                        const CircularProgressIndicator(),
                    errorWidget: (context, url, error) {
                      print('CachedNetworkImage Error: $error');
                      return _buildEmptyPlaceholder();
                    },
                  );
                } else {
                  return _buildEmptyPlaceholder();
                }
              } catch (e, stackTrace) {
                print('DisplayImage Error: $e\n$stackTrace');
                return _buildEmptyPlaceholder();
              }
            },
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyPlaceholder() {
    return Container(
      width: radius * 2,
      height: radius * 2,
      color: backgroundColor.withOpacity(0.3),
      child: Center(
        child: Icon(
          fallbackIcon,
          size: radius,
          color: Colors.grey,
        ),
      ),
    );
  }
}
