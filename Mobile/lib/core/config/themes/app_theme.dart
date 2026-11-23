import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';
import 'theme_constants.dart';

class MyTheme {
  // ===== LIGHT THEME =====
  static final lightTheme = ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: backgroundPrimary,
    brightness: Brightness.light,
    primaryColor: primaryColor,
    colorScheme: const ColorScheme.light(
      primary: primaryColor,
      secondary: secondaryColor,
      tertiary: accentColor,
      surface: backgroundPrimary,
      background: backgroundPrimary,
      error: errorColor,
      onPrimary: primaryBlack,
      onSecondary: white,
      onTertiary: white,
      onSurface: textColor,
      onBackground: textColor,
      onError: white,
      outline: borderPrimary,
      outlineVariant: borderSecondary,
      surfaceVariant: backgroundSecondary,
      inverseSurface: primaryBlack,
      shadow: primaryBlack,
      scrim: primaryBlack,
    ),
    appBarTheme: AppBarTheme(
      foregroundColor: primaryBlack,
      titleTextStyle: GoogleFonts.outfit(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: primaryBlack,
      ),
      iconTheme: const IconThemeData(color: primaryBlack),
      elevation: 0,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: backgroundSecondary,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: borderPrimary),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: borderPrimary),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: borderFocus, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: errorColor),
      ),
      hintStyle: GoogleFonts.outfit(color: textTertiary),
      labelStyle: GoogleFonts.outfit(color: textSecondary),
      floatingLabelStyle: GoogleFonts.outfit(color: borderFocus),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: primaryBlack,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 2,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: secondaryColor,
        side: const BorderSide(color: secondaryColor),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: accentColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    textTheme: GoogleFonts.outfitTextTheme(
      const TextTheme(
        displayLarge: TextStyle(color: textColor, fontWeight: FontWeight.bold),
        displayMedium: TextStyle(color: textColor, fontWeight: FontWeight.bold),
        displaySmall: TextStyle(color: textColor, fontWeight: FontWeight.bold),
        headlineLarge: TextStyle(color: textColor, fontWeight: FontWeight.bold),
        headlineMedium: TextStyle(color: textColor, fontWeight: FontWeight.bold),
        headlineSmall: TextStyle(color: textColor, fontWeight: FontWeight.bold),
        titleLarge: TextStyle(color: textColor, fontWeight: FontWeight.w600),
        titleMedium: TextStyle(color: textColor, fontWeight: FontWeight.w600),
        titleSmall: TextStyle(color: textColor, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(color: textColor),
        bodyMedium: TextStyle(color: textColor),
        bodySmall: TextStyle(color: textSecondary),
        labelLarge: TextStyle(color: textColor, fontWeight: FontWeight.w500),
        labelMedium: TextStyle(color: textSecondary),
        labelSmall: TextStyle(color: textTertiary),
      ),
    ),
    cardTheme: CardThemeData(
      color: backgroundPrimary,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      shadowColor: primaryBlack.withOpacity(0.1),
    ),
    dividerTheme: const DividerThemeData(
      color: borderPrimary,
      thickness: 1,
    ),
    iconTheme: const IconThemeData(
      color: textSecondary,
      size: 24,
    ),
  );

  // ===== DARK THEME =====
  static final darkTheme = ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: primaryBlack,
    brightness: Brightness.dark,
    primaryColor: primaryColor,
    colorScheme: const ColorScheme.dark(
      primary: primaryColor,
      secondary: secondaryColor,
      tertiary: accentColor,
      surface: Color(0xFF2A2F3A),
      background: primaryBlack,
      error: errorColor,
      onPrimary: primaryBlack,
      onSecondary: white,
      onTertiary: white,
      onSurface: white,
      onBackground: white,
      onError: white,
      outline: textSecondary,
      outlineVariant: textTertiary,
      surfaceVariant: primaryBlack,
      inverseSurface: white,
      shadow: primaryBlack,
      scrim: primaryBlack,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: primaryBlack,
      foregroundColor: white,
      titleTextStyle: GoogleFonts.outfit(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: white,
      ),
      iconTheme: const IconThemeData(color: white),
      elevation: 0,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: primaryBlack,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: textSecondary),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: textSecondary),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: borderFocus, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: errorColor),
      ),
      hintStyle: GoogleFonts.outfit(color: textTertiary),
      labelStyle: GoogleFonts.outfit(color: textTertiary),
      floatingLabelStyle: GoogleFonts.outfit(color: borderFocus),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: primaryBlack,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 2,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: secondaryColor,
        side: const BorderSide(color: secondaryColor),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: accentColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    textTheme: GoogleFonts.outfitTextTheme(
      const TextTheme(
        displayLarge: TextStyle(color: white, fontWeight: FontWeight.bold),
        displayMedium: TextStyle(color: white, fontWeight: FontWeight.bold),
        displaySmall: TextStyle(color: white, fontWeight: FontWeight.bold),
        headlineLarge: TextStyle(color: white, fontWeight: FontWeight.bold),
        headlineMedium: TextStyle(color: white, fontWeight: FontWeight.bold),
        headlineSmall: TextStyle(color: white, fontWeight: FontWeight.bold),
        titleLarge: TextStyle(color: white, fontWeight: FontWeight.w600),
        titleMedium: TextStyle(color: white, fontWeight: FontWeight.w600),
        titleSmall: TextStyle(color: white, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(color: white),
        bodyMedium: TextStyle(color: white),
        bodySmall: TextStyle(color: textTertiary),
        labelLarge: TextStyle(color: white, fontWeight: FontWeight.w500),
        labelMedium: TextStyle(color: textTertiary),
        labelSmall: TextStyle(color: textSecondary),
      ),
    ),
    cardTheme: CardThemeData(
      color: primaryBlack,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      shadowColor: primaryBlack.withOpacity(0.3),
    ),
    dividerTheme: const DividerThemeData(
      color: textSecondary,
      thickness: 1,
    ),
    iconTheme: const IconThemeData(
      color: textTertiary,
      size: 24,
    ),
  );
}
