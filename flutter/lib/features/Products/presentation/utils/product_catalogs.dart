/// Catálogos estáticos de categorías y proveedores.
/// Los IDs deben coincidir con los del backend.
class ProductCatalogs {
  ProductCatalogs._();

  static const Map<int, String> categorias = {
    1: 'Abarrotes',
    2: 'Lácteos',
    3: 'Cárnicos',
    4: 'Bebidas',
    5: 'Panadería',
    6: 'Frutas y Verduras',
    7: 'Aseo',
    8: 'Higiene Personal',
    9: 'Snacks',
    10: 'Congelados',
  };

  static const Map<int, String> proveedores = {
    1: 'Luis González',
    2: 'María Rojas',
    3: 'Pedro Martínez',
    4: 'Ana Pérez',
    5: 'Carlos Ruiz',
    6: 'Jorge Moreno',
    7: 'Tatiana Vega',
    8: 'Camilo Ramírez',
    9: 'Paola Jiménez',
    10: 'Andrés Castro',
  };

  /// Obtiene el nombre de la categoría por ID, o 'Sin categoría' si no existe.
  static String categoriaNombre(int id) =>
      categorias[id] ?? 'Sin categoría';

  /// Obtiene el nombre del proveedor por ID, o 'Sin proveedor' si no existe.
  static String proveedorNombre(int id) =>
      proveedores[id] ?? 'Sin proveedor';
}
