import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../../domain/entities/reportes_entities.dart';
import '../controllers/reportes_controller.dart';
import 'dart:math';

class EstadisticasPage extends StatefulWidget {
  final ReportesController controller;
  final String token;

  const EstadisticasPage({super.key, required this.controller, required this.token});

  @override
  State<EstadisticasPage> createState() => _EstadisticasPageState();
}

class _EstadisticasPageState extends State<EstadisticasPage> {
  final currencyFormat = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  void _fetchData() {
    widget.controller.cargarDatos(widget.token, () {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Sesión expirada. Redirigiendo...")),
      );
      Navigator.pushReplacementNamed(context, '/login');
    });
  }

  Future<void> _handleDownloadPdf() async {
    try {
      final path = await widget.controller.descargarPdf(widget.token);
      if (path != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('PDF guardado en: $path')));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No se pudo descargar el PDF.')));
      }
    } catch (e) {
      final msg = e.toString();
      if (msg.startsWith('AuthError')) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sesión expirada. Inicia sesión nuevamente.')));
        Navigator.pushReplacementNamed(context, '/login');
        return;
      }
      if (msg.contains('PDF_NOT_FOUND')) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Reporte PDF no disponible en el servidor (404).')));
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error al descargar PDF: $msg')));
    }
  }

  Future<void> _handlePrintPdf() async {
    try {
      final path = await widget.controller.descargarPdf(widget.token);
      if (path != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('PDF listo para imprimir: $path')));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No se pudo preparar el PDF para imprimir.')));
      }
    } catch (e) {
      final msg = e.toString();
      if (msg.startsWith('AuthError')) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sesión expirada. Inicia sesión nuevamente.')));
        Navigator.pushReplacementNamed(context, '/login');
        return;
      }
      if (msg.contains('PDF_NOT_FOUND')) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Reporte PDF no disponible en el servidor (404).')));
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error al preparar PDF: $msg')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = widget.controller;

    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        if (controller.isLoading) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        if (controller.data == null) {
          return Scaffold(body: Center(child: Text(controller.error.isNotEmpty ? controller.error : "Sin datos")));
        }

        final data = controller.data!;
        
        // Cálculos correspondientes a los `useMemo` de React:
        final sortedVentas = List<VentaMesEntity>.from(data.ventasMes)
          ..sort((a, b) => a.mes.compareTo(b.mes));
        
        final double crecimiento = sortedVentas.length >= 2 && sortedVentas[sortedVentas.length - 2].total > 0
            ? ((sortedVentas.last.total - sortedVentas[sortedVentas.length - 2].total) / sortedVentas[sortedVentas.length - 2].total) * 100
            : 0.0;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Estadísticas de Ventas'),
            actions: [
              IconButton(onPressed: _fetchData, icon: const Icon(Icons.refresh), tooltip: 'Actualizar'),
              IconButton(onPressed: _handlePrintPdf, icon: const Icon(Icons.print), tooltip: 'Imprimir PDF'),
              IconButton(onPressed: _handleDownloadPdf, icon: const Icon(Icons.download), tooltip: 'Descargar PDF'),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () async => _fetchData(),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Panel de analítica", style: Theme.of(context).textTheme.bodySmall),
                  Text("Estadísticas de ventas", style: Theme.of(context).textTheme.headlineMedium),
                  const SizedBox(height: 8),

                  // FILTROS (mes inicio / mes fin)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.calendar_month),
                          label: Text(controller.mesInicio.isEmpty ? 'Desde' : controller.mesInicio),
                          onPressed: () async {
                            final d = await showDatePicker(
                              context: context,
                              initialDate: DateTime.now(),
                              firstDate: DateTime(2000),
                              lastDate: DateTime.now(),
                              fieldLabelText: 'Selecciona mes de inicio',
                            );
                            if (d != null) {
                              controller.mesInicio = DateFormat('yyyy-MM').format(d);
                              controller.cargarDatos(widget.token, () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text("Sesión expirada. Redirigiendo...")),
                                );
                                Navigator.pushReplacementNamed(context, '/login');
                              });
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.calendar_month_outlined),
                          label: Text(controller.mesFin.isEmpty ? 'Hasta' : controller.mesFin),
                          onPressed: () async {
                            final d = await showDatePicker(
                              context: context,
                              initialDate: DateTime.now(),
                              firstDate: DateTime(2000),
                              lastDate: DateTime.now(),
                              fieldLabelText: 'Selecciona mes final',
                            );
                            if (d != null) {
                              controller.mesFin = DateFormat('yyyy-MM').format(d);
                              controller.cargarDatos(widget.token, () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text("Sesión expirada. Redirigiendo...")),
                                );
                                Navigator.pushReplacementNamed(context, '/login');
                              });
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        tooltip: 'Limpiar filtros',
                        onPressed: () => controller.limpiarFiltros(widget.token, () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Sesión expirada. Redirigiendo...")),
                          );
                          Navigator.pushReplacementNamed(context, '/login');
                        }),
                        icon: const Icon(Icons.clear),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  
                  // GRID DE KPIs (Tarjetas superiores)
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.4,
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      _buildKpiCard("Ingresos totales", currencyFormat.format(data.resumen.dineroTotal)),
                      _buildKpiCard("Total ventas", "${data.resumen.cantidadTotal}"),
                      _buildKpiCard("Ticket promedio", currencyFormat.format(data.resumen.promedio)),
                      _buildKpiCard("Crecimiento", "${crecimiento.toStringAsFixed(1)}%"),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // GRÁFICO DE ÁREA (Evolución de ventas)
                  const Text("Ventas por mes", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 200,
                    child: LineChart(
                      LineChartData(
                        gridData: FlGridData(show: true, drawVerticalLine: false),
                        titlesData: FlTitlesData(topTitles: AxisTitles(), rightTitles: AxisTitles()),
                        borderData: FlBorderData(show: false),
                        lineBarsData: [
                          LineChartBarData(
                            spots: sortedVentas.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.total.toDouble())).toList(),
                            isCurved: true,
                            color: Colors.blue,
                            barWidth: 4,
                            belowBarData: BarAreaData(show: true, color: const Color.fromRGBO(33, 150, 243, 0.2)),
                          )
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // GRÁFICO Y MIX DE TOP PRODUCTOS
                  const Text("Mix de productos", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 220,
                    child: Row(
                      children: [
                        Expanded(
                          child: Builder(builder: (context) {
                            final total = data.topProductos.fold<int>(0, (a, b) => a + b.totalVendido);
                            if (data.topProductos.isEmpty) {
                              return const Center(child: Text('Sin datos'));
                            }
                            // Pie usando fl_chart
                            final sections = data.topProductos.take(6).map((p) {
                              final value = p.totalVendido.toDouble();
                              final color = Colors.primaries[Random(p.nombre.hashCode).nextInt(Colors.primaries.length)];
                              return PieChartSectionData(
                                value: value,
                                color: color,
                                title: '${((value / (total == 0 ? 1 : total)) * 100).toStringAsFixed(0)}%',
                                titleStyle: const TextStyle(fontSize: 10, color: Colors.white),
                                radius: 50,
                              );
                            }).toList();

                            return PieChart(
                              PieChartData(
                                sections: sections,
                                sectionsSpace: 2,
                                centerSpaceRadius: 28,
                              ),
                            );
                          }),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Builder(builder: (context) {
                            if (data.topProductos.isEmpty) return const Center(child: Text('Sin datos'));
                            final bars = data.topProductos.take(6).toList();
                            return BarChart(
                              BarChartData(
                                alignment: BarChartAlignment.spaceAround,
                                titlesData: FlTitlesData(show: true, topTitles: AxisTitles(), rightTitles: AxisTitles()),
                                borderData: FlBorderData(show: false),
                                barGroups: bars.asMap().entries.map((e) {
                                  final idx = e.key;
                                  final item = e.value;
                                  return BarChartGroupData(
                                    x: idx,
                                    barRods: [BarChartRodData(toY: item.totalVendido.toDouble(), color: Colors.orange)],
                                  );
                                }).toList(),
                              ),
                            );
                          }),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // TABLA DE RESUMEN MENSUAL
                  const Text("Resumen mensual", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  DataTable(
                    columns: const [
                      DataColumn(label: Text('Mes')),
                      DataColumn(label: Text('Ventas')),
                      DataColumn(label: Text('Total')),
                    ],
                    rows: data.resumenMes.map((m) => DataRow(cells: [
                      DataCell(Text(m.mes)),
                      DataCell(Text("${m.cantidadVentas}")),
                      DataCell(Text(currencyFormat.format(m.totalMes))),
                    ])).toList(),
                  )
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildKpiCard(String title, String value) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}