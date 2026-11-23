import 'package:flutter/material.dart';

// ===== PRIMARY COLORS (from palette) =====
const Color primary500 = Color(0xFFFFB700); // FFB700
const Color primary400 = Color(0xFFFFD000); // FFD000
const Color bffBlue = Color(0xFF009ABF); // Primary - BFF Blue
const Color bizzOrange = Color(0xFFFF6C37); // Primary - Bizz Orange

// ===== SECONDARY COLORS =====
const Color lemon = Color(0xFFFDDA64); // Secondary - Lemon
const Color banana = Color(0xFFF3EFA1); // Secondary - Banana
const Color goldenHoney = Color(0xFFCB9700); // Secondary - Golden Honey
const Color sky = Color(0xFF97CAEB); // Secondary - Sky
const Color ice = Color(0xFFD4EAED); // Secondary - Ice
const Color navy = Color(0xFF003057); // Secondary - Navy
const Color hustle = Color(0xFFF6A7D7); // Secondary - Hustle
const Color blush = Color(0xFFF7DEE1); // Secondary - Blush
const Color plum = Color(0xFF572A31); // Secondary - Plum

// ===== NEUTRAL COLORS =====
const Color white = Color(0xFFFFFFFF); // White
const Color situationalIvory = Color(0xFFF9F9F9); // Subtle off-white bg
const Color primaryBlack = Color(0xFF0F0F0F); // from palette

// ===== SEMANTIC COLORS =====
const Color primaryColor = primary500; // Main brand color
const Color secondaryColor = primary400; // Secondary brand color
const Color accentColor = bizzOrange; // Accent color
const Color successColor = goldenHoney; // Success states
const Color warningColor = lemon; // Warning states
const Color errorColor =
    bizzOrange; // Error states (using orange for visibility)

// ===== TEXT COLORS (mapped to greys from palette) =====
const Color textColor = Color(0xFF0F0F0F); // Primary text (0F0F0F)
const Color textSecondary = Color(0xFF2A2929); // Secondary text (2A2929)
const Color textTertiary = Color(0xFF444342); // Tertiary text (444342)
const Color textInverse = white; // Text on dark backgrounds

// ===== BACKGROUND COLORS =====
const Color backgroundPrimary = white; // Main background
const Color backgroundSecondary =
    Color.fromARGB(255, 245, 245, 245); // light grey fill
const Color backgroundTertiary = Color(0xFFF0F0F0); // Tertiary background

// ===== BORDER COLORS =====
const Color borderPrimary = Color(0xFFE5E5E5); // Primary borders (grey)
const Color borderSecondary = Color(0xFFDBDBDB); // Secondary borders
const Color borderFocus = primary400; // Focus state borders use yellow

// ===== LEGACY COLORS (for backward compatibility) =====
const Color darkPink = hustle; // Legacy - now using Hustle
const Color darkPink2 = bizzOrange; // Legacy - now using Bizz Orange
const Color lightPink1 = blush; // Legacy - now using Blush
const Color lightPink2 = Color(0xFFF8C9D2); // Keep for compatibility
const Color lightPink3 = ice; // Legacy - now using Ice
const Color lightPink4 = sky; // Legacy - now using Sky
const Color lightPurple = hustle; // Legacy - now using Hustle
const Color pinkAccent = hustle; // Legacy - now using Hustle
const Color blackPrimary = primaryBlack; // Legacy - now using Bumble Black
const Color blackSecondary = Color(0xFF3F4454); // Keep for compatibility
const Color suffixColor = textSecondary; // Legacy - now using textSecondary
const Color redColor = bizzOrange; // Legacy - now using Bizz Orange
const Color circleColor = Color(0xFFC4C4C4); // Keep for compatibility
const Color navSelectedColor = primaryBlack; // Legacy - now using Bumble Black
const Color paragraphColor = textSecondary; // Legacy - now using textSecondary
const Color captionTextColor = textTertiary; // Legacy - now using textTertiary
const Color skillsColorOne = lemon; // Legacy - now using Lemon
const Color skillsColorTwo = banana; // Legacy - now using Banana
const Color skillsColorThree = ice; // Legacy - now using Ice

// ===== ADDITIONAL UTILITY COLORS =====
const Color fillColor = backgroundSecondary; // Form fill color
const Color boarderColor = borderPrimary; // Typo fix: border color
const Color labelColor = textSecondary; // Label color
