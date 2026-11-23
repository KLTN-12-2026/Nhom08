import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:trove/core/config/api_mode.dart';
import 'package:trove/presentation/bloc/api_mode/api_mode_bloc.dart';

/// Widget hiển thị badge thông báo API mode hiện tại
/// Chỉ hiển thị khi app đang chạy ở chế độ non-production
class ApiModeBadge extends StatelessWidget {
  const ApiModeBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ApiModeBloc, ApiModeState>(
      builder: (context, state) {
        // Check if bloc is available
        if (!context.mounted) {
          return const SizedBox.shrink();
        }

        // Check if state is loaded
        if (state is! ApiModeLoaded) {
          return const SizedBox.shrink();
        }

        // Hide badge in production mode
        if (state.currentMode == ApiMode.production) {
          return const SizedBox.shrink();
        }

        // Return badge widget
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.purple.shade100.withOpacity(0.9),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'MODE: ${state.currentMode.displayName}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Colors.purple.shade800,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}








