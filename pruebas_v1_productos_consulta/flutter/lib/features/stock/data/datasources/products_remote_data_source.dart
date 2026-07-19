// modulo_G

import 'package:mercapleno_appv1/core/network/api_client.dart';

class ProductsRemoteDataSource {
  ProductsRemoteDataSource({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<List<Map<String, dynamic>>> fetchProducts() async {
    final response = await _apiClient.get('/api/movimientos/productos');
    if (response is List) {
      return List<Map<String, dynamic>>.from(response);
    } else if (response is Map) {
      if (response.containsKey('data') && response['data'] is List) {
        return List<Map<String, dynamic>>.from(response['data']);
      }
      if (response.containsKey('products') && response['products'] is List) {
        return List<Map<String, dynamic>>.from(response['products']);
      }
    }
    return <Map<String, dynamic>>[];
  }

  Future<List<Map<String, dynamic>>> fetchMovements() async {
    // El backend no provee un endpoint para listar el historial de movimientos
    // (solo para registrarlos y ver stock actual). Retornamos vacío para evitar logs 404.
    return <Map<String, dynamic>>[];
  }

  Future<Map<String, dynamic>> createMovement(Map<String, dynamic> payload) async {
    final response = await _apiClient.post('/api/movimientos/registrar', body: payload);
    return response;
  }

  Future<List<Map<String, dynamic>>> fetchReferenceDocuments(String type) async {
    final response = await _apiClient.get(
      '/api/movimientos/documentos',
      queryParameters: {'tipo_movimiento': type},
    );
    if (response is List) {
      return List<Map<String, dynamic>>.from(response);
    }
    return <Map<String, dynamic>>[];
  }
}
