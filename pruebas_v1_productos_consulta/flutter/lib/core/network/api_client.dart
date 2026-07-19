import 'dart:async';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:mercapleno_appv1/core/config/app_config.dart';
import 'package:mercapleno_appv1/core/errors/api_exception.dart';
import 'package:mercapleno_appv1/core/network/api_logger.dart';

class ApiClient {
  ApiClient({http.Client? httpClient}) : _httpClient = httpClient ?? http.Client();

  final http.Client _httpClient;

  static const _timeout = Duration(seconds: 10);
  static const _getRetryCount = 1;
  static const _retryDelay = Duration(milliseconds: 350);

  // GET se usa para pedir datos (soporta query parameters y headers personalizados)
  Future<dynamic> get(
    String path, {
    Map<String, String>? queryParameters,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path, queryParameters);
    ApiLogger.logRequest('GET', uri.toString());

    try {
      final builtHeaders = await _buildHeaders(headers);
      return await _executeRequest(
        () => _httpClient.get(uri, headers: builtHeaders),
        method: 'GET',
        path: path,
        maxRetries: _getRetryCount,
      );
    } on http.ClientException {
      throw const ApiException(
        message: 'No se pudo conectar con el backend. Verifica que esté encendido.',
      );
    } on TimeoutException {
      throw const ApiException(
        message: 'El backend tardó demasiado en responder. Verifica la conexión o la IP configurada.',
      );
    } on FormatException {
      throw const ApiException(
        message: 'El backend respondió con un formato inválido.',
      );
    } catch (error) {
      final rawMessage = error.toString();
      if (_looksLikeConnectionError(rawMessage)) {
        throw const ApiException(
          message: 'No se pudo conectar con el backend. Verifica que esté encendido.',
        );
      }
      rethrow;
    }
  }

