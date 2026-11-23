import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:trove/core/config/themes/app_colors.dart' as AppColors;
import 'package:trove/presentation/widgets/button/black_button.dart';
import 'package:trove/presentation/widgets/button/yellow_button.dart';

class AnnouncementCard extends StatefulWidget {
  final String title;
  final String message;
  final String? actionText;
  final VoidCallback? onAction;
  final VoidCallback? onDismiss;

  const AnnouncementCard({
    super.key,
    required this.title,
    required this.message,
    this.actionText,
    this.onAction,
    this.onDismiss,
  });

  @override
  State<AnnouncementCard> createState() => _AnnouncementCardState();
}

class _AnnouncementCardState extends State<AnnouncementCard>
    with SingleTickerProviderStateMixin {
  bool _isExpanded = false;
  late AnimationController _animationController;
  late Animation<double> _expandAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _expandAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleExpand() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.backgroundSecondary,
        borderRadius: BorderRadius.circular(
          12,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header với title và dismiss button
          Row(
            children: [
              const FaIcon(
                FontAwesomeIcons.bullhorn,
                size: 20,
                color: Colors.black,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: _toggleExpand,
                  child: Text(
                    widget.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Colors.black,
                      letterSpacing: 0.2,
                    ),
                  ),
                ),
              ),
              if (widget.onDismiss != null)
                GestureDetector(
                  onTap: widget.onDismiss,
                  child: const FaIcon(
                    FontAwesomeIcons.xmark,
                    size: 16,
                    color: Colors.black54,
                  ),
                ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: _toggleExpand,
                child: AnimatedRotation(
                  turns: _isExpanded ? 0.5 : 0,
                  duration: const Duration(milliseconds: 300),
                  child: const FaIcon(
                    FontAwesomeIcons.chevronDown,
                    size: 16,
                    color: Colors.black54,
                  ),
                ),
              ),
            ],
          ),
          // Expandable content
          SizeTransition(
            sizeFactor: _expandAnimation,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                Text(
                  widget.message,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                    height: 1.4,
                    letterSpacing: 0.1,
                  ),
                ),
                if (widget.actionText != null && widget.onAction != null) ...[
                  const SizedBox(height: 12),
                  YellowButton(
                    text: widget.actionText!,
                    onPressed: widget.onAction!,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
