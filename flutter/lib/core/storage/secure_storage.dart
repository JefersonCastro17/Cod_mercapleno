import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';

class SecureStorage {
  SecureStorage._();

  static const _accessKey = 'access_token';
  static const _refreshKey = 'refresh_token';

  static final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );

  static final LocalAuthentication _localAuth = LocalAuthentication();
 
  // AUTH BIOMÉTRICA CENTRALIZADA 
  static Future<bool> _authenticate(String reason) async {
    try {
      final isSupported = await _localAuth.isDeviceSupported();
      final canCheck = await _localAuth.canCheckBiometrics;

      if (!isSupported || !canCheck) return false;

      return await _localAuth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          biometricOnly: false, // permite PIN/patrón si no hay biometría
          stickyAuth: true,
        ),
      );
    } catch (_) {
      return false;
    }
  }
 
  // ACCESS TOKEN 
  static Future<void> saveAccessToken(String token) async {
    await _storage.write(key: _accessKey, value: token);
  }

  static Future<String?> readAccessToken({bool requireAuth = false}) async {
    if (requireAuth) {
      final didAuth = await _authenticate('Autentícate para acceder al token');
      if (!didAuth) return null;
    }
    return await _storage.read(key: _accessKey);
  }

  static Future<void> deleteAccessToken() async {
    await _storage.delete(key: _accessKey);
  }
 
  // REFRESH TOKEN 
  static Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: _refreshKey, value: token);
  }

  static Future<String?> readRefreshToken({bool requireAuth = false}) async {
    if (requireAuth) {
      final didAuth = await _authenticate('Autentícate para refrescar sesión');
      if (!didAuth) return null;
    }
    return await _storage.read(key: _refreshKey);
  }

  static Future<void> deleteRefreshToken() async {
    await _storage.delete(key: _refreshKey);
  }
 
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}