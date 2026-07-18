// modulo_G

import '../../domain/entities/product_movement.dart';

class ProductMovementModel extends ProductMovement {
  const ProductMovementModel({
    required String id,
    required String productId,
    required int quantity,
    required String type,
    required DateTime occurredAt,
    String? note,
  }) : super(
          id: id,
          productId: productId,
          quantity: quantity,
          type: type,
          occurredAt: occurredAt,
          note: note,
        );

  factory ProductMovementModel.fromJson(Map<String, dynamic> json) {
    return ProductMovementModel(
      id: json['id'].toString(),
      productId: json['productId'].toString(),
      quantity: (json['quantity'] as num).toInt(),
      type: json['type'] as String? ?? 'in',
      occurredAt: DateTime.parse(json['occurredAt'] as String? ?? DateTime.now().toIso8601String()),
      note: json['note'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'productId': productId,
        'quantity': quantity,
        'type': type,
        'occurredAt': occurredAt.toIso8601String(),
        'note': note,
      };
}
