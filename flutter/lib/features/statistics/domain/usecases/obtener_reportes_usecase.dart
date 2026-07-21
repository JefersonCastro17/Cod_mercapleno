import '../entities/reportes_entities.dart';
import '../repositories/reportes_repository.dart';

class ObtenerReportesUseCase {
  final ReportesRepository repository;

  ObtenerReportesUseCase(this.repository);

  Future<DashboardDataEntity> execute(String inicio, String fin, String token) {
    return repository.getDashboardData(inicio, fin, token);
  }
}