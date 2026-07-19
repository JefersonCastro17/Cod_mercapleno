import 'dart:io';
import 'package:flutter/foundation.dart';
import '../../domain/entities/product_entity.dart';
import '../../domain/usecases/get_products_usecase.dart';
import '../../domain/usecases/save_product_usecase.dart';
import '../../domain/usecases/delete_product_usecase.dart';
import 'package:http/http.dart' as http;
import '../../data/datasources/product_remote_datasource.dart';
import '../../data/repositories/product_repository_impl.dart';

class ProductController extends ChangeNotifier {
  final GetProductsUseCase _getProductsUseCase;
  final SaveProductUseCase _saveProductUseCase;
  final DeleteProductUseCase _deleteProductUseCase;

  List<ProductEntity> products = [];
  bool isLoading = false;
  String errorMessage = '';

  ProductController({
    GetProductsUseCase? getProductsUseCase,
    SaveProductUseCase? saveProductUseCase,
    DeleteProductUseCase? deleteProductUseCase,
  })  : _getProductsUseCase = getProductsUseCase ??
            GetProductsUseCase(ProductRepositoryImpl(
                ProductRemoteDataSource(http.Client()))),
        _saveProductUseCase = saveProductUseCase ??
            SaveProductUseCase(ProductRepositoryImpl(
                ProductRemoteDataSource(http.Client()))),
        _deleteProductUseCase = deleteProductUseCase ??
            DeleteProductUseCase(ProductRepositoryImpl(
                ProductRemoteDataSource(http.Client())));

  Future<void> loadProducts(String token) async {
    isLoading = true;
    errorMessage = '';
    notifyListeners();
    try {
      products = await _getProductsUseCase.execute(token);
      print("✓ Productos cargados: ${products.length}");
    } catch (e) {
      errorMessage = "Error al cargar productos: $e";
      print("✗ Error al cargar productos: $e");
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> saveProduct({
    required String token,
    int? id,
    required Map<String, String> fields,
    File? imageFile,
  }) async {
    try {
      final success = await _saveProductUseCase.execute(
        token: token,
        id: id,
        fields: fields,
        imageFile: imageFile,
      );
      if (success) {
        await loadProducts(token);
      } else {
        throw Exception("Error al guardar producto");
      }
    } catch (e) {
      print("Error: $e");
      throw Exception("Error al guardar producto: $e");
    }
  }

  Future<void> deleteProduct(int id, String token) async {
    try {
      final success = await _deleteProductUseCase.execute(id, token);
      if (success) {
        products.removeWhere((p) => p.id == id);
        notifyListeners();
      } else {
        throw Exception('El servidor no confirmó la eliminación.');
      }
    } catch (e) {
      String message = e.toString();
      if (message.startsWith('Exception: ')) {
        message = message.substring(11);
      }
      print('[ProductController] Error al eliminar producto: $message');
      errorMessage = message;
      notifyListeners();
      throw Exception(message);
    }
  }
}
