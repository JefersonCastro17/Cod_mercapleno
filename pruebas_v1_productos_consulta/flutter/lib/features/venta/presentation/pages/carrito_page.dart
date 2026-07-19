import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/venta_provider.dart';
import '../screens/ticket_screen.dart';
import '../../data/models/producto_model.dart';

class CarritoPage extends StatelessWidget {
  const CarritoPage({super.key});

  @override
  Widget build(BuildContext context) {
    final ventaProvider = context.watch<VentaProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resumen de Compra'),
        centerTitle: true,
        actions: [
          if (ventaProvider.cart.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep, color: Colors.red),
              onPressed: () => _confirmarVaciarCarrito(context, ventaProvider),
              tooltip: 'Vaciar carrito',
            )
        ],
      ),
      body: ventaProvider.cart.isEmpty
          ? const Center(
              child: Text(
                'No hay productos en el carrito',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: ventaProvider.cart.length,
                    itemBuilder: (context, index) {
                      final item = ventaProvider.cart[index];
                      return ListTile(
                        leading: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            item.urlImagenCompleta,
                            width: 50,
                            height: 50,
                            cacheWidth: 100, // Optimización de decodificación en memoria para miniatura 50x50
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Icon(Icons.image, size: 40),
                          ),
                        ),
                        title: Text(item.nombre, style: const TextStyle(fontWeight: FontWeight.bold)),
                        // 🟢 SOLUCIÓN 2: Carga de la Descripción en el Carrito integrada
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.descripcion, 
                              maxLines: 1, 
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${item.cantidad} x \$${item.precio.toStringAsFixed(0)}',
                              style: const TextStyle(fontWeight: FontWeight.w500, color: Colors.blueGrey),
                            ),
                          ],
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline, color: Colors.orange),
                              onPressed: () => ventaProvider.updateQuantity(item.id, item.cantidad - 1),
                            ),
                            Text('${item.cantidad}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            IconButton(
                              icon: const Icon(Icons.add_circle_outline, color: Colors.green),
                              onPressed: () => ventaProvider.updateQuantity(item.id, item.cantidad + 1),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, color: Colors.red),
                              onPressed: () => ventaProvider.updateQuantity(item.id, 0),
                              tooltip: 'Eliminar producto',
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                _ResumenPagoSection(ventaProvider: ventaProvider),
              ],
            ),
    );
  }

  void _confirmarVaciarCarrito(BuildContext context, VentaProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('¿Vaciar carrito?'),
        content: const Text('Se eliminarán todos los productos seleccionados.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCELAR')),
          TextButton(
            onPressed: () {
              provider.clearCart();
              Navigator.pop(context);
            },
            child: const Text('VACIAR', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class _ResumenPagoSection extends StatefulWidget {
  final VentaProvider ventaProvider;
  const _ResumenPagoSection({required this.ventaProvider});

  @override
  State<_ResumenPagoSection> createState() => _ResumenPagoSectionState();
}

class _ResumenPagoSectionState extends State<_ResumenPagoSection> {
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    final totals = widget.ventaProvider.totals;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(25)),
        boxShadow: [const BoxShadow(color: Color.fromRGBO(0, 0, 0, 0.05), blurRadius: 10, spreadRadius: 5)],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButtonFormField<String>(
              initialValue: widget.ventaProvider.selectedPaymentMethod,
              decoration: const InputDecoration(
                labelText: 'Método de Pago',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.payment),
              ),
              items: const [
                DropdownMenuItem(value: 'M1', child: Text('Efectivo')),
                DropdownMenuItem(value: 'M2', child: Text('Tarjeta Crédito')),
                DropdownMenuItem(value: 'M3', child: Text('Tarjeta Débito')),
                DropdownMenuItem(value: 'M5', child: Text('Nequi')),
              ],
              onChanged: (val) => widget.ventaProvider.setPaymentMethod(val!),
            ),
            const SizedBox(height: 20),
            _FilaTotal(label: 'Subtotal', value: totals.subTotal),
            _FilaTotal(label: 'IVA (19%)', value: totals.tax),
            const Divider(height: 30),
            _FilaTotal(label: 'TOTAL A PAGAR', value: totals.finalTotal, isBold: true),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF0D47A1), // Azul institucional
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _isProcessing ? null : _ejecutarPago,
                child: _isProcessing
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('CONFIRMAR Y PAGAR', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }

  // 🟢 SOLUCIÓN 3: Redirección Asíncrona Protegida al Ticket sin pérdida de memoria
  Future<void> _ejecutarPago() async {
    if (widget.ventaProvider.cart.isEmpty) return;

    setState(() => _isProcessing = true);
    try {
      // 1. Clonamos los items del carrito ANTES de realizar cualquier operación
      final listaProductosTicket = List<ProductoModel>.from(widget.ventaProvider.cart);
      // final double totalFinal = widget.ventaProvider.totals.finalTotal;
      // final String metodoPagoUsado = widget.ventaProvider.selectedPaymentMethod;

      // 2. Despachamos la venta al backend NestJS
      final result = await widget.ventaProvider.processCheckout();

      if (result != null && context.mounted) {
        // Mapeo seguro del ID de la transacción retornado por NestJS (insertId o id)
        // final String ticketId = (result['id'] ?? result['insertId'] ?? 'N/A').toString();

        // 3. Redireccionamos de inmediato a la pantalla del ticket con la copia preservada
        await Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => TicketScreen(
              ventaResult: result,
              productosComprados: listaProductosTicket,
              totales: widget.ventaProvider.totals,
              paymentMethod: widget.ventaProvider.selectedPaymentMethod,
            ),
          ),
        );

        // 4. Limpiamos el carrito únicamente tras haber garantizado el cambio de vista exitoso
        widget.ventaProvider.clearCart();
      } else if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('El servidor rechazó la transacción. Verifique stock o permisos.')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al procesar checkout: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }
}

class _FilaTotal extends StatelessWidget {
  final String label;
  final double value;
  final bool isBold;
  const _FilaTotal({required this.label, required this.value, this.isBold = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, 
            style: TextStyle(
              fontSize: isBold ? 18 : 14, 
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal
            )
          ),
          Text('\$${value.toStringAsFixed(0)}', 
            style: TextStyle(
              fontSize: isBold ? 18 : 14, 
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: isBold ? const Color(0xFF0D47A1) : Colors.black
            )
          ),
        ],
      ),
    );
  }
}