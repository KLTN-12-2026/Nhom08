import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:trove/models/place.dart';
import 'package:trove/core/services/service_provider.dart';
import 'package:trove/presentation/bloc/place/place_review/place_review_bloc.dart';
import 'package:trove/presentation/bloc/place/place_review/place_review_event.dart';
import 'package:trove/presentation/bloc/place/place_review/place_review_state.dart';
import 'package:trove/core/config/themes/app_colors.dart';
import 'package:trove/presentation/widgets/card/review_card.dart';
import 'package:trove/presentation/widgets/button/primary_button.dart';
import 'package:trove/presentation/widgets/snackbar/app_snack.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class PlaceReviewSheet extends StatelessWidget {
  final Place place;
  final VoidCallback? onReviewCreated;

  const PlaceReviewSheet({
    super.key,
    required this.place,
    this.onReviewCreated,
  });

  /// Show review sheet
  static void show(BuildContext context, Place place,
      {VoidCallback? onReviewCreated}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => PlaceReviewSheet(
          place: place,
          onReviewCreated: onReviewCreated,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final bloc = PlaceReviewBloc(
          reviewService: serviceProvider.reviewService,
        );
        // Load reviews when bloc is created
        bloc.add(LoadReviewsEvent(placeId: int.parse(place.id)));
        return bloc;
      },
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.95,
        ),
        decoration: BoxDecoration(
          color: backgroundPrimary,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle bar
            const SizedBox(height: 12),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: textTertiary,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 8),
            // Header with close button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Đánh giá',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: textColor,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                    color: textSecondary,
                  ),
                ],
              ),
            ),
            // Body content
            Expanded(
              child: BlocListener<PlaceReviewBloc, PlaceReviewState>(
                listener: (context, state) {
                  if (state is PlaceReviewError) {
                    context.error('Lỗi: ${state.message}');
                  } else if (state is PlaceReviewSuccess) {
                    context.success('Đánh giá đã được thêm!');
                    // Reload reviews
                    context.read<PlaceReviewBloc>().add(
                          LoadReviewsEvent(placeId: int.parse(place.id)),
                        );
                    // Callback để refresh place detail
                    if (onReviewCreated != null) {
                      onReviewCreated!();
                    }
                  }
                },
                child: Column(
                  children: [
                    // Reviews list
                    Expanded(
                      child: BlocBuilder<PlaceReviewBloc, PlaceReviewState>(
                        builder: (context, state) {
                          return _buildReviewsList(context, state);
                        },
                      ),
                    ),

                    // Bottom review input - always at bottom
                    _ReviewInputForm(
                      placeId: place.id,
                      onReviewCreated: onReviewCreated,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewsList(BuildContext context, PlaceReviewState state) {
    if (state is PlaceReviewLoading) {
      return ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        itemBuilder: (context, index) {
          return const ReviewCardSkeleton();
        },
      );
    }

    if (state is PlaceReviewError) {
      return SingleChildScrollView(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error, size: 64, color: textSecondary),
                const SizedBox(height: 16),
                Text(
                  'Có lỗi xảy ra: ${state.message}',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    context.read<PlaceReviewBloc>().add(
                          LoadReviewsEvent(placeId: int.parse(place.id)),
                        );
                  },
                  child: const Text('Thử lại'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (state is PlaceReviewLoaded) {
      if (state.reviews.isEmpty) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.rate_review, size: 64, color: textSecondary),
              const SizedBox(height: 16),
              Text(
                'Chưa có đánh giá nào',
                style: TextStyle(
                  fontSize: 18,
                  color: textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Hãy là người đầu tiên đánh giá địa điểm này!',
                style: TextStyle(color: textTertiary),
              ),
            ],
          ),
        );
      }

      return ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: state.reviews.length,
        itemBuilder: (context, index) {
          final review = state.reviews[index];
          return ReviewCard(review: review);
        },
      );
    }

    return const SizedBox.shrink();
  }
}

class _ReviewInputForm extends StatefulWidget {
  final String placeId;
  final VoidCallback? onReviewCreated;

  const _ReviewInputForm({
    required this.placeId,
    this.onReviewCreated,
  });

  @override
  State<_ReviewInputForm> createState() => _ReviewInputFormState();
}

class _ReviewInputFormState extends State<_ReviewInputForm> {
  final TextEditingController _commentController = TextEditingController();
  double _selectedRating = 0.0;

  @override
  void initState() {
    super.initState();
    _commentController.addListener(() {
      setState(() {}); // Rebuild when text changes to update button state
    });
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  void _submitReview(BuildContext context) {
    if (_selectedRating == 0.0) {
      context.warning('Vui lòng chọn điểm đánh giá');
      return;
    }

    final comment = _commentController.text.trim();
    if (comment.isEmpty) {
      context.warning('Vui lòng nhập đánh giá');
      return;
    }

    context.read<PlaceReviewBloc>().add(
          AddReviewEvent(
            placeId: int.parse(widget.placeId),
            rating: _selectedRating,
            comment: comment,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PlaceReviewBloc, PlaceReviewState>(
      builder: (context, state) {
        final isSubmitting = state is PlaceReviewAdding;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Rating stars
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final ratingValue = index + 1;
                  return IconButton(
                    onPressed: () {
                      setState(() {
                        _selectedRating = ratingValue.toDouble();
                      });
                    },
                    icon: FaIcon(
                      _selectedRating >= ratingValue
                          ? FontAwesomeIcons.solidStar
                          : FontAwesomeIcons.star,
                      color: warningColor,
                      size: 28,
                    ),
                  );
                }),
              ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: TextField(
                        controller: _commentController,
                        maxLines: 1,
                        decoration: InputDecoration(
                          hintText: 'Viết đánh giá...',
                          filled: true,
                          fillColor: backgroundSecondary,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 12,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(4),
                            borderSide: BorderSide.none,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(4),
                            borderSide: BorderSide.none,
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(4),
                            borderSide:
                                const BorderSide(color: Colors.black, width: 2),
                          ),
                          errorBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(4),
                            borderSide: BorderSide.none,
                          ),
                          focusedErrorBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(4),
                            borderSide: BorderSide.none,
                          ),
                          disabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(4),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  BlocListener<PlaceReviewBloc, PlaceReviewState>(
                    listener: (context, state) {
                      if (state is PlaceReviewSuccess) {
                        _commentController.clear();
                        setState(() => _selectedRating = 0.0);
                      }
                    },
                    child: SizedBox(
                      width: 80,
                      height: 48,
                      child: PrimaryButton(
                        height: 48,
                        onPressed: (!isSubmitting &&
                                _commentController.text.trim().isNotEmpty &&
                                _selectedRating > 0)
                            ? () => _submitReview(context)
                            : null,
                        child: isSubmitting
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor:
                                      AlwaysStoppedAnimation<Color>(white),
                                ),
                              )
                            : const Text('Gửi', style: TextStyle(fontSize: 14)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
