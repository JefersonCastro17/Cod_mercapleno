// modulo_G

class Product {
  final String id;
  final String name;
  final String? sku;
  final int stock;
  final bool isLowStock;
  final String? imagen;

  const Product({
    required this.id,
    required this.name,
    this.sku,
    this.stock = 0,
    this.isLowStock = false,
    this.imagen,
  });
}
