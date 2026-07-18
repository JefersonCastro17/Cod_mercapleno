import 'package:mercapleno_appv1/core/config/app_config.dart';
import 'package:mercapleno_appv1/core/network/api_client.dart';
import 'package:mercapleno_appv1/features/venta/data/models/producto_model.dart';

class VentaRepositoryImpl {
  final ApiClient _apiClient = ApiClient();

  Future<List<ProductoModel>> getCatalogo({
    String? search,
    String? category,
    double? precioMin,
    double? precioMax,
  }) async {
    final Map<String, String> params = {};
    if (search != null && search.isNotEmpty) params['search'] = search;
    
    if (category != null && category.toLowerCase() != 'todas' && category.toLowerCase() != 'todo') {
      params['category'] = category;
    }
    
    if (precioMin != null) params['precioMin'] = precioMin.toString();
    if (precioMax != null) params['precioMax'] = precioMax.toString();

    try {
      final response = await _apiClient.get(AppConfig.getProductsEndpoint, queryParameters: params);
      List<dynamic> data = [];
      if (response is List) {
        data = response;
      } else if (response is Map) {
        data = response['products'] ?? response['data'] ?? [];
      }
      return data.map((json) => ProductoModel.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Error de conexión con el servidor.');
    }
  }

  Future<Map<String, dynamic>> registrarVenta({
    required List<ProductoModel> items,
    required double total,
    required String idMetodo,
  }) async {
    try {
      final body = {
        'items': items.map((i) => i.toOrderItemJson()).toList(),
        'total': total,
        'id_metodo': idMetodo, // Ejemplo: 'M1'
      };

      final response = await _apiClient.post(AppConfig.createOrderEndpoint, body: body);
      return response;
    } catch (e) {
      throw Exception('No se pudo procesar la venta: $e');
    }
  }
}