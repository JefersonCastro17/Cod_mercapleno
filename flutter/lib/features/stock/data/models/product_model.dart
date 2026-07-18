// modulo_G

import '../../domain/entities/product.dart';

class ProductModel extends Product {
  const ProductModel({
    required super.id,
    required super.name,
    super.sku,
    super.stock,
    super.isLowStock,
    super.imagen,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final parsedStock = (json['stock'] as num?)?.toInt() ?? 0;
    return ProductModel(
      id: json['id'].toString(),
      name: (json['nombre'] ?? json['name'] ?? '') as String,
      sku: json['sku'] as String?,
      stock: parsedStock,
      isLowStock: (json['isLowStock'] as bool?) ?? (parsedStock <= 5),
      imagen: json['imagen'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'sku': sku,
        'stock': stock,
        'isLowStock': isLowStock,
        'imagen': imagen,
      };
}
