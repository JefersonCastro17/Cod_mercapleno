import 'package:flutter/material.dart';
import '../../data/models/producto_model.dart';
import '../../data/repositories/venta_repository_impl.dart';
import '../../domain/entities/venta_totals.dart';

class VentaProvider extends ChangeNotifier {
  final VentaRepositoryImpl _repository = VentaRepositoryImpl();

  List<ProductoModel> _productos = [];
  bool _isLoading = false;
  String _error = '';
  
  String _searchQuery = '';
  String _selectedCategory = 'Todo';
  double? _minPrice;
  double? _maxPrice;

  final List<ProductoModel> _cart = [];
  String _selectedPaymentMethod = 'M1';

  List<ProductoModel> get productos => _productos;
  List<ProductoModel> get cart => _cart;
  bool get isLoading => _isLoading;
  String get error => _error;
  String get selectedPaymentMethod => _selectedPaymentMethod;
  VentaTotals get totals => VentaTotals.calculate(_cart);

  Future<void> loadCatalogo() async {
    _isLoading = true;
    _error = '';
    notifyListeners();
    try {
      _productos = await _repository.getCatalogo(
        search: _searchQuery,
        category: _selectedCategory,
        precioMin: _minPrice,
        precioMax: _maxPrice,
      );
    } catch (e) {
      _error = 'Error de conexión: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void updateFilters({String? search, String? category, double? min, double? max}) {
    if (search != null) _searchQuery = search;
    if (category != null) _selectedCategory = category;
    _minPrice = min;
    _maxPrice = max;
    loadCatalogo();
  }

  void addToCart(ProductoModel producto) {
    final index = _cart.indexWhere((item) => item.id == producto.id);
    if (index != -1) {
      _cart[index].cantidad++;
    } else {
      _cart.add(ProductoModel(
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        imagen: producto.imagen,
        categoria: producto.categoria,
        cantidad: 1,
      ));
    }
    notifyListeners();
  }

  void updateQuantity(String id, int newQuantity) {
    final index = _cart.indexWhere((item) => item.id == id);
    if (index != -1) {
      if (newQuantity <= 0) {
        _cart.removeAt(index);
      } else {
        _cart[index].cantidad = newQuantity;
      }
      notifyListeners();
    }
  }

  void clearCart() {
    _cart.clear();
    notifyListeners();
  }

  void setPaymentMethod(String methodId) {
    _selectedPaymentMethod = methodId;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> processCheckout() async {
    if (_cart.isEmpty) return null;
    try {
      final result = await _repository.registrarVenta(
        items: _cart,
        total: totals.finalTotal,
        idMetodo: _selectedPaymentMethod,
      );
      return result; 
    } catch (e) {
      _error = 'Error al procesar el pago: $e';
      notifyListeners();
      return null;
    }
  }
}