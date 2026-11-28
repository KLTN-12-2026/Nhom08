import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../../core/config/themes/app_colors.dart';

class ImageCarouselWithDots extends StatefulWidget {
  final List<String> images;

  const ImageCarouselWithDots({Key? key, required this.images})
      : super(key: key);

  @override
  State<ImageCarouselWithDots> createState() => _ImageCarouselWithDotsState();
}

class _ImageCarouselWithDotsState extends State<ImageCarouselWithDots> {
  final PageController _controller = PageController();
  int _current = 0;

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      final page = _controller.page?.round() ?? 0;
      if (page != _current && mounted) {
        setState(() => _current = page);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        PageView.builder(
          controller: _controller,
          itemCount: widget.images.length,
          itemBuilder: (context, index) {
            return Image.network(
              widget.images[index],
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return const Center(
                  child: FaIcon(
                    FontAwesomeIcons.image,
                    color: textSecondary,
                    size: 28,
                  ),
                );
              },
            );
          },
        ),
        Positioned(
          left: 0,
          right: 0,
          bottom: 8,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(widget.images.length, (i) {
              final bool isActive = i == _current;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: isActive ? 10 : 6,
                height: isActive ? 10 : 6,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color:
                      isActive ? warningColor : warningColor.withOpacity(0.35),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

