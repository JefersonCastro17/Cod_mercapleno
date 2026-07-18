// modulo_G

import '../entities/product.dart';
import '../entities/product_movement.dart';
import '../entities/reference_document.dart';

abstract class ProductsRepository {
  Future<List<Product>> getAllProducts();
  Future<List<ProductMovement>> getAllMovements();
  Future<List<ReferenceDocument>> getReferenceDocuments(String type);
  Future<void> createMovement({
    required String productId,
    required int quantity,
    required String type,
    required String documentId,
    String? note,
  });
}
