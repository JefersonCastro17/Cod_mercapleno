import 'dart:io';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import '../../domain/entities/venta_totals.dart';
import '../../data/models/producto_model.dart';

class TicketScreen extends StatefulWidget {
  final Map<String, dynamic> ventaResult;
  final List<ProductoModel> productosComprados;
  final VentaTotals totales;
  final String paymentMethod;

  const TicketScreen({
    super.key,
    required this.ventaResult,
    required this.productosComprados,
    required this.totales,
    required this.paymentMethod,
  });

  @override
  State<TicketScreen> createState() => _TicketScreenState();
}

class _TicketScreenState extends State<TicketScreen> {
  bool _isGeneratingPdf = false;

  Future<void> _descargarYCompartirPdf() async {
    setState(() {
      _isGeneratingPdf = true;
    });

    try {
      final currencyFormat = NumberFormat.currency(
        locale: 'es_CO', 
        symbol: '\$', 
        decimalDigits: 0
      );
      final fechaStr = DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now());
      final ticketId = (widget.ventaResult['id'] ?? widget.ventaResult['ticketId'] ?? 'N/A').toString();
      final cliente = widget.ventaResult['cliente'] ?? 'Consumidor Final';
      final paymentMethod = _paymentMethodLabel(widget.paymentMethod);

      final pdf = pw.Document();

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(32),
          build: (pw.Context context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Center(
                  child: pw.Column(
                    children: [
                      pw.Text(
                        'MERCAPLENO',
                        style: pw.TextStyle(
                          fontSize: 24,
                          fontWeight: pw.FontWeight.bold,
                        ),
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text(
                        'COMPROBANTE DE VENTA',
                        style: pw.TextStyle(
                          fontSize: 14,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.grey700,
                        ),
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text(
                        'Ticket #: $ticketId',
                        style: pw.TextStyle(
                          fontSize: 12,
                          fontWeight: pw.FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                pw.Divider(thickness: 1),
                pw.SizedBox(height: 8),

                // Info Comercio y Cliente
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Establecimiento:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11)),
                    pw.Text('Mercapleno', style: const pw.TextStyle(fontSize: 11)),
                  ],
                ),
                pw.SizedBox(height: 4),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Fecha:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11)),
                    pw.Text(fechaStr, style: const pw.TextStyle(fontSize: 11)),
                  ],
                ),
                pw.SizedBox(height: 4),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Cliente:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11)),
                    pw.Text(cliente, style: const pw.TextStyle(fontSize: 11)),
                  ],
                ),
                pw.SizedBox(height: 4),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Método de Pago:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11)),
                    pw.Text(paymentMethod, style: const pw.TextStyle(fontSize: 11)),
                  ],
                ),
                pw.SizedBox(height: 16),

                // Título de la tabla de productos
                pw.Text(
                  'DETALLE DE PRODUCTOS',
                  style: pw.TextStyle(
                    fontSize: 12,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColors.grey700,
                  ),
                ),
                pw.SizedBox(height: 8),
                pw.Divider(thickness: 0.5),

                // Lista de productos
                ...widget.productosComprados.map((item) {
                  return pw.Padding(
                    padding: const pw.EdgeInsets.symmetric(vertical: 4),
                    child: pw.Row(
                      children: [
                        pw.SizedBox(
                          width: 40,
                          child: pw.Text('${item.cantidad}x', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11)),
                        ),
                        pw.Expanded(
                          child: pw.Text(item.nombre, style: const pw.TextStyle(fontSize: 11)),
                        ),
                        pw.Text(
                          currencyFormat.format(item.subtotal),
                          style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11),
                        ),
                      ],
                    ),
                  );
                }).toList(),

                pw.Divider(thickness: 1),
                pw.SizedBox(height: 8),

                // Totales
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Subtotal:', style: const pw.TextStyle(fontSize: 11)),
                    pw.Text(currencyFormat.format(widget.totales.subTotal), style: const pw.TextStyle(fontSize: 11)),
                  ],
                ),
                pw.SizedBox(height: 4),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Impuestos (19% IVA):', style: const pw.TextStyle(fontSize: 11)),
                    pw.Text(currencyFormat.format(widget.totales.tax), style: const pw.TextStyle(fontSize: 11)),
                  ],
                ),
                pw.SizedBox(height: 8),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('TOTAL FINAL:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
                    pw.Text(
                      currencyFormat.format(widget.totales.finalTotal),
                      style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 16, color: PdfColors.blue900),
                    ),
                  ],
                ),

                pw.SizedBox(height: 32),
                pw.Center(
                  child: pw.Column(
                    children: [
                      pw.Text(
                        'Gracias por su compra en Mercapleno',
                        style: pw.TextStyle(fontStyle: pw.FontStyle.italic, fontSize: 10, color: PdfColors.grey700),
                      ),
                      pw.SizedBox(height: 2),
                      pw.Text(
                        'Este es un comprobante electrónico válido.',
                        style: pw.TextStyle(fontSize: 9, color: PdfColors.grey600),
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      );

      final bytes = await pdf.save();
      final fileName = 'ticket_compra_${ticketId}_${DateTime.now().millisecondsSinceEpoch}';
      final path = await _savePdf(fileName, bytes);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('PDF guardado en: $path')),
        );

        // Compartir el PDF de manera inmediata
        await SharePlus.instance.share(
          ShareParams(
            text: 'Comprobante de Venta #$ticketId - Mercapleno',
            files: [XFile(path)],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al generar PDF: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isGeneratingPdf = false;
        });
      }
    }
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
  String _paymentMethodLabel(String rawMethod) {
    switch (rawMethod.toUpperCase()) {
      case 'M1':
        return 'Efectivo';
      case 'M2':
        return 'Tarjeta Crédito';
      case 'M3':
        return 'Tarjeta Débito';
      case 'M4':
        return 'Transferencia';
      case 'M5':
        return 'Nequi';
      case 'M6':
        return 'Daviplata';
      default:
        return rawMethod.isNotEmpty ? rawMethod : 'Desconocido';
    }
  }
  @override
  Widget build(BuildContext context) {
    // Formato de moneda localizado para Colombia (igual que la Web)
    final currencyFormat = NumberFormat.currency(
      locale: 'es_CO', 
      symbol: '\$', 
      decimalDigits: 0
    );
    
    // Fecha actual para el comprobante
    final fechaStr = DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now());
    final paymentMethod = _paymentMethodLabel(widget.paymentMethod);

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Comprobante de Venta'),
        centerTitle: true,
        elevation: 0,
        actions: [
          _isGeneratingPdf
              ? const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    ),
                  ),
                )
              : IconButton(
                  icon: const Icon(Icons.download),
                  tooltip: 'Descargar PDF',
                  onPressed: _descargarYCompartirPdf,
                ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Card que simula el papel del ticket
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(2)),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                child: Column(
                  children: [
                    // Encabezado de Éxito
                    const Icon(Icons.check_circle, color: Colors.green, size: 70),
                    const SizedBox(height: 10),
                    const Text(
                      '¡VENTA EXITOSA!',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      'Ticket #: ${widget.ventaResult['id'] ?? widget.ventaResult['ticketId'] ?? 'N/A'}',
                      style: const TextStyle(color: Colors.blueGrey, fontWeight: FontWeight.w600),
                    ),
                    const Divider(height: 40, thickness: 1.5),

                    // Información de Comercio y Cliente (Igual a la Web)
                    _buildHeaderInfo('MERCAPLENO', fechaStr),
                    const SizedBox(height: 10),
                    _buildHeaderInfo(
                      'CLIENTE:', 
                      widget.ventaResult['cliente'] ?? 'Consumidor Final',
                      isBold: false
                    ),
                    const SizedBox(height: 4),
                    _buildHeaderInfo(
                      'MÉTODO DE PAGO:',
                      paymentMethod,
                      isBold: false,
                    ),
                    const SizedBox(height: 30),

                    // Título de la tabla de productos
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'DETALLE DE PRODUCTOS',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
                      ),
                    ),
                    const SizedBox(height: 10),
                    
                    // Listado de productos (Réplica de la tabla Web)
                    ...widget.productosComprados.map((item) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 30,
                            child: Text('${item.cantidad}x', style: const TextStyle(fontWeight: FontWeight.w500)),
                          ),
                          Expanded(
                            child: Text(
                              item.nombre,
                              style: const TextStyle(fontSize: 14),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            currencyFormat.format(item.subtotal),
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    )),

                    const Divider(height: 40, thickness: 1.5),

                    // Bloque de Totales (Réplica de TotalsSummary.jsx)
                    _buildTotalRow('Subtotal:', currencyFormat.format(widget.totales.subTotal)),
                    _buildTotalRow('Impuestos (19% IVA):', currencyFormat.format(widget.totales.tax)),
                    const SizedBox(height: 10),
                    _buildTotalRow(
                      'TOTAL FINAL:', 
                      currencyFormat.format(widget.totales.finalTotal), 
                      isBold: true,
                      large: true
                    ),
                    
                    const SizedBox(height: 40),
                    const Text(
                      'Gracias por su compra en Mercapleno',
                      style: TextStyle(fontStyle: FontStyle.italic, color: Colors.grey),
                    ),
                    const Text(
                      'Este es un comprobante electrónico válido.',
                      style: TextStyle(fontSize: 10, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 30),

            // Botón para Descargar PDF
            SizedBox(
              width: double.infinity,
              height: 50,
              child: _isGeneratingPdf
                  ? const Center(child: CircularProgressIndicator())
                  : OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.blue[900]!, width: 2),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        foregroundColor: Colors.blue[900],
                      ),
                      icon: const Icon(Icons.download),
                      label: const Text(
                        'DESCARGAR TICKET PDF',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      onPressed: _descargarYCompartirPdf,
                    ),
            ),
            const SizedBox(height: 15),
            
            // Botón de salida
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[900],
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))
                ),
                onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                child: const Text(
                  'VOLVER AL INICIO',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // Widget auxiliar para filas de encabezado (Empresa, Cliente, Fecha)
  Widget _buildHeaderInfo(String left, String right, {bool isBold = true}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(left, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal, fontSize: 13)),
        Text(right, style: const TextStyle(fontSize: 13)),
      ],
    );
  }

  // Widget auxiliar para las filas de totales
  Widget _buildTotalRow(String label, String value, {bool isBold = false, bool large = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label, 
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal, 
              fontSize: large ? 18 : 14
            )
          ),
          Text(
            value, 
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal, 
              fontSize: large ? 20 : 14,
              color: large ? Colors.blue[900] : Colors.black
            )
          ),
        ],
      ),
    );
  }
}