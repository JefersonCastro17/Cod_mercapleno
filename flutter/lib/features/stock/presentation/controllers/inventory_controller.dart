import 'package:flutter/material.dart';
import '../../domain/entities/product.dart';
import '../../domain/entities/product_movement.dart';
import '../../domain/entities/reference_document.dart';
import '../../domain/repositories/products_repository.dart';

class InventoryController extends ChangeNotifier {
  InventoryController({
    required ProductsRepository repository,
  }) : _repository = repository;

  final ProductsRepository _repository;

  bool _isLoading = false;
  String? _error;

  List<Product> _products = const [];
  List<ProductMovement> _movements = const [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Product> get products => _products;
  List<ProductMovement> get movements => _movements;

  Stream<List<ProductMovement>> get movementsStream =>
      Stream.value(_movements);

  Map<String, int> get currentStock {
    final Map<String, int> map = {};

    for (final p in _products) {
      map[p.id] = p.stock;
    }

    for (final m in _movements) {
      final current = map[m.productId] ?? 0;

      if (m.type == 'in') {
        map[m.productId] = current + m.quantity;
      } else {
        map[m.productId] = current - m.quantity;
      }
    }

    return map;
  }

  List<ProductMovement> getMovementsForProduct(String productId) {
    final list = _movements
        .where((m) => m.productId == productId)
        .toList();

    list.sort(
      (a, b) => b.occurredAt.compareTo(a.occurredAt),
    );

    return list;
  }

  Future<void> loadAll() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final prods = await _repository.getAllProducts();
      final movs = await _repository.getAllMovements();

      _products = prods;
      _movements = movs;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<ReferenceDocument>> getReferenceDocuments(String type) async {
    return await _repository.getReferenceDocuments(type);
  }

  Future<void> createMovement({
    required String productId,
    required int quantity,
    required String type,
    required String documentId,
    String? note,
  }) async {
    await _repository.createMovement(
      productId: productId,
      quantity: quantity,
      type: type,
      documentId: documentId,
      note: note,
    );

    await loadAll();
  }
}