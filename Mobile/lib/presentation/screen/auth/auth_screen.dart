import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:trove/presentation/bloc/api_mode/api_mode_bloc.dart';
import 'package:trove/core/config/api_mode.dart';
import 'package:trove/core/config/router/app_routes.dart';
import 'package:trove/presentation/widgets/dialogs/error_dialog.dart';

import 'package:trove/core/config/themes/app_colors.dart';
import 'package:trove/presentation/bloc/auth/auth_bloc.dart';
import 'package:trove/presentation/bloc/auth/auth_state.dart';
import 'package:trove/presentation/bloc/auth/auth_event.dart';
import 'package:trove/presentation/widgets/input/primary_input.dart';
import 'package:trove/presentation/widgets/button/primary_button.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({Key? key}) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _loginFormKey = GlobalKey<FormState>();
  final _registerFormKey = GlobalKey<FormState>();

  // Đăng nhập fields
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  // Đăng ký fields
  final _registerEmailController = TextEditingController();
  final _registerPasswordController = TextEditingController();
  final _registerPasswordConfirmationController = TextEditingController();
  final _registerNameController = TextEditingController();
  final _registerPhoneController = TextEditingController();
  bool _keepLoggedIn = true;
  bool _loginPasswordObscure = true;
  bool _registerPasswordObscure = true;
  bool _registerPasswordConfirmObscure = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    // Set default credentials only in DEV mode
    final apiState = context.read<ApiModeBloc>().state;
    if (apiState is ApiModeLoaded &&
        apiState.currentMode != ApiMode.production) {
      _emailController.text = "minhtoan3@example.com";
      _passwordController.text = "password123";
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _registerEmailController.dispose();
    _registerPasswordController.dispose();
    _registerPasswordConfirmationController.dispose();
    _registerNameController.dispose();
    _registerPhoneController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    if (_loginFormKey.currentState!.validate()) {
      final email = _emailController.text.trim();
      final password = _passwordController.text;

      context.read<AuthBloc>().add(
            AuthLoginRequested(
              email: email,
              password: password,
            ),
          );
    }
  }

  void _handleRegister() {
    if (_registerFormKey.currentState!.validate()) {
      final email = _registerEmailController.text.trim();
      final password = _registerPasswordController.text;
      final passwordConfirmation = _registerPasswordConfirmationController.text;
      final name = _registerNameController.text.trim();
      final phone = _registerPhoneController.text.trim();

      context.read<AuthBloc>().add(
            AuthRegisterRequested(
              email: email,
              password: password,
              passwordConfirmation: passwordConfirmation,
              name: name,
              phone: phone.isEmpty ? null : phone,
            ),
          );
    }
  }

  void _clearLoginFields() {
    _emailController.clear();
    _passwordController.clear();
  }

  void _clearRegisterFields() {
    _registerEmailController.clear();
    _registerPasswordController.clear();
    _registerPasswordConfirmationController.clear();
    _registerNameController.clear();
    _registerPhoneController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: Stack(
        children: [
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
              ),
            ),
          ),
          BlocListener<AuthBloc, AuthState>(
            listener: (context, state) {
              if (state is AuthSuccess) {
                _clearLoginFields();
                _clearRegisterFields();

                context.go(AppRoutes.places);
              } else if (state is AuthError) {
                showErrorDialog(context: context, message: state.message);
              }
            },
            child: SafeArea(
              child: SingleChildScrollView(
                padding: EdgeInsets.only(
                  left: 24.0,
                  right: 24.0,
                  top: 24.0,
                  bottom: MediaQuery.of(context).viewInsets.bottom + 24.0,
                ),
                child: Column(
                  children: [
                    // Back row
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton.icon(
                        onPressed: () => Navigator.of(context).maybePop(),
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          foregroundColor: textSecondary,
                        ),
                        icon: const Icon(
                          Icons.arrow_back_ios_new,
                          size: 16,
                        ),
                        label: const Text(
                          'Quay lại',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    // Greeting
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Xin chào',
                            textAlign: TextAlign.start,
                            style: TextStyle(
                              fontSize: 30,
                              fontWeight: FontWeight.w400,
                              color: Colors.black87,
                              height: 1.1,
                            ),
                          ),
                          Text(
                            'KHỎI LO SEEDING',
                            textAlign: TextAlign.start,
                            style: TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.w800,
                              color: const Color(
                                  0xFFFFB700), // primary yellow color
                              height: 1.1,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),
                    TabBar(
                      controller: _tabController,
                      padding: EdgeInsets.all(0),
                      indicatorPadding: EdgeInsets.zero,
                      labelColor: primaryBlack,
                      unselectedLabelColor: primaryBlack,
                      tabs: const [
                        Tab(
                          child: Center(child: Text('Đăng nhập')),
                        ),
                        Tab(
                          child: Center(child: Text('Đăng ký')),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: MediaQuery.of(context).size.height * 0.4,
                        maxHeight: MediaQuery.of(context).size.height * 0.6,
                      ),
                      child: TabBarView(
                        controller: _tabController,
                        children: [
                          _buildLoginTab(),
                          _buildRegisterTab(),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoginTab() {
    return Form(
      key: _loginFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Địa chỉ Email',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: primaryBlack,
            ),
          ),
          const SizedBox(height: 8),
          PrimaryInput(
            controller: _emailController,
            hintText: 'name@example.com',
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Vui lòng nhập email';
              }
              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                  .hasMatch(value)) {
                return 'Vui lòng nhập email hợp lệ';
              }
              return null;
            },
          ),
          const SizedBox(height: 20),
          const Text(
            'Mật khẩu',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: primaryBlack,
            ),
          ),
          const SizedBox(height: 8),
          PrimaryInput(
            controller: _passwordController,
            hintText: 'Nhập mật khẩu',
            obscureText: _loginPasswordObscure,
            suffixIcon: IconButton(
              icon: Icon(
                _loginPasswordObscure ? Icons.visibility_off : Icons.visibility,
                color: Colors.grey[600],
              ),
              onPressed: () {
                setState(() {
                  _loginPasswordObscure = !_loginPasswordObscure;
                });
              },
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Vui lòng nhập mật khẩu';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Checkbox(
                    value: _keepLoggedIn,
                    activeColor: primaryColor,
                    onChanged: (val) {
                      setState(() {
                        _keepLoggedIn = val ?? false;
                      });
                    },
                  ),
                  const SizedBox(width: 4),
                  const Text(
                    'Giữ đăng nhập',
                    style: TextStyle(
                      fontSize: 13,
                      color: textSecondary,
                    ),
                  ),
                ],
              ),
              TextButton(
                onPressed: () {
                  context.push(AppRoutes.forgotPassword);
                },
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text(
                  'Quên mật khẩu?',
                  style: TextStyle(
                    fontSize: 13,
                    color: primaryColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              return Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: PrimaryButton(
                      onPressed: state is AuthLoading ? null : _handleLogin,
                      child: state is AuthLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text('Đăng nhập'),
                    ),
                  ),
                  if (state is AuthError) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập và thử lại.',
                      style: TextStyle(
                        color: Colors.red[600],
                        fontSize: 12,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildRegisterTab() {
    return Form(
      key: _registerFormKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          PrimaryInput(
            controller: _registerNameController,
            hintText: 'Tên',
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Vui lòng nhập tên';
              }
              if (value.trim().length < 2) {
                return 'Tên phải có ít nhất 2 ký tự';
              }
              if (value.trim().length > 200) {
                return 'Tên phải ít hơn 200 ký tự';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          PrimaryInput(
            controller: _registerEmailController,
            hintText: 'Email',
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Vui lòng nhập email';
              }
              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                  .hasMatch(value)) {
                return 'Vui lòng nhập email hợp lệ';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          // PrimaryInput(
          //   controller: _registerPhoneController,
          //   hintText: 'Số điện thoại (Tùy chọn)',
          // ),
          // const SizedBox(height: 16),
          PrimaryInput(
            controller: _registerPasswordController,
            hintText: 'Mật khẩu',
            obscureText: _registerPasswordObscure,
            suffixIcon: IconButton(
              icon: Icon(
                _registerPasswordObscure
                    ? Icons.visibility_off
                    : Icons.visibility,
                color: Colors.grey[600],
              ),
              onPressed: () {
                setState(() {
                  _registerPasswordObscure = !_registerPasswordObscure;
                });
              },
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Vui lòng nhập mật khẩu';
              }
              if (value.length < 6) {
                return 'Mật khẩu phải có ít nhất 6 ký tự';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          PrimaryInput(
            controller: _registerPasswordConfirmationController,
            hintText: 'Xác nhận mật khẩu',
            obscureText: _registerPasswordConfirmObscure,
            suffixIcon: IconButton(
              icon: Icon(
                _registerPasswordConfirmObscure
                    ? Icons.visibility_off
                    : Icons.visibility,
                color: Colors.grey[600],
              ),
              onPressed: () {
                setState(() {
                  _registerPasswordConfirmObscure =
                      !_registerPasswordConfirmObscure;
                });
              },
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Vui lòng xác nhận mật khẩu';
              }
              if (value != _registerPasswordController.text) {
                return 'Mật khẩu không khớp';
              }
              return null;
            },
          ),
          const SizedBox(height: 24),
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              return Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: PrimaryButton(
                      onPressed: state is AuthLoading ? null : _handleRegister,
                      child: state is AuthLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
                              'Đăng ký',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),
                  if (state is AuthError) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.',
                      style: TextStyle(
                        color: Colors.red[600],
                        fontSize: 12,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
