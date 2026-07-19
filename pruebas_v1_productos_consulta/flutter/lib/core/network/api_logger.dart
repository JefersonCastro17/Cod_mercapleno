import 'package:flutter/foundation.dart';

class ApiLogger {
  static void log(String message) {
    if (kDebugMode) {
      print('[API] $message');
    }
  }

  static void logRequest(String method, String url) {
    log('📤 $method $url');
  }

  static void logResponse(String method, String url, int statusCode,
      {required Duration duration}) {
    log('📥 $method $url - Status: $statusCode (${duration.inMilliseconds}ms)');
  }

  static void logError(String method, String url, String error) {
    log('❌ $method $url - Error: $error');
  }

  static void logRetry(String method, String url, int attempt, int maxAttempts) {
    log('🔄 Reintentando $method $url (intento $attempt/$maxAttempts)');
  }
}

