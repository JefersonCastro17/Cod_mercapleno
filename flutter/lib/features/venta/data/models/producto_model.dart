import 'package:mercapleno_appv1/core/config/app_config.dart';

class ProductoModel {
  final String id;
  final String nombre;
  final String descripcion; 
  final double precio; 
  final String imagen; 
  final String categoria; 
  int cantidad;

  ProductoModel({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.precio,
    required this.imagen,
    required this.categoria,
    this.cantidad = 1,
  });

  double get subtotal => precio * cantidad;
  double get impuesto => subtotal * 0.19; 
  double get totalConImpuesto => subtotal + impuesto;

  String get urlImagenCompleta {
  if (imagen.isEmpty) return 'https://via.placeholder.com/150';
  if (imagen.startsWith('http')) return imagen;
  
  // Limpia espacios y remueve barras o rutas relativas al inicio del string
  String cleanPath = imagen.trim();
  cleanPath = cleanPath.replaceAll(RegExp(r'^(\.\.\/|\.\/|\/)'), '');
  
  // Reemplaza barras invertidas de Windows si el backend las genera de ese modo
  cleanPath = cleanPath.replaceAll('\\', '/');
  
  // Evitar duplicar /uploads/ si ya viene en la ruta
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.replaceFirst('uploads/', '');
  }
  
  return '${AppConfig.apiBaseUrl}/uploads/$cleanPath';
}
  factory ProductoModel.fromJson(Map<String, dynamic> json) {
    String desc = (json['descripcion'] ?? json['desc_producto'] ?? '').toString().trim();
    if (desc.isEmpty) {
      desc = 'Sin descripción disponible';
    }

    return ProductoModel(
      id: (json['id'] ?? json['id_producto'])?.toString() ?? '',
      nombre: json['nombre'] ?? json['nombre_producto'] ?? 'Sin nombre',
      descripcion: desc,
      precio: (json['price'] ?? json['precio'] as num?)?.toDouble() ?? 0.0,
      imagen: json['image'] ?? json['imagen'] ?? '',
      categoria: json['category'] ?? json['categoria'] ?? 'General',
    );
  }

  // Estructura para el DTO que espera NestJS en SalesService
  Map<String, dynamic> toOrderItemJson() => {
    'id': id,               // El backend espera 'id' según OrderItemDto
    'cantidad': cantidad,   // El backend espera 'cantidad'
    // El backend calcula el precio desde la BD, pero puedes enviarlo si es necesario.
  };
}