import 'dart:async';

import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:trove/core/utils/format_date.dart';
import 'package:trove/data/response/place/places_detail_response.dart';
import 'package:trove/models/review.dart';
import 'package:trove/presentation/widgets/dialogs/report_dialog.dart';
import 'package:go_router/go_router.dart';
import 'package:trove/core/config/router/app_routes.dart';
import 'package:trove/presentation/widgets/tags/grey_tag.dart';
import '../../../core/config/themes/app_colors.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../models/place.dart';
import '../place/review_sheet.dart';
import '../../bloc/place/place_detail/place_detail_bloc.dart';
import '../../bloc/bloc_factory.dart';
// import '../../bloc/place/place_review/place_review_state.dart';
import 'package:image_picker/image_picker.dart';
import '../../widgets/card/review_card.dart';
import '../../widgets/tags/yellow_tag.dart';
import '../../widgets/auth_builder.dart';
import '../../widgets/snackbar/app_snack.dart';
import 'widgets/quick_rating_widget.dart';
import 'widgets/image_carousel_with_dots.dart';
import 'widgets/image_upload_dialog.dart';
import '../../widgets/dialogs/dialog_helper.dart';
import '../../../utils/price_formatter.dart';

class PlaceDetailScreen extends StatelessWidget {
  final String placeId;

