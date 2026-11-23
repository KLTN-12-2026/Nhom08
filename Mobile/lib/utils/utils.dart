import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../core/config/themes/app_colors.dart';
import 'package:intl/intl.dart';

class Utils {
  static final _selectedDate = DateTime.now();

  static final _initialTime = TimeOfDay.now();

  static String formatPrice(double price) => '\$${price.toStringAsFixed(2)}';

  static String formatDate(DateTime date) => DateFormat.yMd().format(date);

  /// Format date to relative time (e.g., "Vừa xong", "5 phút trước", "Hôm qua", etc.)
  static String formatRelativeTime(String? dateString) {
    if (dateString == null || dateString.isEmpty) {
      return 'Vừa xong';
    }

    try {
      final date = DateTime.parse(dateString);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inDays == 0) {
        if (difference.inHours == 0) {
          if (difference.inMinutes == 0) {
            return 'Vừa xong';
          }
          return '${difference.inMinutes} phút trước';
        }
        return '${difference.inHours} giờ trước';
      } else if (difference.inDays == 1) {
        return 'Hôm qua';
      } else if (difference.inDays < 7) {
        return '${difference.inDays} ngày trước';
      } else if (difference.inDays < 30) {
        final weeks = (difference.inDays / 7).floor();
        return '$weeks tuần trước';
      } else if (difference.inDays < 365) {
        final months = (difference.inDays / 30).floor();
        return '$months tháng trước';
      } else {
        final years = (difference.inDays / 365).floor();
        return '$years năm trước';
      }
    } catch (e) {
      return 'Vừa xong';
    }
  }

  /// Format date to readable format (e.g., "09/11/2025 14:30")
  static String formatDateTime(String? dateString) {
    if (dateString == null || dateString.isEmpty) {
      return '';
    }

    try {
      final date = DateTime.parse(dateString);
      return DateFormat('dd/MM/yyyy HH:mm').format(date);
    } catch (e) {
      return '';
    }
  }

  static String numberCompact(num number) =>
      NumberFormat.compact().format(number);

  static void showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      duration: const Duration(seconds: 3),
      content: Text(message, textAlign: TextAlign.center),
    ));
  }

  static Future<DateTime?> selectDate(BuildContext context) => showDatePicker(
        context: context,
        initialDate: _selectedDate,
        firstDate: DateTime(1990, 1),
        lastDate: DateTime(2050),
      );

  static Future<TimeOfDay?> selectTime(BuildContext context) =>
      showTimePicker(context: context, initialTime: _initialTime);

  static Future showCongratsAlertDialog(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return showDialog(
        context: context,
        builder: (BuildContext context) {
          return Dialog(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.0)),
            child: Container(
              height: 250,
              padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Icon(Icons.check,
                      color: Theme.of(context).colorScheme.secondary),
                  Text('Congrats', style: textTheme.displayMedium),
                  const SizedBox(height: 8),
                  const Text('You did successfully transfer \$85.00 Amount',
                      textAlign: TextAlign.center),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          );
        });
  }

  static showAlertDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return CupertinoAlertDialog(
          title: const Text("Log out?"),
          content: const Text("Are you sure you want to log out?"),
          actions: <Widget>[
            CupertinoDialogAction(
                isDefaultAction: false,
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text("Cancel")),
            CupertinoDialogAction(
                textStyle: const TextStyle(color: errorColor),
                isDefaultAction: true,
                onPressed: () async {
                  Navigator.pop(context);
                },
                child: const Text("Log out")),
          ],
        );
      },
    );
  }

  static void showCustomDialog(BuildContext context, Widget child,
      {VoidCallback? onTap}) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (BuildContext context, Animation first, Animation second) {
        return BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
          child: Container(
            height: MediaQuery.of(context).size.height,
            width: MediaQuery.of(context).size.width,
            color: primaryBlack.withOpacity(0.26),
            child: Stack(
              fit: StackFit.expand,
              alignment: Alignment.center,
              children: [
                Positioned(
                  top: 32,
                  left: 18,
                  child: GestureDetector(
                    onTap: onTap,
                    child: Container(
                      height: 48,
                      width: 48,
                      decoration: BoxDecoration(
                        color: primaryBlack,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(
                        Icons.close,
                        color: white,
                        size: 16,
                      ),
                    ),
                  ),
                ),
                child,
              ],
            ),
          ),
        );
      },
    );
  }
}
