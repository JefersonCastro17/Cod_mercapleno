import 'package:mercapleno_appv1/core/network/api_client.dart';

class ReportesRemoteDataSource {
  final ApiClient apiClient;

  ReportesRemoteDataSource(this.apiClient);

  Future<Map<String, dynamic>> fetchDashboardRaw(String mesInicio, String mesFin, String token) async {
    final headers = {'Authorization': 'Bearer $token'};
    final queryParameters = <String, String>{};
    if (mesInicio.isNotEmpty) queryParameters['inicio'] = mesInicio;
    if (mesFin.isNotEmpty) queryParameters['fin'] = mesFin;

    final results = await Future.wait([
      apiClient.get('/api/sales/reports/resumen', headers: headers),
      apiClient.get('/api/sales/reports/ventas-mes', queryParameters: queryParameters, headers: headers),
      apiClient.get('/api/sales/reports/top-productos', headers: headers),
      apiClient.get('/api/sales/reports/resumen-mes', headers: headers),
    ]);

    // El ApiClient ya gestiona errores de red y autenticación.

    return {
      'resumen': results[0],
      'ventasMes': results[1] as List,
      'topProductos': results[2] as List,
      'resumenMes': results[3] as List,
    };
  }
}