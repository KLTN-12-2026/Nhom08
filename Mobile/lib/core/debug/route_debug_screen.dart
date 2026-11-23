import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Debug screen để xem tất cả routes available
class RouteDebugScreen extends StatelessWidget {
  const RouteDebugScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Debug Routes'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            '🔍 Available Routes:',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          // List all route configurations
          _buildRouteInfo(context, '/paywall', 'Paywall'),
          _buildRouteInfo(context, '/places', 'Places'),
          _buildRouteInfo(context, '/account', 'Account'),
          _buildRouteInfo(context, '/camera', 'Camera'),
          _buildRouteInfo(context, '/date', 'Date'),

          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 16),

          const Text(
            '🧪 Test Navigation:',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          ElevatedButton(
            onPressed: () {
              try {
                context.push('/paywall');
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('✅ Navigation successful!'),
                    backgroundColor: Colors.green,
                  ),
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('❌ Error: $e'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            child: const Text('Test /paywall'),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteInfo(BuildContext context, String path, String name) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const Icon(Icons.route),
        title: Text(path),
        subtitle: Text(name),
        trailing: IconButton(
          icon: const Icon(Icons.play_arrow),
          onPressed: () {
            try {
              context.push(path);
            } catch (e) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Error: $e'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          },
        ),
      ),
    );
  }
}

/*
USAGE:

1. Navigate to this screen:
```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const RouteDebugScreen()),
);
```

2. Click "Test /paywall" button
3. Check if navigation works

If it doesn't work, you'll see the exact error message.
*/
