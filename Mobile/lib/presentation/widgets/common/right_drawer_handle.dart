import 'package:flutter/material.dart';

class RightDrawerHandle extends StatelessWidget {
  final VoidCallback? onTap;
  final Color color;
  final double width;
  final double height;
  final double verticalOffset;

  const RightDrawerHandle({
    super.key,
    this.onTap,
    this.color = const Color(0x80000000), // Semi-transparent black default
    this.width = 16.0,
    this.height = 48.0,
    this.verticalOffset = 0.0, // 0.0 means center vertically
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      right: 0,
      top: 0,
      bottom: 0, // Stretch to allow vertical alignment via Align
      child: Center(
        child: Transform.translate(
          offset: Offset(0, verticalOffset),
          child: GestureDetector(
            onTap: () {
              Scaffold.of(context).openEndDrawer();
              onTap?.call();
            },
            behavior: HitTestBehavior.opaque,
            child: Container(
              width: width,
              height: height,
              decoration: BoxDecoration(
                color: color,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  bottomLeft: Radius.circular(12),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 4,
                    offset: const Offset(-2, 0),
                  ),
                ],
              ),
              child: Center(
                child: Icon(
                  Icons.chevron_left,
                  size: 14,
                  color: Colors.white.withValues(alpha: 0.8),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
