import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:trove/core/config/router/app_router.dart';
import 'package:trove/models/spin_history.dart';
import 'package:trove/core/services/hive_service.dart';
import 'package:trove/services/notification_service.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:trove/services/revenue_cat_service.dart';

import 'package:trove/presentation/bloc/auth/auth_bloc.dart';
import 'package:trove/presentation/bloc/bloc_factory.dart';
import 'package:trove/core/services/service_provider.dart';
import 'package:trove/core/services/connectivity_service.dart';
import 'package:trove/presentation/bloc/network/network_bloc.dart';
import 'package:trove/presentation/bloc/api_mode/api_mode_bloc.dart';
import 'package:trove/presentation/screen/error/no_internet_screen.dart';
import 'core/config/themes/app_theme.dart';
import 'core/config/themes/theme_provider.dart';
import 'core/config/mapbox_config.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Lưu ý: Nếu bạn có file firebase_options.dart, hãy import nó vào đây
// import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await dotenv.load(fileName: "lib/core/config/.env");

    await hiveService.init();
    if (!Hive.isAdapterRegistered(0)) {
      Hive.registerAdapter(SpinHistoryAdapter());
    }

    await Firebase.initializeApp(
        // options: DefaultFirebaseOptions.currentPlatform,
        );

    
    await setupMapBox();

    
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

  
    final sharedPreferences = await SharedPreferences.getInstance();

    await serviceProvider.initialize();

    await NotificationService.instance.init();
    await NotificationService.instance.attachFirebaseListeners();

    await RevenueCatService.instance.initialize();

    runApp(
      ProviderScope(
        child: MultiBlocProvider(
          providers: [
            BlocProvider<ApiModeBloc>(
              create: (context) => ApiModeBloc(prefs: sharedPreferences)
                ..add(const ApiModeInitialize()),
            ),
            BlocProvider<AuthBloc>(
              create: (context) => blocFactory.createAuthBloc(),
            ),
            BlocProvider<ThemeBloc>(
              create: (context) => ThemeBloc(),
            ),
            BlocProvider<NetworkBloc>(
              create: (context) =>
                  NetworkBloc(ConnectivityService())..add(NetworkObserve()),
            ),
          ],
          child: const MyApp(),
        ),
      ),
    );
  } catch (e, stackTrace) {
    debugPrint('❌ Error during app initialization: $e');
    debugPrint('Stack trace: $stackTrace');

    runApp(
      MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 80, color: Colors.red),
                  const SizedBox(height: 20),
                  const Text(
                    'Lỗi khởi tạo ứng dụng',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Vui lòng thoát ứng dụng và thử lại.\n\nChi tiết lỗi: $e',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

Future<void> setupMapBox() async {
  String accessToken = MapboxConfig.accessToken;
  if (accessToken.isEmpty || accessToken == 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
    debugPrint("⚠️ Warning: Mapbox access token is not set properly.");
  }
  MapboxOptions.setAccessToken(accessToken);
}

class MyApp extends StatelessWidget {
  const MyApp({super.key}); // Cú pháp constructor mới và ngắn gọn hơn

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, state) {
        // Lấy theme từ Bloc state
        final theme = state is ThemeLoaded ? state.theme : MyTheme.lightTheme;

        return MaterialApp.router(
          debugShowCheckedModeBanner: false,
          title: 'Trove Mobile',
          theme: theme,
          routerConfig:
              appRouter, // appRouter phải được định nghĩa trong core/config/router/app_router.dart
          builder: (context, child) {
            return BlocBuilder<NetworkBloc, NetworkState>(
              builder: (context, networkState) {
                // Nếu mất kết nối internet, đè màn hình NoInternetScreen lên trên
                if (networkState is NetworkFailure) {
                  return const NoInternetScreen();
                }
                return child!;
              },
            );
          },
        );
      },
    );
  }
}
