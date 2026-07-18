import '../../domain/entities/reportes_entities.dart';
import '../../domain/repositories/reportes_repository.dart';
import '../datasources/reportes_remote_datasource.dart';
import '../models/reportes_models.dart';

class ReportesRepositoryImpl implements ReportesRepository {
  final ReportesRemoteDataSource dataSource;

  ReportesRepositoryImpl(this.dataSource);

  @override
  Future<DashboardDataEntity> getDashboardData(String mesInicio, String mesFin, String token) async {
    final rawData = await dataSource.fetchDashboardRaw(mesInicio, mesFin, token);

    return DashboardDataEntity(
      resumen: ResumenModel.fromJson(rawData['resumen']),
      ventasMes: (rawData['ventasMes'] as List).map((x) => VentaMesModel.fromJson(x)).toList(),
      topProductos: (rawData['topProductos'] as List).map((x) => TopProductoModel.fromJson(x)).toList(),
      resumenMes: (rawData['resumenMes'] as List).map((x) => ResumenMesModel.fromJson(x)).toList(),
    );
  }
}