import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';

/// Wrapper sencillo para comprobar conectividad de red.
class NetworkInfo {
  final InternetConnection _checker;

  NetworkInfo({InternetConnection? checker}) : _checker = checker ?? InternetConnection();

  /// Devuelve `true` si hay conexión a internet.
  Future<bool> get isConnected => _checker.hasInternetAccess;
}
