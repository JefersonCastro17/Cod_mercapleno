class ProductEntity {
  final int id;
  final String nombre;
  final double precio;
  final String estado;
  final String imagen;
  final String? descripcion;
  final int idCategoria;
  final int idProveedor;

  ProductEntity({
    required this.id,
    required this.nombre,
    required this.precio,
    required this.estado,
    required this.imagen,
    this.descripcion,
    required this.idCategoria,
    required this.idProveedor,
  });

  factory ProductEntity.fromJson(Map<String, dynamic> json) {
    return ProductEntity(
      id: json["id_productos"] ?? 0,
      nombre: json["nombre"] ?? "",
      precio: (json["precio"] is int)
          ? (json["precio"] as int).toDouble()
          : double.tryParse(json["precio"].toString()) ?? 0.0,
      estado: json["estado"] ?? "Desconocido",
      imagen: json["imagen"] ?? "",
      descripcion: json["descripcion"],
      idCategoria: json["id_categoria"] ?? 1,
      idProveedor: json["id_proveedor"] ?? 1,
    );
  }
}
