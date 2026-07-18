import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  AppConfig._();

  static const String _baseUrl = 'http://10.58.117.19:4000';

  static String get apiBaseUrl {
    // 1. Priorizar String.fromEnvironment para compatibilidad en despliegues
    const override = String.fromEnvironment('API_BASE_URL');
    if (override.isNotEmpty) {
      return _sanitizeBaseUrl(override);
    }

    // 2. Respaldo en dotenv si el archivo existe y está cargado
    try {
      final envUrl = dotenv.env['API_BASE_URL'];
      if (envUrl != null && envUrl.isNotEmpty) {
        return _sanitizeBaseUrl(envUrl);
      }
    } catch (_) {}

    return _sanitizeBaseUrl(_baseUrl);
  }

  static int get lowStockThreshold {
    try {
      final envVal = dotenv.env['LOW_STOCK_THRESHOLD'];
      if (envVal != null) {
        return int.tryParse(envVal) ?? 5;
      }
    } catch (_) {}
    return 5;
  }

  static String get apiKey {
    // 1. Priorizar String.fromEnvironment
    const key = String.fromEnvironment('INTERNAL_API_KEY');
    if (key.isNotEmpty) {
      return key;
    }

    // 2. Respaldo en dotenv
    try {
      final envKey = dotenv.env['INTERNAL_API_KEY'];
      if (envKey != null && envKey.isNotEmpty) {
        return envKey;
      }
    } catch (_) {}

    return '';
  }

  // 🖼️ GESTIÓN DE IMÁGENES
  static String get uploadsUrl => '$apiBaseUrl/uploads';

  // 🔗 ENDPOINTS DE AUTENTICACIÓN
  static String get authBasePath => '/api/auth';

  static String get loginEndpoint => '$authBasePath/login';
  static String get verifyLoginCodeEndpoint => '$authBasePath/verify-login-code';
  static String get documentTypesEndpoint => '$authBasePath/document-types';
  static String get registerEndpoint => '$authBasePath/register';
  static String get verifyEmailEndpoint => '$authBasePath/verify-email';
  static String get resendVerificationEndpoint =>
      '$authBasePath/resend-verification';
  static String get requestPasswordResetEndpoint =>
      '$authBasePath/request-password-reset';
  static String get resetPasswordEndpoint => '$authBasePath/reset-password';

  // 🛒 MÓDULO DE VENTAS (Sincronizado con SalesController de NestJS)
  static String get _salesBasePath => '/api/sales';
  
  static String get getProductsEndpoint => '$_salesBasePath/products';
  static String get getCategoriesEndpoint => '$_salesBasePath/categories';
  static String get createOrderEndpoint => '$_salesBasePath/orders';

  // 🧹 LIMPIEZA DE URL
  static String _sanitizeBaseUrl(String value) {
    if (value.endsWith('/')) {
      return value.substring(0, value.length - 1);
    }
    return value;
  }
}