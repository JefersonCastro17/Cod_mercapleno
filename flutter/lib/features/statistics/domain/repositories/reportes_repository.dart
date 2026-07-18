import '../entities/reportes_entities.dart';

abstract class ReportesRepository {
  Future<DashboardDataEntity> getDashboardData(String mesInicio, String mesFin, String token);
}