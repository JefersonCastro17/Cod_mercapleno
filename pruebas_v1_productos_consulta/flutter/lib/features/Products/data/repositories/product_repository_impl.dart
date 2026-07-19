import 'dart:io';
import '../../domain/entities/product_entity.dart';
import '../../domain/repositories/product_repository.dart';
import '../datasources/product_remote_datasource.dart';

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remoteDataSource;

  ProductRepositoryImpl(this.remoteDataSource);

  @override
  Future<List<ProductEntity>> getProducts(String token) async {
    return await remoteDataSource.fetchProducts(token);
  }

  @override
  Future<bool> saveProduct({
    required String token,
    int? id,
    required Map<String, String> fields,
    File? imageFile,
  }) async {
    return await remoteDataSource.uploadProductData(
      token: token,
      id: id,
      fields: fields,
      imageFile: imageFile,
    );
  }

  @override
  Future<bool> deleteProduct(int id, String token) async {
    return await remoteDataSource.removeProductFromApi(id, token);
  }
}
