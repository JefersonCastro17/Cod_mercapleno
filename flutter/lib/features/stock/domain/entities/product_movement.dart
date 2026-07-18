// modulo_G

class ProductMovement {
  final String id;
  final String productId;
  final int quantity; // positive for entradas, negative for salidas
  final String type; // 'in' or 'out'
  final DateTime occurredAt;
  final String? note;

  const ProductMovement({
    required this.id,
    required this.productId,
    required this.quantity,
    required this.type,
    required this.occurredAt,
    this.note,
  });
}
