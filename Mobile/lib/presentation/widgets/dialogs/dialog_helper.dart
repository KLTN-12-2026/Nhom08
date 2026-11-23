import 'dart:async';
import 'package:flutter/material.dart';

/// Helper class to show dialogs that auto-dismiss after 2 seconds
class DialogHelper {
  /// Show a dialog that auto-dismisses after 2 seconds
  static Future<T?> showAutoDismissDialog<T>({
    required BuildContext context,
    required WidgetBuilder builder,
    bool barrierDismissible = true,
    Color? barrierColor,
    String? barrierLabel,
    bool useSafeArea = true,
    bool useRootNavigator = false,
    RouteSettings? routeSettings,
    Duration autoDismissDuration = const Duration(seconds: 2),
  }) {
    return showDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierColor: barrierColor,
      barrierLabel: barrierLabel,
      useSafeArea: useSafeArea,
      useRootNavigator: useRootNavigator,
      routeSettings: routeSettings,
      builder: (context) {
        Timer(autoDismissDuration, () {
          if (context.mounted) {
            Navigator.of(context).pop();
          }
        });
        return builder(context);
      },
    );
  }

  /// Show a modal bottom sheet that auto-dismisses after 2 seconds
  static Future<T?> showAutoDismissBottomSheet<T>({
    required BuildContext context,
    required WidgetBuilder builder,
    Color? backgroundColor,
    double? elevation,
    ShapeBorder? shape,
    Clip? clipBehavior,
    BoxConstraints? constraints,
    Color? barrierColor,
    bool isScrollControlled = false,
    bool useRootNavigator = false,
    bool isDismissible = true,
    bool enableDrag = true,
    RouteSettings? routeSettings,
    AnimationController? transitionAnimationController,
    Offset? anchorPoint,
    Duration autoDismissDuration = const Duration(seconds: 2),
  }) {
    return showModalBottomSheet<T>(
      context: context,
      backgroundColor: backgroundColor,
      elevation: elevation,
      shape: shape,
      clipBehavior: clipBehavior,
      constraints: constraints,
      barrierColor: barrierColor,
      isScrollControlled: isScrollControlled,
      useRootNavigator: useRootNavigator,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
      routeSettings: routeSettings,
      transitionAnimationController: transitionAnimationController,
      anchorPoint: anchorPoint,
      builder: (context) {
        Timer(autoDismissDuration, () {
          if (context.mounted) {
            Navigator.of(context).pop();
          }
        });
        return builder(context);
      },
    );
  }
}

/// Extension to add auto-dismiss functionality to BuildContext
extension DialogHelperExtension on BuildContext {
  /// Show a dialog that auto-dismisses after 2 seconds
  Future<T?> showAutoDismissDialog<T>({
    required WidgetBuilder builder,
    bool barrierDismissible = true,
    Color? barrierColor,
    String? barrierLabel,
    bool useSafeArea = true,
    bool useRootNavigator = false,
    RouteSettings? routeSettings,
    Duration autoDismissDuration = const Duration(seconds: 2),
  }) {
    return DialogHelper.showAutoDismissDialog<T>(
      context: this,
      builder: builder,
      barrierDismissible: barrierDismissible,
      barrierColor: barrierColor,
      barrierLabel: barrierLabel,
      useSafeArea: useSafeArea,
      useRootNavigator: useRootNavigator,
      routeSettings: routeSettings,
      autoDismissDuration: autoDismissDuration,
    );
  }

  /// Show a modal bottom sheet that auto-dismisses after 2 seconds
  Future<T?> showAutoDismissBottomSheet<T>({
    required WidgetBuilder builder,
    Color? backgroundColor,
    double? elevation,
    ShapeBorder? shape,
    Clip? clipBehavior,
    BoxConstraints? constraints,
    Color? barrierColor,
    bool isScrollControlled = false,
    bool useRootNavigator = false,
    bool isDismissible = true,
    bool enableDrag = true,
    RouteSettings? routeSettings,
    AnimationController? transitionAnimationController,
    Offset? anchorPoint,
    Duration autoDismissDuration = const Duration(seconds: 2),
  }) {
    return DialogHelper.showAutoDismissBottomSheet<T>(
      context: this,
      builder: builder,
      backgroundColor: backgroundColor,
      elevation: elevation,
      shape: shape,
      clipBehavior: clipBehavior,
      constraints: constraints,
      barrierColor: barrierColor,
      isScrollControlled: isScrollControlled,
      useRootNavigator: useRootNavigator,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
      routeSettings: routeSettings,
      transitionAnimationController: transitionAnimationController,
      anchorPoint: anchorPoint,
      autoDismissDuration: autoDismissDuration,
    );
  }
}
