import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:trove/core/config/themes/app_colors.dart';
import 'package:trove/core/config/router/app_routes.dart';
import 'package:trove/presentation/widgets/auth_builder.dart';

class AppDrawer extends StatelessWidget {
  final int unreadNotificationCount;

  const AppDrawer({
    super.key,
    this.unreadNotificationCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: backgroundPrimary,
      child: SafeArea(
        child: Column(
          children: [
            // Header: App name
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: primaryColor,
                border: Border(
                  bottom: BorderSide(color: borderSecondary, width: 1),
                ),
              ),
              child: const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Trove',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                    color: Colors.white,
                  ),
                ),
              ),
            ),

            // Drawer content
            Expanded(
              child: _buildDrawerContent(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerContent(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        _buildDrawerItem(
          icon: FontAwesomeIcons.film,
          title: 'Phim',
          onTap: () {
            final nav = Navigator.of(context);
            final router = GoRouter.of(context);
            nav.pop();
            Future.delayed(const Duration(milliseconds: 300), () {
              router.push(AppRoutes.movies);
            });
          },
        ),
        _buildDrawerItem(
          icon: FontAwesomeIcons.location,
          title: 'Tìm kiếm Google Maps',
          onTap: () {
            final nav = Navigator.of(context);
            final router = GoRouter.of(context);
            nav.pop();
            Future.delayed(const Duration(milliseconds: 300), () {
              router.push(AppRoutes.googleMapSearch);
            });
          },
        ),
        _buildDrawerItem(
          icon: FontAwesomeIcons.bell,
          title: 'Thông báo',
          onTap: () {
            final nav = Navigator.of(context);
            final router = GoRouter.of(context);
            nav.pop();
            Future.delayed(const Duration(milliseconds: 300), () {
              router.push(AppRoutes.announcements);
            });
          },
          trailing: unreadNotificationCount > 0
              ? Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.redAccent,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    unreadNotificationCount.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                )
              : null,
        ),
        _buildDrawerItem(
          icon: FontAwesomeIcons.heart,
          title: 'Yêu thích',
          onTap: () async {
            final nav = Navigator.of(context);
            final router = GoRouter.of(context);
            final isLoggedIn =
                await context.requireLogin(actionName: 'xem yêu thích');
            if (isLoggedIn) {
              nav.pop();
              await Future.delayed(const Duration(milliseconds: 300));
              router.push(AppRoutes.accountFavorites);
            }
          },
        ),
      ],
    );
  }

  Widget _buildDrawerItem({
    required FaIconData icon,
    required String title,
    required VoidCallback onTap,
    Color? itemTextColor,
    Widget? trailing,
  }) {
    return Theme(
      data: ThemeData(
        splashFactory: NoSplash.splashFactory,
        highlightColor: Colors.transparent,
      ),
      child: ListTile(
        leading: FaIcon(
          icon,
          color: itemTextColor ?? textSecondary,
          size: 18,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: itemTextColor ?? textColor,
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
        trailing: trailing,
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),
    );
  }
}
