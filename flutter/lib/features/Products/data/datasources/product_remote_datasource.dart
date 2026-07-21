import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import '../../domain/entities/product_entity.dart';
import '../models/product_model.dart';
import '../../../../core/config/app_config.dart';

class ProductRemoteDataSource {
  final http.Client client;
  String get baseUrl => "${AppConfig.apiBaseUrl}/api/productos";

  ProductRemoteDataSource(this.client);

  Map<String, String> _buildHeaders(String token) {
    final headers = {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    };
    if (AppConfig.apiKey.isNotEmpty) {
      headers['x-api-key'] = AppConfig.apiKey;
    }
    return headers;
  }

  Future<List<ProductEntity>> fetchProducts(String token) async {
    final response = await client.get(
      Uri.parse(baseUrl),
      headers: _buildHeaders(token),
    );

    if (response.statusCode == 200) {
      final List<dynamic> decodedJson = json.decode(response.body);
      return decodedJson
          .map((item) => ProductModel.fromJson(item))
          .toList()
          .cast<ProductEntity>();
    } else {
      throw Exception('error al obtener los productos');
    }
  }

  Future<bool> uploadProductData({
    required String token,
    int? id,
    required Map<String, String> fields,
    File? imageFile,
  }) async {
    final uri = Uri.parse(id == null ? baseUrl : "$baseUrl/$id");
    final request = http.MultipartRequest(id == null ? 'POST' : 'PUT', uri);

    request.headers['Authorization'] = 'Bearer $token';
    request.headers['Accept'] = 'application/json';
    if (AppConfig.apiKey.isNotEmpty) {
      request.headers['x-api-key'] = AppConfig.apiKey;
    }
    request.fields.addAll(fields);

    if (imageFile != null) {
      // Obtener la extensión del archivo para mapear el MediaType correspondiente
      final path = imageFile.path;
      final ext = path.contains('.') ? path.split('.').last.toLowerCase() : 'jpg';
      String cleanExt = 'jpg';
      if (ext == 'png') {
        cleanExt = 'png';
      } else if (ext == 'webp') {
        cleanExt = 'webp';
      } else if (ext == 'gif') {
        cleanExt = 'gif';
      }

      final bytes = await imageFile.readAsBytes();
      final filename = '${DateTime.now().millisecondsSinceEpoch}.$cleanExt';
      final multipartFile = http.MultipartFile.fromBytes(
        'imagen',
        bytes,
        filename: filename,
        contentType: MediaType('image', cleanExt == 'jpg' ? 'jpeg' : cleanExt),
      );
      try {
        final length = bytes.length;
        print('[ProductRemoteDataSource] Attaching file: filename=$filename, contentType=${multipartFile.contentType}, size=$length');
      } catch (_) {
        print('[ProductRemoteDataSource] Attaching file: filename=$filename, contentType=${multipartFile.contentType}');
      }
      request.files.add(multipartFile);
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return true;
    }

    // Log detailed error for debugging and throw exception with server message.
    final body = response.body;
    // Print to console so it appears in flutter run logs.
    print('[ProductRemoteDataSource] Failed to save product. '
        'Status: ${response.statusCode}, Body: $body');
    throw Exception('HTTP ${response.statusCode}: $body');
  }

  Future<bool> removeProductFromApi(int id, String token) async {
    final response = await client.delete(
      Uri.parse("$baseUrl/$id"),
      headers: _buildHeaders(token),
    );

    final statusCode = response.statusCode;
    if (statusCode == 200 || statusCode == 202 || statusCode == 204) {
      return true;
    }

    print('[ProductRemoteDataSource] Failed to delete product. '
        'Status: $statusCode, Body: ${response.body}');

    String errorMsg = '';
    try {
      final decoded = json.decode(response.body);
      if (decoded is Map && decoded.containsKey('message')) {
        errorMsg = decoded['message'].toString();
      }
    } catch (_) {}

    final hasForeignKeyMsg = errorMsg.contains('Foreign key constraint violated') ||
        errorMsg.contains('foreign key') ||
        response.body.contains('Foreign key constraint violated') ||
        response.body.contains('foreign key');

    if (hasForeignKeyMsg) {
      throw Exception(
        'No se puede eliminar el producto porque está asociado a ventas, pedidos o inventarios registrados. '
        'En su lugar, te sugerimos editar el producto y cambiar su estado a "Agotado".'
      );
    }

    if (errorMsg.isNotEmpty) {
      throw Exception(errorMsg);
    }

    throw Exception('Error del servidor (código $statusCode).');
  }
}
