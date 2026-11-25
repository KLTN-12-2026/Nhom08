import 'package:equatable/equatable.dart';
import '../../../models/user.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;

  const AuthLoginRequested({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class AuthRegisterRequested extends AuthEvent {
  final String name;
  final String email;
  final String password;
  final String passwordConfirmation;
  final String? phone;

  const AuthRegisterRequested({
    required this.name,
    required this.email,
    required this.password,
    required this.passwordConfirmation,
    this.phone,
  });

  @override
  List<Object?> get props =>
      [name, email, password, passwordConfirmation, phone];
}

class AuthLogoutRequested extends AuthEvent {}

class AuthCheckStatusRequested extends AuthEvent {}

class AuthTokenExpired extends AuthEvent {}

class AuthRestoreSession extends AuthEvent {
  final User user;
  const AuthRestoreSession({required this.user});

  @override
  List<Object?> get props => [user];
}
