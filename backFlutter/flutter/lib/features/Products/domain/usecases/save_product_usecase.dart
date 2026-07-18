import 'dart:io';
import '../repositories/product_repository.dart';

class SaveProductUseCase {
  final ProductRepository repository;

  SaveProductUseCase(this.repository);

  Future<bool> execute({
    required String token,
    int? id,
    required Map<String, String> fields,
    File? imageFile,
  }) {
    return repository.saveProduct(
      token: token,
      id: id,
      fields: fields,
      imageFile: imageFile,
    );
  }
}
