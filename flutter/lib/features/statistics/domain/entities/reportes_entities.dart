class ResumenEntity {
  final int dineroTotal;
  final int cantidadTotal;
  final int promedio;

  ResumenEntity({
    required this.dineroTotal,
    required this.cantidadTotal,
    required this.promedio
  });
}

class VentaMesEntity {
  final String mes;
  final int total;

  VentaMesEntity({
    required this.mes,
    required this.total
  });
}

class TopProductoEntity {
  final String nombre;
  final int totalVendido;

  TopProductoEntity({
    required this.nombre,
    required this.totalVendido
  });
}

class ResumenMesEntity {
  final String mes;
  final int cantidadVentas;
  final int totalMes;

  ResumenMesEntity({
    required this.mes,
    required this.cantidadVentas,
    required this.totalMes
  });
}

class DashboardDataEntity {
  final ResumenEntity resumen;
  final List<VentaMesEntity> ventasMes;
  final List<TopProductoEntity> topProductos;
  final List<ResumenMesEntity> resumenMes;

  DashboardDataEntity({
    required this.resumen,
    required this.ventasMes,
    required this.topProductos,
    required this.resumenMes,
  });
}