import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:trove/core/config/router/app_routes.dart';

/// Quick test widget để verify paywall route
///
/// Thêm widget này vào bất kỳ screen nào để test
class PaywallTestButton extends StatelessWidget {
  const PaywallTestButton({super.key});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        print('🔍 Testing paywall route: ${AppRoutes.paywall}');

        try {
          // Method 1: Using context.push
          context.push(AppRoutes.paywall);
          print('✅ Navigation successful!');
        } catch (e) {
          print('❌ Navigation failed: $e');

          // Show error dialog
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Navigation Error'),
              content: Text('Failed to navigate to paywall:\n$e'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        }
      },
      child: const Text('🧪 Test Paywall Route'),
    );
  }
}

/// Alternative: Test with named route
class PaywallTestButtonNamed extends StatelessWidget {
  const PaywallTestButtonNamed({super.key});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        print('🔍 Testing paywall named route: paywall');

        try {
          // Method 2: Using context.pushNamed
          context.pushNamed('paywall');
          print('✅ Navigation successful!');
        } catch (e) {
          print('❌ Navigation failed: $e');
        }
      },
      child: const Text('🧪 Test Paywall (Named)'),
    );
  }
}

/*
USAGE:

1. Add to any screen:
```dart
import 'package:trove/core/utils/paywall_test_widget.dart';

// In your widget build:
Column(
  children: [
    PaywallTestButton(),
    PaywallTestButtonNamed(),
  ],
)
```

2. Run app and click the button
3. Check console for debug messages
4. If you see "✅ Navigation successful!" → Route works!
5. If you see "❌ Navigation failed:" → Check the error message

*/
