import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:trove/core/services/service_provider.dart';
import 'package:trove/data/response/app_info/app_info_response.dart';
import 'package:trove/presentation/bloc/api_mode/api_mode_bloc.dart';

class AppVersionWidget extends StatefulWidget {
  const AppVersionWidget({Key? key}) : super(key: key);

  @override
  State<AppVersionWidget> createState() => AppVersionWidgetState();
}

class AppVersionWidgetState extends State<AppVersionWidget> {
  int _tapCount = 0;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AppInfoResponse?>(
      stream: serviceProvider.dataAppService.appInfoStream,
      builder: (context, snapshot) {
        final version = snapshot.data?.data?.version ?? 'Unknown';

        return GestureDetector(
          onTap: () {
            setState(() {
              _tapCount++;
              if (_tapCount >= 10) {
                _tapCount = 0;
                context.read<ApiModeBloc>().add(const ApiModeSwitch());
              }
            });
          },
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Text(
                'Version: $version',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
            ),
          ),
        );
      },
    );
  }
}
