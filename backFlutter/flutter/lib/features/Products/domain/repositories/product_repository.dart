import 'dart:io';
import '../entities/product_entity.dart';

abstract class ProductRepository {
  Future<List<ProductEntity>> getProducts(String token);
  Future<bool> saveProduct({
    required String token,
    int? id,
    required Map<String, String> fields,
    File? imageFile,
  });
  Future<bool> deleteProduct(int id, String token);
}
