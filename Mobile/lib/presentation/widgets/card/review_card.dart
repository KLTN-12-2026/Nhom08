import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:trove/core/config/themes/app_colors.dart';
import 'package:trove/models/review.dart';
import 'package:trove/presentation/bloc/place/place_review/place_review_state.dart';
import 'package:trove/utils/utils.dart' show Utils;

class ReviewCardSkeleton extends StatelessWidget {
  const ReviewCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Skeleton avatar
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: backgroundSecondary,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          // Skeleton content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child:
                          _buildSkeletonBox(width: double.infinity, height: 14),
                    ),
                    const SizedBox(width: 8),
                    _buildSkeletonBox(width: 60, height: 12),
                  ],
                ),
                const SizedBox(height: 8),
                // Skeleton stars
                Row(
                  children: List.generate(5, (index) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 1),
                      child: _buildSkeletonBox(width: 12, height: 12),
                    );
                  }),
                ),
                const SizedBox(height: 8),
                _buildSkeletonBox(width: double.infinity, height: 12),
                const SizedBox(height: 4),
                _buildSkeletonBox(width: double.infinity, height: 12),
                const SizedBox(height: 4),
                _buildSkeletonBox(width: 150, height: 12),
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
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}

class ReviewCard extends StatelessWidget {
  final ReviewModel review;
  const ReviewCard({super.key, required this.review});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: () => _showReportDialog(context),
      child: Container(
        margin: const EdgeInsets.only(bottom: 24),
        padding: const EdgeInsets.symmetric(
          horizontal: 8,
        ),
        decoration: BoxDecoration(
          color: white,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ảnh đại diện
            CircleAvatar(
              radius: 20,
              backgroundColor: primaryColor,
              backgroundImage:
                  review.userAvatar != null && review.userAvatar!.isNotEmpty
                      ? NetworkImage(review.userAvatar!)
                      : null,
              child: review.userAvatar == null || review.userAvatar!.isEmpty
                  ? Text(
                      review.userName.isNotEmpty
                          ? review.userName.substring(0, 1).toUpperCase()
                          : 'U',
                      style: const TextStyle(
                        color: white,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 8),
            // Nội dung đánh giá
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          review.userName.isNotEmpty
                              ? review.userName
                              : 'Người dùng',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: textColor,
                          ),
                        ),
                      ),
                      Text(
                        Utils.formatRelativeTime(
                            review.createdAt.toIso8601String()),
                        style: TextStyle(
                          color: textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  // Sao đánh giá
                  Row(
                    children: List.generate(5, (starIndex) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 1),
                        child: FaIcon(
                          starIndex < review.rating
                              ? FontAwesomeIcons.solidStar
                              : FontAwesomeIcons.star,
                          color: warningColor,
                          size: 12,
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 8),
                  if (review.comment != null && review.comment!.isNotEmpty)
                    Text(
                      review.comment!,
                      style: const TextStyle(
                        fontSize: 14,
                        color: textColor,
                        height: 1.4,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleReport(BuildContext context, String reason) {
    // Map reason codes to display text
    final Map<String, String> reasonTexts = {
      'spam': 'Spam',
      'inappropriate': 'Nội dung không phù hợp',
      'harassment': 'Quấy rối',
      'misinformation': 'Thông tin sai lệch',
      'other': 'Khác',
    };

    final reasonText = reasonTexts[reason] ?? reason;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Đã báo cáo đánh giá: $reasonText'),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        backgroundColor: textColor,
      ),
    );
  }

  void _showReportDialog(BuildContext context) {
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
              // Elevated Review Card
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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Avatar
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: primaryColor,
                      backgroundImage: review.userAvatar != null &&
                              review.userAvatar!.isNotEmpty
                          ? NetworkImage(review.userAvatar!)
                          : null,
                      child: review.userAvatar == null ||
                              review.userAvatar!.isEmpty
                          ? Text(
                              review.userName.isNotEmpty
                                  ? review.userName
                                      .substring(0, 1)
                                      .toUpperCase()
                                  : 'U',
                              style: const TextStyle(
                                color: white,
                                fontWeight: FontWeight.bold,
                              ),
                            )
                          : null,
                    ),
                    const SizedBox(width: 8),
                    // Content
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            review.userName.isNotEmpty
                                ? review.userName
                                : 'Người dùng',
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              color: textColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: List.generate(5, (starIndex) {
                              return Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 1),
                                child: FaIcon(
                                  starIndex < review.rating
                                      ? FontAwesomeIcons.solidStar
                                      : FontAwesomeIcons.star,
                                  color: warningColor,
                                  size: 12,
                                ),
                              );
                            }),
                          ),
                          const SizedBox(height: 8),
                          if (review.comment != null &&
                              review.comment!.isNotEmpty)
                            Text(
                              review.comment!,
                              style: const TextStyle(
                                fontSize: 14,
                                color: textColor,
                                height: 1.4,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Report Options
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text(
                      'Báo cáo đánh giá',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildReportOption(
                      context: buildContext,
                      icon: Icons.report_outlined,
                      label: 'Spam',
                      value: 'spam',
                    ),
                    _buildReportOption(
                      context: buildContext,
                      icon: Icons.warning_outlined,
                      label: 'Nội dung không phù hợp',
                      value: 'inappropriate',
                    ),
                    _buildReportOption(
                      context: buildContext,
                      icon: Icons.block_outlined,
                      label: 'Quấy rối',
                      value: 'harassment',
                    ),
                    _buildReportOption(
                      context: buildContext,
                      icon: Icons.info_outline,
                      label: 'Thông tin sai lệch',
                      value: 'misinformation',
                    ),
                    _buildReportOption(
                      context: buildContext,
                      icon: Icons.more_horiz,
                      label: 'Khác',
                      value: 'other',
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

  Widget _buildReportOption({
    required BuildContext context,
    required IconData icon,
    required String label,
    required String value,
  }) {
    return InkWell(
      onTap: () {
        Navigator.of(context).pop();
        _handleReport(context, value);
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
}
