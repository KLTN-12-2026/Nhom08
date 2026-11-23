import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/config/themes/app_colors.dart';
import '../../../models/place.dart';

class PlaceCardMini extends StatelessWidget {
  final Place place;
  final VoidCallback? onAdd;
  final bool showAdded;

  const PlaceCardMini({
    Key? key,
    required this.place,
    this.onAdd,
    this.showAdded = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderPrimary),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Container(
              width: 56,
              height: 56,
              color: backgroundSecondary,
              child: place.images.isNotEmpty
                  ? Image.network(
                      place.images.first.getAbsoluteUrl(),
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Center(
                        child: FaIcon(
                          FontAwesomeIcons.image,
                          size: 20,
                          color: textSecondary,
                        ),
                      ),
                    )
                  : const Center(
                      child: FaIcon(
                        FontAwesomeIcons.image,
                        size: 20,
                        color: textSecondary,
                      ),
                    ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  place.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  place.address,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 12, color: textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          showAdded
              ? Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Icon(Icons.check_circle,
                      size: 16, color: Colors.green.shade700),
                )
              : ElevatedButton(
                  onPressed: onAdd,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: blackPrimary,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    elevation: 0,
                    minimumSize:
                        const Size(0, 32), // Không dùng double.infinity
                  ),
                  child: const Text(
                    'Thêm',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                )
        ],
      ),
    );
  }
}

class PlaceCardMiniSkeleton extends StatelessWidget {
  const PlaceCardMiniSkeleton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderPrimary),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: backgroundSecondary,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _shimmerBox(width: double.infinity, height: 14),
                const SizedBox(height: 4),
                _shimmerBox(width: 120, height: 12),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 60,
            height: 32,
            decoration: BoxDecoration(
              color: backgroundSecondary,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ],
      ),
    );
  }

  Widget _shimmerBox({required double width, required double height}) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: backgroundSecondary,
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}
