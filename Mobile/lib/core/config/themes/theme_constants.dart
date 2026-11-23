import 'package:flutter/material.dart';
import 'app_colors.dart';

// ===== SPACING CONSTANTS =====
class Spacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
}

// ===== BORDER RADIUS CONSTANTS =====
class RadiusValues {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
  static const double xxl = 32.0;
  static const double full = 999.0;
}

// ===== ELEVATION CONSTANTS =====
class Elevation {
  static const double none = 0.0;
  static const double sm = 1.0;
  static const double md = 2.0;
  static const double lg = 4.0;
  static const double xl = 8.0;
  static const double xxl = 16.0;
}

// ===== TYPOGRAPHY CONSTANTS =====
class TypographyValues {
  // Font sizes
  static const double xs = 12.0;
  static const double sm = 14.0;
  static const double md = 16.0;
  static const double lg = 18.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  static const double xxxl = 32.0;

  // Font weights
  static const FontWeight light = FontWeight.w300;
  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semiBold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;
  static const FontWeight extraBold = FontWeight.w800;
}

// ===== ANIMATION CONSTANTS =====
class Animation {
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 300);
  static const Duration slow = Duration(milliseconds: 500);

  static const Curve easeInOut = Curves.easeInOut;
  static const Curve easeOut = Curves.easeOut;
  static const Curve easeIn = Curves.easeIn;
}

// ===== BUTTON STYLES =====
class ButtonStyles {
  static ButtonStyle primary({
    double? borderRadius,
    EdgeInsetsGeometry? padding,
    double? elevation,
  }) {
    return ElevatedButton.styleFrom(
      backgroundColor: primaryColor,
      foregroundColor: primaryBlack,
      elevation: elevation ?? Elevation.md,
      padding: padding ??
          const EdgeInsets.symmetric(
            horizontal: Spacing.lg,
            vertical: Spacing.md,
          ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(borderRadius ?? RadiusValues.lg),
      ),
    );
  }

  static ButtonStyle secondary({
    double? borderRadius,
    EdgeInsetsGeometry? padding,
  }) {
    return OutlinedButton.styleFrom(
      foregroundColor: secondaryColor,
      side: const BorderSide(color: secondaryColor),
      padding: padding ??
          const EdgeInsets.symmetric(
            horizontal: Spacing.lg,
            vertical: Spacing.md,
          ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(borderRadius ?? RadiusValues.lg),
      ),
    );
  }

  static ButtonStyle text({
    double? borderRadius,
    EdgeInsetsGeometry? padding,
  }) {
    return TextButton.styleFrom(
      foregroundColor: accentColor,
      padding: padding ??
          const EdgeInsets.symmetric(
            horizontal: Spacing.lg,
            vertical: Spacing.md,
          ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(borderRadius ?? RadiusValues.lg),
      ),
    );
  }
}

// ===== INPUT STYLES =====
class InputStyles {
  static InputDecoration standard({
    String? labelText,
    String? hintText,
    Widget? prefixIcon,
    Widget? suffixIcon,
    bool filled = true,
  }) {
    return InputDecoration(
      labelText: labelText,
      hintText: hintText,
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
      filled: filled,
      fillColor: backgroundSecondary,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(RadiusValues.lg),
        borderSide: const BorderSide(color: borderPrimary),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(RadiusValues.lg),
        borderSide: const BorderSide(color: borderPrimary),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(RadiusValues.lg),
        borderSide: const BorderSide(color: borderFocus, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(RadiusValues.lg),
        borderSide: const BorderSide(color: errorColor),
      ),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: Spacing.md,
        vertical: Spacing.sm,
      ),
    );
  }
}

// ===== CARD STYLES =====
class CardStyles {
  static CardTheme standard() {
    return CardTheme(
      color: backgroundPrimary,
      elevation: Elevation.md,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(RadiusValues.lg),
      ),
      shadowColor: primaryBlack.withOpacity(0.1),
      margin: const EdgeInsets.all(Spacing.sm),
    );
  }

  static CardTheme dark() {
    return CardTheme(
      color: primaryBlack,
      elevation: Elevation.md,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(RadiusValues.lg),
      ),
      shadowColor: primaryBlack.withOpacity(0.3),
      margin: const EdgeInsets.all(Spacing.sm),
    );
  }
}
