import '../../domain/entities/reportes_entities.dart';

num _parseNum(dynamic value) {
  if (value == null) return 0;
  if (value is num) return value;
  final sanitized = value.toString().replaceAll(',', '');
  return num.tryParse(sanitized) ?? 0;
}

int _parseInt(dynamic value) => _parseNum(value).toInt();

class ResumenModel extends ResumenEntity {
  ResumenModel({required super.dineroTotal, required super.cantidadTotal, required super.promedio});

  factory ResumenModel.fromJson(Map<String, dynamic> json) => ResumenModel(
        dineroTotal: _parseInt(json['dinero_total']),
        cantidadTotal: _parseInt(json['total_ventas']),
        promedio: _parseInt(json['promedio']),
      );
}

class VentaMesModel extends VentaMesEntity {
  VentaMesModel({required super.mes, required super.total});

  factory VentaMesModel.fromJson(Map<String, dynamic> json) => VentaMesModel(
        mes: json['mes'] ?? '',
      total: _parseInt(json['total']),
      );
}

class TopProductoModel extends TopProductoEntity {
  TopProductoModel({required super.nombre, required super.totalVendido});

  factory TopProductoModel.fromJson(Map<String, dynamic> json) => TopProductoModel(
        nombre: json['nombre'] ?? '',
      totalVendido: _parseInt(json['total_vendido']),
      );
}

class ResumenMesModel extends ResumenMesEntity {
  ResumenMesModel({required super.mes, required super.cantidadVentas, required super.totalMes});

  factory ResumenMesModel.fromJson(Map<String, dynamic> json) => ResumenMesModel(
        mes: json['mes'] ?? '',
      cantidadVentas: _parseInt(json['cantidad_ventas']),
      totalMes: _parseInt(json['total_mes']),
      );
}