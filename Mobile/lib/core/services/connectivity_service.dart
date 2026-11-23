import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  final StreamController<bool> _connectionStatusController =
      StreamController<bool>.broadcast();

  Stream<bool> get connectionStatus => _connectionStatusController.stream;

  ConnectivityService() {
    _connectivity.onConnectivityChanged
        .listen((List<ConnectivityResult> results) {
      _checkStatus(results);
    });
  }

  void _checkStatus(List<ConnectivityResult> results) {
    bool isConnected = results.any((result) =>
        result == ConnectivityResult.mobile ||
        result == ConnectivityResult.wifi ||
        result == ConnectivityResult.ethernet);
    _connectionStatusController.add(isConnected);
  }

  Future<bool> checkInitialConnection() async {
    final results = await _connectivity.checkConnectivity();
    return results.any((result) =>
        result == ConnectivityResult.mobile ||
        result == ConnectivityResult.wifi ||
        result == ConnectivityResult.ethernet);
  }

  void dispose() {
    _connectionStatusController.close();
  }
}