  const PlaceDetailScreen({Key? key, required this.placeId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => blocFactory.createPlaceDetailBloc()
        ..add(PlaceDetailRequested(placeId)),
      child: BlocListener<PlaceDetailBloc, PlaceDetailState>(
        listener: (context, state) {
          if (state is PlaceDetailFavoriteToggleSuccess) {
            // Chỉ hiển thị snackbar khi thêm vào yêu thích, không hiển thị khi xóa
            // if (state.isFavorited) {
            //   ScaffoldMessenger.of(context).showSnackBar(
            //     SnackBar(
            //       content: Row(
            //         children: [
            //           const FaIcon(
            //             FontAwesomeIcons.solidHeart,
            //             color: Colors.white,
            //             size: 20,
            //           ),
            //           const SizedBox(width: 8),
            //           Text(state.message),
            //         ],
            //       ),
            //       backgroundColor: Colors.red[600],
            //       duration: const Duration(seconds: 2),
            //     ),
            //   );
            // }
          } else if (state is PlaceDetailError) {
            context.error(state.message);
          }
        },
        child: BlocBuilder<PlaceDetailBloc, PlaceDetailState>(
          builder: (context, state) {
            final isToggling = state is PlaceDetailTogglingFavorite;
            final isLoading = state is PlaceDetailLoading;
            final place = state is PlaceDetailLoaded
                ? state.place
                : state is PlaceDetailTogglingFavorite
                    ? state.place
                    : null;
            final isFavorited = place?.isFavorited ?? false;

            return Scaffold(
              backgroundColor: backgroundPrimary,
              appBar: isLoading
                  ? _buildSkeletonAppBar(context)
                  : AppBar(
                      centerTitle: true,
                      title: const Text(
                        'Chi tiết địa điểm',
                        style: TextStyle(
                            color: textColor, fontWeight: FontWeight.w600),
                      ),
                      elevation: 0,
                      leading: Padding(
                        padding: const EdgeInsets.only(left: 8),
                        child: _circularIconButton(
                          icon: FontAwesomeIcons.chevronLeft,
                          onPressed: () => Navigator.of(context).pop(),
                        ),
                      ),
                      actions: [
                        Padding(
                          padding: const EdgeInsets.only(right: 4),
                          child: _circularIconButton(
                            icon: FontAwesomeIcons.flag,
                            color: textSecondary,
                            onPressed: () {
                              if (place != null) {
                                showReportDialog(
                                  context: context,
                                  placeName: place.name ?? '',
                                  onSubmit: (reason, additionalInfo) {
                                    _handleReport(
                                        context, reason, additionalInfo);
                                  },
                                );
                              }
                            },
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: _circularIconButton(
                            icon: place?.isFavorited ?? false
                                ? FontAwesomeIcons.solidHeart
                                : FontAwesomeIcons.heart,
                            color: isFavorited ? Colors.red : null,
                            onPressed: isToggling || place == null
                                ? () {}
                                : () async {
                                    final placeId = int.tryParse(
                                            place.id?.toString() ?? '') ??
                                        0;
                                    if (placeId > 0) {
                                      final isLoggedIn =
                                          await context.requireLogin(
                                              actionName: 'thêm yêu thích');
                                      if (isLoggedIn) {
                                        context.read<PlaceDetailBloc>().add(
                                            PlaceDetailFavoriteToggled(
                                                placeId));
                                      }
                                    }
                                  },
                          ),
                        ),
                      ],
                    ),
              body: _buildBody(context, state),
              // bottomNavigationBar: _buildBottomBar(context),
            );
          },
        ),
      ),
    );
  }

  Widget _buildBody(BuildContext context, PlaceDetailState state) {
    if (state is PlaceDetailLoading) {
      return _buildSkeletonLoading();
    }

    if (state is PlaceDetailError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const FaIcon(
              FontAwesomeIcons.exclamationTriangle,
              size: 64,
              color: accentColor,
            ),
            const SizedBox(height: 16),
            Text(
              'Có lỗi xảy ra',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              state.message,
              style: TextStyle(color: textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                context
                    .read<PlaceDetailBloc>()
                    .add(PlaceDetailRequested(placeId));
              },
              child: const Text('Thử lại'),
            ),
          ],
        ),
      );
    }

    if (state is PlaceDetailLoaded) {
      return _buildPlaceDetail(context, state.place);
    }

    if (state is PlaceDetailTogglingFavorite) {
      return _buildPlaceDetail(context, state.place);
    }

    return const Center(
      child: Text('Không tìm thấy thông tin địa điểm'),
    );
  }

  Widget _buildPlaceDetail(BuildContext context, PlaceDetailData place) {
    final Place placeModel = place.toDomain();
    return Stack(
      children: [
        SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title and Rating
                    _buildTitleAndRating(placeModel),
                    const SizedBox(height: 16),
                    _buildHeroImage(context, placeModel),
                    const SizedBox(height: 12),
                    _buildImageThumbnails(placeModel.images
                        .map((item) => item.getAbsoluteUrl())
                        .toList()),

                    // Category and Status
                    _buildCategoryAndStatus(context, placeModel),
                    const SizedBox(height: 16),
                    // Description
                    _buildDescription(placeModel),
                    const SizedBox(height: 16),
                    // Categories and Tags
                    _buildCategoriesAndTags(placeModel),
                    const SizedBox(height: 16),

                    // Location Info
                    _buildLocationInfo(context, placeModel),
                    const SizedBox(height: 24),

                    // Owner Info
                    _buildOwnerInfo(context, place),
                    const SizedBox(height: 16),

                    // Reviews Section
                    _buildReviewsSection(context, placeModel),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ],
          ),
        ),
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: _buildFloatingBottomActions(context, placeModel),
        ),
      ],
    );
  }

  Widget _buildHeroImage(BuildContext context, Place place) {
    return GestureDetector(
      onTap: place.images.isNotEmpty
          ? () {
              // Navigate to fullscreen image viewer
              final imageUrls =
                  place.images.map((item) => item.getAbsoluteUrl()).toList();
              context.push(
                AppRoutes.imageView,
                extra: {
                  'imageUrls': imageUrls,
                  'initialIndex': 0,
                },
              );
            }
          : null,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: AspectRatio(
          aspectRatio: 1 / 1,
          child: Container(
            width: double.infinity,
            color: backgroundSecondary,
            child: place.images.length > 1
                ? ImageCarouselWithDots(
                    images: place.images
                        .map((item) => item.getAbsoluteUrl())
                        .toList())
                : place.images.isNotEmpty
                    ? Image.network(
                        place.images.first.getAbsoluteUrl(),
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return _buildPlaceholderImage();
                        },
                      )
                    : _buildPlaceholderImage(),
          ),
        ),
      ),
    );
  }

  Widget _buildImageThumbnails(List<String> images) {
    // Skip the first image as it is displayed in the Hero section
    final displayImages = images.isNotEmpty ? images.sublist(1) : [];

    return SizedBox(
      height: 64,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        itemCount: displayImages.length + 1, // +1 for the add button
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          // First item is the Add button
          if (index == 0) {
            return GestureDetector(
              onTap: () => _pickImages(context),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  width: 64,
                  height: 64,
                  color: primaryColor,
                  child: const Center(
                    child: FaIcon(
                      FontAwesomeIcons.plus,
                      color: Colors.black,
                      size: 24,
                    ),
                  ),
                ),
              ),
            );
          }

          // Remaining items are images
          final url = displayImages[index - 1];
          return GestureDetector(
            onTap: () {
              context.push(
                AppRoutes.imageView,
                extra: {
                  'imageUrls': images,
                  'initialIndex': index,
                },
              );
            },
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: 64,
                height: 64,
                color: backgroundSecondary,
                child: Image.network(
                  url,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return const Center(
                      child: FaIcon(
                        FontAwesomeIcons.image,
                        color: textSecondary,
                        size: 18,
                      ),
                    );
                  },
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSkeletonLoading() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Skeleton for hero image
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: AspectRatio(
              aspectRatio: 4 / 3,
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: backgroundSecondary,
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),

          // Skeleton for content
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title skeleton
                _buildSkeletonBox(width: double.infinity, height: 28),
                const SizedBox(height: 8),

                // Category and address skeleton
                Row(
                  children: [
                    _buildSkeletonBox(width: 80, height: 24),
                    const SizedBox(width: 12),
                    _buildSkeletonBox(width: 16, height: 16),
                    const SizedBox(width: 6),
                    Expanded(
                        child: _buildSkeletonBox(
                            width: double.infinity, height: 16)),
                  ],
                ),
                const SizedBox(height: 16),

                // Metrics card skeleton
                _buildSkeletonMetricsCard(),
                const SizedBox(height: 16),

                // Description skeleton
                _buildSkeletonBox(width: 60, height: 20),
                const SizedBox(height: 8),
                _buildSkeletonBox(width: double.infinity, height: 16),
                const SizedBox(height: 4),
                _buildSkeletonBox(width: double.infinity, height: 16),
                const SizedBox(height: 4),
                _buildSkeletonBox(width: 200, height: 16),
                const SizedBox(height: 24),

                // Additional info skeleton
                _buildSkeletonBox(width: 120, height: 20),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: backgroundSecondary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      _buildSkeletonInfoRow(),
                      const SizedBox(height: 8),
                      _buildSkeletonInfoRow(),
                      const SizedBox(height: 8),
                      _buildSkeletonInfoRow(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSkeletonBox({required double width, required double height}) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: backgroundSecondary,
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }

  Widget _buildSkeletonMetricsCard() {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSkeletonBox(width: 80, height: 12),
                const SizedBox(height: 2),
                _buildSkeletonBox(width: 60, height: 12),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSkeletonBox(width: 40, height: 20),
              const SizedBox(height: 2),
              _buildSkeletonBox(width: 60, height: 12),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: backgroundSecondary,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                _buildSkeletonBox(width: 14, height: 14),
                const SizedBox(width: 6),
                _buildSkeletonBox(width: 20, height: 14),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSkeletonInfoRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildSkeletonBox(width: 80, height: 14),
        _buildSkeletonBox(width: 60, height: 14),
      ],
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      decoration: BoxDecoration(
        color: backgroundSecondary,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(20),
          bottomRight: Radius.circular(20),
        ),
      ),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FaIcon(
              FontAwesomeIcons.image,
              size: 64,
              color: primaryColor,
            ),
            SizedBox(height: 8),
            Text(
              'Không có hình ảnh',
              style: TextStyle(
                fontSize: 16,
                color: textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTitleAndRating(Place place) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          place.name,
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            color: textColor,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            // Categories
            if (place.categories != null)
              ...place.categories!.map((category) => YellowSelectedTag(
                    isSelected: true,
                    text: category.displayName,
                  )),
            // Activity Groups
            if (place.activityGroups != null)
              ...place.activityGroups!.map((group) => GreyTag(
                    text: group.displayName,
                  )),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: const FaIcon(FontAwesomeIcons.locationDot,
                  size: 12, color: primaryColor),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                place.address,
                style: const TextStyle(color: textSecondary, fontSize: 16),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCategoryAndStatus(BuildContext context, Place place) {
    // Replaced by metrics card below the image in new design
    return _buildMetricsCard(context, place);
  }

  Widget _buildCategoriesAndTags(Place place) {
    final hasCategories =
        place.categories != null && place.categories!.isNotEmpty;
    final hasTags = place.tags != null && place.tags!.isNotEmpty;

    if (!hasCategories && !hasTags) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (hasTags) ...[
          const Text(
            'Tags',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: place.tags!
                .map((tag) => GreyTag(
                      text: tag,
                    ))
                .toList(),
          ),
        ],
      ],
    );
  }

  Widget _buildDescription(Place place) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          place.description.isNotEmpty ? place.description : 'Không có mô tả',
          style: TextStyle(
            fontSize: 16,
            color: Colors.grey[700],
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildLocationInfo(BuildContext context, Place place) {
    // Simplified per new design (address already shown near title)
    return const SizedBox.shrink();
  }

  Widget _buildReviewsSection(BuildContext context, Place place) {
    final reviews = place.reviews;
    final reviewsCount = place.reviewsCount ?? 0;
    return _buildReviewsList(
      context,
      place,
      reviews ?? const [],
      reviewsCount,
    );
  }

  Widget _buildReviewsList(BuildContext context, Place place,
      List<ReviewModel> reviews, int reviewsCount) {
    final header = Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text(
          'Đánh giá',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: textColor,
          ),
        ),
        TextButton(
          onPressed: () async {
            final isLoggedIn =
                await context.requireLogin(actionName: 'tạo đánh giá');
            if (isLoggedIn) {
              PlaceReviewSheet.show(
                context,
                place,
                onReviewCreated: () {
                  // Refresh place detail khi review được tạo thành công
                  context.read<PlaceDetailBloc>().add(
                        PlaceDetailRequested(placeId),
                      );
                },
              );
            }
          },
          child: Text(
            reviewsCount > 0
                ? 'Viết đánh giá ($reviewsCount)'
                : 'Viết đánh giá',
            style: TextStyle(
              color: Colors.black,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );

    // Empty state but still allow opening review sheet
    if (reviews.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          header,
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Column(
                children: [
                  Icon(Icons.rate_review, size: 48, color: textSecondary),
                  const SizedBox(height: 12),
                  Text(
                    'Chưa có đánh giá nào',
                    style: TextStyle(
                      fontSize: 16,
                      color: textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Hãy là người đầu tiên đánh giá địa điểm này!',
                    style: TextStyle(
                      fontSize: 14,
                      color: textTertiary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        header,
        const SizedBox(height: 12),
        Column(
          children: [
            ...reviews.map((review) {
              return ReviewCard(review: review);
            }).toList(),
          ],
        ),
      ],
    );
  }

  void _handleReport(
      BuildContext context, String reason, String? additionalInfo) {
    // TODO: Implement report API call
    print('📢 Report: $reason');
    if (additionalInfo != null && additionalInfo.isNotEmpty) {
      print('📢 Additional Info: $additionalInfo');
    }

    // Show success message
    context.success('Đã gửi báo cáo: $reason');
  }

  // === Image Upload Logic ===
  Future<void> _pickImages(BuildContext context) async {
    final picker = ImagePicker();
    try {
      final List<XFile> pickedFiles = await picker.pickMultiImage();
      if (pickedFiles.isNotEmpty) {
        if (context.mounted) {
          _showImagePreviewDialog(context, pickedFiles);
        }
      }
    } catch (e) {
      print('Error picking images: $e');
      if (context.mounted) {
        context.error('Không thể chọn ảnh: $e');
      }
    }
  }

  void _showImagePreviewDialog(
      BuildContext context, List<XFile> initialImages) {
    context.showAutoDismissDialog(
      builder: (dialogContext) => ImageUploadDialog(
        initialImages: initialImages,
        placeId: int.parse(placeId),
        parentContext: context,
      ),
    );
  }

  // === New UI elements ===
  Widget _buildMetricsCard(BuildContext context, Place place) {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Giá ',
                    style: TextStyle(fontSize: 12, color: textSecondary)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(PriceFormatter.formatPrice(place.price ?? 0),
                  style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: textColor)),
              const Text('mỗi người',
                  style: TextStyle(fontSize: 12, color: textSecondary)),
            ],
          ),
          const Spacer(),
          GestureDetector(
            onTap: () async {
              final isLoggedIn =
                  await context.requireLogin(actionName: 'tạo đánh giá');
              if (isLoggedIn) {
                PlaceReviewSheet.show(
                  context,
                  place,
                  onReviewCreated: () {
                    // Refresh place detail khi review được tạo thành công
                    context.read<PlaceDetailBloc>().add(
                          PlaceDetailRequested(placeId),
                        );
                  },
                );
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: backgroundSecondary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Builder(builder: (context) {
                final ratingValue = place.averageRating ?? place.rating;
                return Row(
                  children: [
                    _buildRatingStars(ratingValue, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      ratingValue.toStringAsFixed(1),
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, color: textColor),
                    ),
                  ],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingBottomActions(BuildContext context, Place place) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () async {
                  final isLoggedIn =
                      await context.requireLogin(actionName: 'tạo đánh giá');
                  if (isLoggedIn) {
                    if (context.mounted) {
                      PlaceReviewSheet.show(
                        context,
                        place,
                        onReviewCreated: () {
                          context.read<PlaceDetailBloc>().add(
                                PlaceDetailRequested(placeId),
                              );
                        },
                      );
                    }
                  }
                },
                child: Container(
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 10,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'Đánh giá cái coi',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            GestureDetector(
              onTap: () => _handleSharePlace(context, place),
              child: Container(
                width: 56,
                height: 56,
                decoration: const BoxDecoration(
                  color: warningColor,
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: FaIcon(
                    FontAwesomeIcons.shareNodes,
                    color: Colors.black,
                    size: 18,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRatingStars(double rating,
      {double size = 14, double spacing = 2}) {
    final safeRating = rating.isNaN ? 0.0 : rating.clamp(0, 5).toDouble();
    return Row(
      children: List.generate(5, (index) {
        final starPosition = index + 1;
        final isFull = safeRating >= starPosition;
        final isHalf = !isFull && safeRating >= starPosition - 0.5;
        return Padding(
          padding: EdgeInsets.only(right: index == 4 ? 0 : spacing),
          child: FaIcon(
            isFull
                ? FontAwesomeIcons.solidStar
                : (isHalf
                    ? FontAwesomeIcons.starHalfStroke
                    : FontAwesomeIcons.star),
            size: size,
            color: warningColor,
          ),
        );
      }),
    );
  }

  /// Hiển thị thông tin người đăng (dựa trên user_id và ngày đăng)
  Widget _buildOwnerInfo(BuildContext context, PlaceDetailData place) {
    final avatarUrl = place.user?.avatar;
    final userLabel = place.user?.name ?? "";
    final initials =
        userLabel.trim().isNotEmpty ? userLabel.trim()[0].toUpperCase() : '?';
    final createdDate = formatDateFromIso(place.createdAt);

    return GestureDetector(
      // onLongPress: () => _showOwnerReportDialog(context, place),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: primaryColor.withOpacity(0.18),
              backgroundImage: (avatarUrl != null && avatarUrl.isNotEmpty)
                  ? NetworkImage(avatarUrl)
                  : null,
              child: (avatarUrl != null && avatarUrl.isNotEmpty)
                  ? null
                  : Text(
                      initials,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: primaryColor,
                      ),
                    ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    userLabel,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Ngày đăng: $createdDate',
                    style: const TextStyle(
                      fontSize: 12,
                      color: textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.verified_user,
              size: 18,
              color: primaryColor,
            ),
          ],
        ),
      ),
    );
  }

  void _showQuickRatingDialog(BuildContext context, Place place) {
    context.showAutoDismissDialog(
      barrierDismissible: true,
      builder: (dialogContext) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              QuickRatingWidget(
                place: place,
                onRatingComplete: () {
                  Navigator.of(dialogContext).pop();
                },
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () async {
                    Navigator.of(dialogContext).pop();
                    final isLoggedIn =
                        await context.requireLogin(actionName: 'tạo đánh giá');
                    if (isLoggedIn) {
                      if (context.mounted) {
                        PlaceReviewSheet.show(
                          context,
                          place,
                          onReviewCreated: () {
                            context.read<PlaceDetailBloc>().add(
                                  PlaceDetailRequested(placeId),
                                );
                          },
                        );
                      }
                    }
                  },
                  child: const Text(
                    'Hoặc viết nhận xét chi tiết...',
                    style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w600,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => Navigator.of(dialogContext).pop(),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: textSecondary,
                    side: const BorderSide(color: textSecondary),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Đóng'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showOwnerReportDialog(BuildContext context, PlaceDetailData place) {
    final avatarUrl = place.user?.avatar;
    final userLabel = place.user?.name ?? "";
    final initials =
        userLabel.trim().isNotEmpty ? userLabel.trim()[0].toUpperCase() : '?';
    final createdDate = formatDateFromIso(place.createdAt);

    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      barrierColor: Colors.black.withOpacity(0.7),
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (BuildContext buildContext, Animation<double> animation,
          Animation<double> secondaryAnimation) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Elevated Owner Info Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: primaryColor.withOpacity(0.18),
                      backgroundImage:
                          (avatarUrl != null && avatarUrl.isNotEmpty)
                              ? NetworkImage(avatarUrl)
                              : null,
                      child: (avatarUrl != null && avatarUrl.isNotEmpty)
                          ? null
                          : Text(
                              initials,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: primaryColor,
                              ),
                            ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            userLabel,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: textColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Ngày đăng: $createdDate',
                            style: const TextStyle(
                              fontSize: 13,
                              color: textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.verified_user,
                      size: 20,
                      color: primaryColor,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Block Option
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text(
                      'Chặn người dùng',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildOwnerReportOption(
                      context: buildContext,
                      icon: Icons.block,
                      label: 'Chặn người dùng này',
                      value: 'block',
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return FadeTransition(
          opacity: CurvedAnimation(
            parent: animation,
            curve: Curves.easeOut,
          ),
          child: ScaleTransition(
            scale: CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutBack,
            ),
            child: child,
          ),
        );
      },
    );
  }

  Widget _buildOwnerReportOption({
    required BuildContext context,
    required IconData icon,
    required String label,
    required String value,
  }) {
    return InkWell(
      onTap: () {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đã chặn người dùng'),
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            backgroundColor: textColor,
          ),
        );
      },
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: textSecondary,
            ),
            const SizedBox(width: 12),
            Text(
              label,
              style: TextStyle(
                fontSize: 15,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleSharePlace(BuildContext context, Place place) {
    final String deepLink = 'places/${place.id}';
    Share.share(deepLink);
  }

  PreferredSizeWidget _buildSkeletonAppBar(BuildContext context) {
    return AppBar(
      centerTitle: true,
      backgroundColor: backgroundPrimary,
      elevation: 0,
      leading: Padding(
        padding: const EdgeInsets.only(left: 8),
        child: _circularIconButton(
          icon: FontAwesomeIcons.chevronLeft,
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      title: Container(
        width: 120,
        height: 16,
        decoration: BoxDecoration(
          color: backgroundSecondary,
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 4),
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: backgroundSecondary,
              shape: BoxShape.circle,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(right: 8),
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: backgroundSecondary,
              shape: BoxShape.circle,
            ),
          ),
        ),
      ],
    );
  }

  Widget _circularIconButton(
      {required FaIconData icon, Color? color, required VoidCallback onPressed}) {
    return Material(
      color: backgroundSecondary,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onPressed,
        child: SizedBox(
          width: 36,
          height: 36,
          child: Center(
            child: FaIcon(icon, size: 16, color: color ?? textColor),
          ),
        ),
      ),
    );
  }
}
