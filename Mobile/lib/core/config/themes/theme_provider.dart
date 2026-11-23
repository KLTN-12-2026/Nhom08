import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'app_colors.dart';
import 'app_theme.dart';

// ===== Theme Events =====
abstract class ThemeEvent extends Equatable {
  const ThemeEvent();

  @override
  List<Object?> get props => [];
}

class ThemeChanged extends ThemeEvent {
  final bool isDarkMode;

  const ThemeChanged(this.isDarkMode);

  @override
  List<Object?> get props => [isDarkMode];
}

class ThemeToggled extends ThemeEvent {}

// ===== Theme States =====
abstract class ThemeState extends Equatable {
  const ThemeState();

  @override
  List<Object?> get props => [];
}

class ThemeInitial extends ThemeState {}

class ThemeLoaded extends ThemeState {
  final bool isDarkMode;
  final ThemeData theme;

  const ThemeLoaded({
    required this.isDarkMode,
    required this.theme,
  });

  @override
  List<Object?> get props => [isDarkMode, theme];
}

// ===== Theme Bloc =====
class ThemeBloc extends Bloc<ThemeEvent, ThemeState> {
  ThemeBloc() : super(ThemeInitial()) {
    on<ThemeChanged>(_onThemeChanged);
    on<ThemeToggled>(_onThemeToggled);
  }

  void _onThemeChanged(ThemeChanged event, Emitter<ThemeState> emit) {
    final theme = event.isDarkMode ? MyTheme.darkTheme : MyTheme.lightTheme;
    emit(ThemeLoaded(isDarkMode: event.isDarkMode, theme: theme));
  }

  void _onThemeToggled(ThemeToggled event, Emitter<ThemeState> emit) {
    if (state is ThemeLoaded) {
      final currentState = state as ThemeLoaded;
      final newIsDarkMode = !currentState.isDarkMode;
      final theme = newIsDarkMode ? MyTheme.darkTheme : MyTheme.lightTheme;
      emit(ThemeLoaded(isDarkMode: newIsDarkMode, theme: theme));
    } else {
      // Default to light theme if no theme is loaded
      emit(ThemeLoaded(isDarkMode: false, theme: MyTheme.lightTheme));
    }
  }
}

// ===== Theme Extensions =====
extension ThemeExtension on BuildContext {
  bool get isDarkMode {
    final state = read<ThemeBloc>().state;
    return state is ThemeLoaded && state.isDarkMode;
  }

  ThemeData get theme {
    final state = read<ThemeBloc>().state;
    return state is ThemeLoaded ? state.theme : MyTheme.lightTheme;
  }

  ColorScheme get colorScheme => theme.colorScheme;
  TextTheme get textTheme => theme.textTheme;
}

// ===== Color Extensions =====
extension ColorSchemeExtension on ColorScheme {
  // Primary Colors
  Color get borderFocus => borderFocus;
  Color get bffBlue => bffBlue;
  Color get bizzOrange => bizzOrange;

  // Secondary Colors
  Color get lemon => lemon;
  Color get banana => banana;
  Color get goldenHoney => goldenHoney;
  Color get sky => sky;
  Color get ice => ice;
  Color get navy => navy;
  Color get hustle => hustle;
  Color get blush => blush;
  Color get plum => plum;

  // Neutral Colors
  Color get primaryBlack => primaryBlack;
  Color get situationalIvory => situationalIvory;

  // Semantic Colors
  Color get success => goldenHoney;
  Color get warning => lemon;
  Color get error => bizzOrange;
  Color get info => bffBlue;
}
