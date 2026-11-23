import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:trove/presentation/bloc/account/account_bloc.dart';
import '../../../core/config/themes/app_colors.dart';

class WalletCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AccountBloc, AccountState>(
      builder: (context, state) {
        if (state is AccountLoaded && state.user?.wallet != null) {
          final wallet = state.user!.wallet!;
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: backgroundPrimary,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: primaryColor,
                width: 1.5,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const FaIcon(
                      FontAwesomeIcons.wallet,
                      size: 20,
                      color: textColor,
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Ví của tôi',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildWalletItem('Điểm', '${wallet.points}'),
                    _buildWalletItem('Cấp độ', '${wallet.level}'),
                    _buildWalletItem('Đã kiếm', '${wallet.totalEarned}'),
                    _buildWalletItem('Đã dùng', '${wallet.totalSpent}'),
                  ],
                ),
              ],
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildWalletItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: textColor,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: textSecondary,
          ),
        ),
      ],
    );
  }
}
