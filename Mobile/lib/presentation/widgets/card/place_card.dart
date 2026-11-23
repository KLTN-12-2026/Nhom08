import 'package:flutter/material.dart';
import 'package:trove/presentation/widgets/tags/yellow_tag_mini.dart';
import 'package:trove/presentation/widgets/tags/styled_tag.dart';
import '../../../core/config/themes/app_colors.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';
import '../../../models/place.dart';
import 'package:cached_network_image/cached_network_image.dart';

class PlaceCard extends StatelessWidget {
  final Place place;
  final double? userLat;
  final double? userLng;

  const PlaceCard({Key? key, required this.place, this.userLat, this.userLng})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.push('/places/${place.id}');
      },
      child: Card(
        margin: const EdgeInsets.only(bottom: 8),
        elevation: 0.5,
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Row(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: backgroundSecondary,
                ),
                child: place.images.isNotEmpty
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: CachedNetworkImage(
                          imageUrl: place.images.first.url,
                          fit: BoxFit.cover,
                          placeholder: (context, url) =>
                              const _ShimmerPlaceholder(),
                          errorWidget: (context, url, error) => ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.asset(
                              'assets/images/default_dog.jpg',
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      )
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.asset(
                          'assets/images/default_dog.jpg',
                          fit: BoxFit.cover,
                        ),
                      ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            place.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (userLat != null && userLng != null)
                          Text(
                            place.getDistanceFromUser(userLat!, userLng!),
                            style: const TextStyle(
                              fontSize: 12,
                              color: textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        _buildRatingStars(place.averageRating ?? place.rating),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Wrap(
                            spacing: 4,
                            runSpacing: 4,
                            children: [
                              // Activity Groups (max 2)
                              if (place.activityGroups != null)
                                ...place.activityGroups!
                                    .take(1)
                                    .map((group) => YellowTagMini(
                                          text: group.displayName,
                                        )),
                              // Tags (max 1)
                              if (place.tags != null && place.tags!.isNotEmpty)
                                StyledTag(
                                  text: place.tags!.first,
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            place.address,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 11,
                              color: textSecondary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (place.totalReaction > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.red.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const FaIcon(
                                  FontAwesomeIcons.fire,
                                  size: 12,
                                  color: Colors.redAccent,
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  '${place.totalReaction} ',
                                  style: const TextStyle(
                                    color: Colors.redAccent,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRatingStars(double rating) {
    final List<Widget> stars = [];
    for (int i = 1; i <= 5; i++) {
      final filled = rating >= i;
      final half = rating >= i - 0.5 && rating < i;
      stars.add(Row(
        children: [
          FaIcon(
            filled
                ? FontAwesomeIcons.solidStar
                : (half
                    ? FontAwesomeIcons.starHalfStroke
                    : FontAwesomeIcons.star),
            size: 14,
            color: warningColor,
          ),
          if (i != 5) const SizedBox(width: 2),
        ],
      ));
    }
    return Row(children: stars);
  }
}

class PlaceCardSkeleton extends StatelessWidget {
  const PlaceCardSkeleton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: backgroundSecondary,
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _shimmerBox(width: double.infinity, height: 14),
                  const SizedBox(height: 8),
                  _shimmerBox(width: 120, height: 12),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _shimmerBox(width: 60, height: 10),
                      const SizedBox(width: 8),
                      _shimmerBox(width: 40, height: 10),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _shimmerBox({required double width, required double height}) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: backgroundSecondary,
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}

// Custom shimmer placeholder for image loading
class _ShimmerPlaceholder extends StatefulWidget {
  const _ShimmerPlaceholder({Key? key}) : super(key: key);

  @override
  State<_ShimmerPlaceholder> createState() => _ShimmerPlaceholderState();
}

class _ShimmerPlaceholderState extends State<_ShimmerPlaceholder>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    _animation = Tween<double>(begin: -2, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                backgroundSecondary,
                backgroundSecondary.withOpacity(0.5),
                backgroundSecondary,
              ],
              stops: [
                _animation.value - 0.3,
                _animation.value,
                _animation.value + 0.3,
              ].map((e) => e.clamp(0.0, 1.0)).toList(),
            ),
          ),
        );
      },
    );
  }
}
