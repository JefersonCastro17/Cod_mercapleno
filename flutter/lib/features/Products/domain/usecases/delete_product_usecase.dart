import '../repositories/product_repository.dart';

class DeleteProductUseCase {
  final ProductRepository repository;

  DeleteProductUseCase(this.repository);

  Future<bool> execute(int id, String token) {
    return repository.deleteProduct(id, token);
  }
}
