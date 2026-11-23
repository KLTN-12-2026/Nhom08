import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:trove/presentation/widgets/button/black_button.dart';
import 'package:go_router/go_router.dart';
import 'package:trove/core/config/router/app_routes.dart';
import '../../../core/config/themes/app_colors.dart';

class PlacesLimitCard extends StatelessWidget {
  final int placesLimit;
  final VoidCallback? onPressed;

  const PlacesLimitCard({
    super.key,
    required this.placesLimit,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: primaryColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const FaIcon(
                FontAwesomeIcons.circleInfo,
                size: 20,
                color: white,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Giới hạn địa điểm xem',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          BlackButton(
            text: 'Đăng ít nhất 1 địa điểm để xem tất cả',
            onPressed: onPressed ??
                () {
                  // ScaffoldMessenger.of(context).showSnackBar(
                  //   const SnackBar(
                  //     content: Text('Chức năng đang phát triển'),
                  //   ),
                  // );
                  context.push(AppRoutes.placeCreate);
                },
          ),
        ],
      ),
    );
  }
}
