import 'dart:io';
import 'package:path_provider/path_provider.dart';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:mercapleno_appv1/core/config/app_config.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/reportes_entities.dart';
import '../../domain/usecases/obtener_reportes_usecase.dart';

class ReportesController extends ChangeNotifier {
  final ObtenerReportesUseCase useCase;

  ReportesController(this.useCase);

  DashboardDataEntity? data;
  bool isLoading = false;
  String error = '';
  String mesInicio = '';
  String mesFin = '';
  DateTime? lastUpdated;

  Future<void> cargarDatos(String token, VoidCallback onAuthExpired) async {
    isLoading = true;
    error = '';
    notifyListeners();

    try {
      data = await useCase.execute(mesInicio, mesFin, token);
      lastUpdated = DateTime.now();
    } catch (e) {
      if (e.toString().contains('AUTH_EXPIRED')) {
        onAuthExpired();
      } else {
        error = 'Error de conexión con el servidor.';
      }
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// Descarga el PDF del reporte desde el servidor o genera un PDF local si el backend no lo ofrece.
  Future<String?> descargarPdf(String token) async {
    try {
      return await _downloadPdfFromServer(token);
    } on Exception catch (e) {
      final message = e.toString();
      if (message.contains('PDF_NOT_FOUND')) {
        if (data == null) {
          throw Exception('LOCAL_PDF_NO_DATA');
        }
        return await _generateLocalPdf(data!);
      }
      rethrow;
    }
  }

  Future<String> _downloadPdfFromServer(String token) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/sales/reports/pdf');

    final prefs = await SharedPreferences.getInstance();
    final storedToken = prefs.getString('mercapleno_auth_token');

    final headers = <String, String>{
      'Accept': 'application/pdf',
    };

    if (token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    } else if (storedToken != null && storedToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $storedToken';
    }

    if (AppConfig.apiKey.isNotEmpty) {
      headers['x-api-key'] = AppConfig.apiKey;
    }

    final response = await http.get(uri, headers: headers).timeout(const Duration(seconds: 20));

    if (response.statusCode == 401 || response.statusCode == 403) {
      throw Exception('AuthError:${response.statusCode}');
    }

    if (response.statusCode == 404) {
      throw Exception('PDF_NOT_FOUND');
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('HTTP ${response.statusCode}: ${response.reasonPhrase ?? ''}');
    }

    final contentType = response.headers['content-type'] ?? '';
    if (!contentType.contains('pdf')) {
      throw Exception('Respuesta inesperada: content-type=$contentType');
    }

    final bytes = response.bodyBytes;
    final fileName = 'reporte_ventas_${DateTime.now().millisecondsSinceEpoch}';
    return await _savePdf(fileName, bytes);
  }

  Future<String> _generateLocalPdf(DashboardDataEntity dashboardData) async {
    final dateFormat = DateFormat('yyyy-MM-dd HH:mm');
    final formatter = NumberFormat.currency(locale: 'es_CO', symbol: '\$');

    final pdf = pw.Document();

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        build: (context) {
          return [
            pw.Header(level: 0, child: pw.Text('Reporte de Ventas', style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold))),
            pw.Paragraph(text: 'Generado: ${dateFormat.format(DateTime.now())}'),
            pw.SizedBox(height: 12),
            pw.Text('Resumen general', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
            pw.Bullet(text: 'Ingresos totales: ${formatter.format(dashboardData.resumen.dineroTotal)}'),
            pw.Bullet(text: 'Total de ventas: ${dashboardData.resumen.cantidadTotal}'),
            pw.Bullet(text: 'Ticket promedio: ${formatter.format(dashboardData.resumen.promedio)}'),
            pw.SizedBox(height: 16),
            pw.Text('Ventas por mes', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
            pw.SizedBox(height: 8),
            pw.TableHelper.fromTextArray(
              headers: ['Mes', 'Total'],
              data: dashboardData.ventasMes
                  .map((item) => [item.mes, formatter.format(item.total)])
                  .toList(),
              cellAlignment: pw.Alignment.centerLeft,
            ),
            pw.SizedBox(height: 16),
            pw.Text('Top productos', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
            pw.SizedBox(height: 8),
            pw.TableHelper.fromTextArray(
              headers: ['Producto', 'Total vendido'],
              data: dashboardData.topProductos
                  .map((item) => [item.nombre, formatter.format(item.totalVendido)])
                  .toList(),
              cellAlignment: pw.Alignment.centerLeft,
            ),
            pw.SizedBox(height: 16),
            pw.Text('Resumen mensual', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
            pw.SizedBox(height: 8),
            pw.TableHelper.fromTextArray(
              headers: ['Mes', 'Ventas', 'Total'],
              data: dashboardData.resumenMes
                  .map((item) => [item.mes, item.cantidadVentas.toString(), formatter.format(item.totalMes)])
                  .toList(),
              cellAlignment: pw.Alignment.centerLeft,
            ),
          ];
        },
      ),
    );

    final bytes = await pdf.save();
    final fileName = 'reporte_ventas_local_${DateTime.now().millisecondsSinceEpoch}';
    return await _savePdf(fileName, bytes);
  }

  Future<void> compartirPdf(String token) async {
    final path = await descargarPdf(token);
    if (path == null) {
      throw Exception('SHARE_PDF_FAILED');
    }

    await SharePlus.instance.share(
      ShareParams(
        text: 'Reporte de Ventas - Mercapleno',
        files: [XFile(path)],
      ),
    );
  }

  void limpiarFiltros(String token, VoidCallback onAuthExpired) {
    mesInicio = '';
    mesFin = '';
    cargarDatos(token, onAuthExpired);
  }

  Future<String> _savePdf(String fileName, List<int> bytes) async {
    String? savedPath;
    if (Platform.isAndroid) {
      try {
        final downloadDir = Directory('/storage/emulated/0/Download');
        if (await downloadDir.exists()) {
          final file = File('${downloadDir.path}/$fileName.pdf');
          await file.writeAsBytes(bytes);
          savedPath = file.path;
        }
      } catch (e) {
        // Fallback
      }
    }
    if (savedPath == null) {
      final directory = await getExternalStorageDirectory() ?? await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/$fileName.pdf');
      await file.writeAsBytes(bytes);
      savedPath = file.path;
    }
    return savedPath;
  }
}