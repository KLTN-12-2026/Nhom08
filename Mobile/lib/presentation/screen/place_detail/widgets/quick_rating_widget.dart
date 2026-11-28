import 'dart:async';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../../core/config/themes/app_colors.dart';
import '../../../../core/services/service_provider.dart';
import '../../../../models/place.dart';
import '../../../../presentation/widgets/snackbar/app_snack.dart';
import '../../../../presentation/widgets/auth_builder.dart';

class QuickRatingWidget extends StatefulWidget {
  final Place place;
  final VoidCallback? onRatingComplete;

  const QuickRatingWidget({
    Key? key,
    required this.place,
    this.onRatingComplete,
  }) : super(key: key);

  @override
  State<QuickRatingWidget> createState() => _QuickRatingWidgetState();
}

class _QuickRatingWidgetState extends State<QuickRatingWidget> {
  int? _selectedReaction; // 0=pass, 1=maybe, 2=go
  bool _isSubmitting = false;
  Timer? _toastDebounceTimer;
  DateTime? _lastSnackBarShownAt;

  @override
  void initState() {
    super.initState();
    _loadMyReaction();
  }

  Future<void> _loadMyReaction() async {
    try {
      final placeId = int.parse(widget.place.id);
      final reaction =
          await serviceProvider.placeService.getMyReaction(placeId);

      if (mounted) {
        setState(() {
          _selectedReaction = reaction;
        });
      }
    } catch (e) {
      print('Error loading reaction: $e');
      if (mounted) {
        setState(() {});
      }
    }
  }

  Future<void> _handleRating(int reactionType) async {
    if (_isSubmitting) return; // Debounce

    // Kiểm tra đăng nhập
    final isLoggedIn = await context.requireLogin(actionName: 'thêm phản ứng');
    if (!isLoggedIn) return;

    final placeId = int.parse(widget.place.id);
    final previousReaction = _selectedReaction;

    // Optimistic update
    setState(() {
      // Toggle: if same reaction, remove it
      _selectedReaction =
          _selectedReaction == reactionType ? null : reactionType;
      _isSubmitting = true;
    });

    try {
      await serviceProvider.placeService.toggleReaction(placeId, reactionType);

      if (!mounted) return;

      String message;
      dynamic icon;
      Color color;

      if (_selectedReaction == null) {
        message = 'Đã xóa đánh giá';
        icon = FontAwesomeIcons.xmark;
        color = Colors.grey;
      } else {
        switch (reactionType) {
          case 2: // go
            message = 'Đi nghen! 🔥';
            icon = FontAwesomeIcons.fire;
            color = const Color(0xFFFF6B6B);
            break;
          case 1: // maybe
            message = 'Ổn nghe ní! 👍';
            icon = FontAwesomeIcons.thumbsUp;
            color = const Color(0xFF4ECDC4);
            break;
          case 0: // pass
            message = 'Đắp mền ngủ đi! 😴';
            icon = FontAwesomeIcons.bed;
            color = const Color(0xFF95A5A6);
            break;
          default:
            message = 'Đã đánh giá!';
            icon = FontAwesomeIcons.check;
            color = primaryColor;
        }
      }

      _debouncedToast(
        icon: icon,
        message: message,
        color: color,
      );

      // Đóng dialog sau khi rating thành công
      if (widget.onRatingComplete != null) {
        widget.onRatingComplete!();
      }
    } catch (e) {
      print('Error toggling reaction: $e');

      // Revert on error
      if (mounted) {
        setState(() {
          _selectedReaction = previousReaction;
        });

        context.error('Không thể cập nhật đánh giá. Vui lòng thử lại.');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  void _debouncedToast({
    required IconData icon,
    required String message,
    required Color color,
  }) {
    final now = DateTime.now();
    if (_lastSnackBarShownAt != null &&
        now.difference(_lastSnackBarShownAt!) <
            const Duration(milliseconds: 800)) {
      return;
    }

    _toastDebounceTimer?.cancel();
    _toastDebounceTimer = Timer(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      _lastSnackBarShownAt = DateTime.now();
      ScaffoldMessenger.of(context).clearSnackBars();
      // Sử dụng AppSnack với custom styling
      AppSnack.showCustom(
        context,
        message: message,
        backgroundColor: color,
        icon: icon,
      );
    });
  }

  @override
  void dispose() {
    _toastDebounceTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: const [
            Text(
              'ĐI CHƯA ?',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFFFFC857), // vàng
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: Text(
                'Đi rồi thì đánh giá phát coi nào',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.black87,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            Expanded(
              child: _buildButton(
                label: 'Đi nghen',
                icon: FontAwesomeIcons.fire,
                reactionType: 2,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildButton(
                label: 'Ổn nghe ní',
                icon: FontAwesomeIcons.thumbsUp,
                reactionType: 1,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildButton(
                label: 'Đắp mền ngủ đi',
                icon: FontAwesomeIcons.bed,
                reactionType: 0,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildButton({
    required String label,
    required FaIconData icon,
    required int reactionType,
  }) {
    const Color borderHighlight = Color(0xFFFFC857);
    const Color baseIconColor = Colors.black;

    final isSelected = _selectedReaction == reactionType;
    final isDimmed = _selectedReaction != null && !isSelected;

    return GestureDetector(
      onTap: _isSubmitting ? null : () => _handleRating(reactionType),
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: isDimmed ? 0.3 : 1.0,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          transform: Matrix4.identity()
            ..scale(isSelected ? 1.04 : 1.0, isSelected ? 1.04 : 1.0),
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? borderHighlight : Colors.black12,
              width: isSelected ? 2.0 : 1.5,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: borderHighlight.withOpacity(0.35),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              FaIcon(
                icon,
                color: isSelected ? borderHighlight : baseIconColor,
                size: 24,
              ),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? borderHighlight : baseIconColor,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