  // POST se usa para enviar datos en formato JSON
  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path);
    ApiLogger.logRequest('POST', uri.toString());

    try {
      final builtHeaders = await _buildHeaders(headers);
      final result = await _executeRequest(
        () => _httpClient.post(
          uri,
          headers: builtHeaders,
          body: jsonEncode(body ?? <String, dynamic>{}),
        ),
        method: 'POST',
        path: path,
        maxRetries: 0,
      );

      if (result is Map<String, dynamic>) {
        return result;
      }
      throw const ApiException(
        message: 'Respuesta del servidor no válida.',
      );
    } on http.ClientException {
      throw const ApiException(
        message: 'No se pudo conectar con el backend. Verifica que esté encendido.',
      );
    } on TimeoutException {
      throw const ApiException(
        message: 'El backend tardó demasiado en responder. Verifica la conexión o la IP configurada.',
      );
    } on FormatException {
      throw const ApiException(
        message: 'El backend respondió con un formato inválido.',
      );
    } catch (error) {
      final rawMessage = error.toString();
      if (_looksLikeConnectionError(rawMessage)) {
        throw const ApiException(
          message: 'No se pudo conectar con el backend. Verifica que esté encendido.',
        );
      }
      rethrow;
    }
  }

  // PATCH se usa para actualizaciones parciales en formato JSON.
  Future<Map<String, dynamic>> patch(
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path);
    ApiLogger.logRequest('PATCH', uri.toString());

    try {
      final builtHeaders = await _buildHeaders(headers);
      return await _executeRequest(
        () => _httpClient.patch(
          uri,
          headers: builtHeaders,
          body: jsonEncode(body ?? <String, dynamic>{}),
        ),
        method: 'PATCH',
        path: path,
        maxRetries: 0,
      );
    } on http.ClientException {
      throw const ApiException(
        message: 'No se pudo conectar con el backend. Verifica que este encendido.',
      );
    } on TimeoutException {
      throw const ApiException(
        message: 'El backend tardo demasiado en responder. Verifica la conexion o la IP configurada.',
      );
    } on FormatException {
      throw const ApiException(
        message: 'El backend respondio con un formato invalido.',
      );
    } catch (error) {
      final rawMessage = error.toString();
      if (_looksLikeConnectionError(rawMessage)) {
        throw const ApiException(
          message: 'No se pudo conectar con el backend. Verifica que este encendido.',
        );
      }
      throw const ApiException(
        message: 'Ocurrio un error inesperado. Intenta nuevamente.',
      );
    }
  }

  // PUT se usa para actualizaciones completas en formato JSON.
  Future<Map<String, dynamic>> put(
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path);
    ApiLogger.logRequest('PUT', uri.toString());

    try {
      final builtHeaders = await _buildHeaders(headers);
      return await _executeRequest(
        () => _httpClient.put(
          uri,
          headers: builtHeaders,
          body: jsonEncode(body ?? <String, dynamic>{}),
        ),
        method: 'PUT',
        path: path,
        maxRetries: 0,
      );
    } on http.ClientException {
      throw const ApiException(
        message: 'No se pudo conectar con el backend. Verifica que este encendido.',
      );
    } on TimeoutException {
      throw const ApiException(
        message: 'El backend tardo demasiado en responder. Verifica la conexion o la IP configurada.',
      );
    } on FormatException {
      throw const ApiException(
        message: 'El backend respondio con un formato invalido.',
      );
    } catch (error) {
      final rawMessage = error.toString();
      if (_looksLikeConnectionError(rawMessage)) {
        throw const ApiException(
          message: 'No se pudo conectar con el backend. Verifica que este encendido.',
        );
      }
      throw const ApiException(
        message: 'Ocurrio un error inesperado. Intenta nuevamente.',
      );
    }
  }

  // DELETE se usa para eliminar recursos en el backend.
  Future<Map<String, dynamic>> delete(
    String path, {
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path);
    ApiLogger.logRequest('DELETE', uri.toString());

    try {
      final builtHeaders = await _buildHeaders(headers);
      return await _executeRequest(
        () => _httpClient.delete(uri, headers: builtHeaders),
        method: 'DELETE',
        path: path,
        maxRetries: 0,
      );
    } on http.ClientException {
      throw const ApiException(
        message: 'No se pudo conectar con el backend. Verifica que este encendido.',
      );
    } on TimeoutException {
      throw const ApiException(
        message: 'El backend tardo demasiado en responder. Verifica la conexion o la IP configurada.',
      );
    } on FormatException {
      throw const ApiException(
        message: 'El backend respondio con un formato invalido.',
      );
    } catch (error) {
      final rawMessage = error.toString();
      if (_looksLikeConnectionError(rawMessage)) {
        throw const ApiException(
          message: 'No se pudo conectar con el backend. Verifica que este encendido.',
        );
      }
      throw const ApiException(
        message: 'Ocurrio un error inesperado. Intenta nuevamente.',
      );
    }
  }

  Uri _buildUri(String path, [Map<String, String>? queryParameters]) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    final baseUrl = AppConfig.apiBaseUrl;
    final uri = Uri.parse('$baseUrl$normalizedPath');

    if (queryParameters != null && queryParameters.isNotEmpty) {
      return uri.replace(queryParameters: queryParameters);
    }
    return uri;
  }

  Future<dynamic> _executeRequest(
    Future<http.Response> Function() request, {
    required String method,
    required String path,
    required int maxRetries,
  }) async {
    var attempt = 0;

    while (true) {
      final startedAt = DateTime.now();

      try {
        final response = await request().timeout(_timeout);
        final duration = DateTime.now().difference(startedAt);

        ApiLogger.logResponse(
          method,
          path,
          response.statusCode,
          duration: duration,
        );

        return _handleResponse(response);
      } on ApiException catch (error) {
        ApiLogger.logError(method, path, 'Error ${error.statusCode}: ${error.message}');
        rethrow;
      } on TimeoutException catch (error) {
        if (attempt >= maxRetries) {
          ApiLogger.logError(method, path, 'Timeout: ${error.toString()}');
          rethrow;
        }
        attempt += 1;
        ApiLogger.logRetry(method, path, attempt, maxRetries);
        await Future.delayed(_retryDelay);
      } on http.ClientException catch (error) {
        if (attempt >= maxRetries) {
          ApiLogger.logError(method, path, 'ClientException: ${error.message}');
          rethrow;
        }
        attempt += 1;
        ApiLogger.logRetry(method, path, attempt, maxRetries);
        await Future.delayed(_retryDelay);
      } catch (error) {
        final rawMessage = error.toString();
        if (!_looksLikeConnectionError(rawMessage) || attempt >= maxRetries) {
          ApiLogger.logError(method, path, rawMessage);
          rethrow;
        }
        attempt += 1;
        ApiLogger.logRetry(method, path, attempt, maxRetries);
        await Future.delayed(_retryDelay);
      }
    }
  }

  Future<Map<String, String>> _buildHeaders(Map<String, String>? headers) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('mercapleno_auth_token');

    final map = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...?headers,
    };

    if (token != null && token.isNotEmpty) {
      map['Authorization'] = 'Bearer $token';
    }

    if (AppConfig.apiKey.isNotEmpty) {
      map['x-api-key'] = AppConfig.apiKey;
    }

    return map;
  }

  dynamic _handleResponse(http.Response response) {
    final data = _decodeBody(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }

    throw ApiException(
      message: data is Map<String, dynamic>
          ? (data['message'] ?? 'Error de solicitud')
          : 'Error desconocido',
      statusCode: response.statusCode,
      data: data is Map<String, dynamic> ? data : null,
    );
  }

  dynamic _decodeBody(String body) {
    if (body.trim().isEmpty) {
      return <String, dynamic>{};
    }
    return jsonDecode(body);
  }

  bool _looksLikeConnectionError(String rawMessage) {
    return rawMessage.contains('SocketException') ||
        rawMessage.contains('Connection refused') ||
        rawMessage.contains('Failed host lookup');
  }
}
