// movements_page.dart

import 'package:flutter/material.dart';
import '../controllers/inventory_controller.dart';
import '../../domain/entities/product.dart';
import '../../domain/entities/product_movement.dart';

// Convertido a StatefulWidget para poder llamar loadAll() al entrar
// y mostrar datos frescos siempre que se abra el historial.
class MovementsPage extends StatefulWidget {
  const MovementsPage({
    super.key,
    required this.controller,
    this.productId,
    this.productName,
  });

  final InventoryController controller;
  final String? productId;
  final String? productName;

  @override
  State<MovementsPage> createState() => _MovementsPageState();
}

class _MovementsPageState extends State<MovementsPage> {
  @override
  void initState() {
    super.initState();
    // Recargar movimientos cada vez que se abre la página.
    // Esto garantiza datos frescos aunque el controller ya estuviera cargado.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      widget.controller.loadAll();
    });
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.productName != null
        ? 'Historial - ${widget.productName}'
        : 'Historial de movimientos';

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        backgroundColor: const Color(0xFF0B4A8B),
        foregroundColor: Colors.white,
        actions: [
          // Botón de recarga manual por si acaso
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Recargar',
            onPressed: () => widget.controller.loadAll(),
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: widget.controller,
        builder: (context, _) {
          // Mostrar spinner mientras carga
          if (widget.controller.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (widget.controller.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline_rounded,
                      size: 48, color: Colors.red),
                  const SizedBox(height: 8),
                  Text(
                    'Error al cargar movimientos:\n${widget.controller.error}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => widget.controller.loadAll(),
                    child: const Text('Reintentar'),
                  ),
                ],
              ),
            );
          }

          final list = widget.controller.movements;
          final filtered = widget.productId == null
              ? list
              : list
                  .where((m) => m.productId == widget.productId)
                  .toList();

          if (filtered.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history_toggle_off_rounded,
                      size: 56, color: Colors.grey.shade300),
                  const SizedBox(height: 12),
                  Text(
                    widget.productId != null
                        ? 'Este producto aún no tiene\nmovimientos registrados.'
                        : 'Aún no hay movimientos\nregistrados en el sistema.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.grey, fontSize: 15),
                  ),
                ],
              ),
            );
          }

          final sorted = [...filtered]
            ..sort((a, b) => b.occurredAt.compareTo(a.occurredAt));

          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: sorted.length,
            separatorBuilder: (_, __) =>
                const Divider(color: Color(0xFFDCE6F1)),
            itemBuilder: (context, index) => _MovementTile(
              movement: sorted[index],
              controller: widget.controller,
              showProduct: widget.productId == null,
            ),
          );
        },
      ),
    );
  }
}

class _MovementTile extends StatelessWidget {
  const _MovementTile({
    required this.movement,
    required this.controller,
    required this.showProduct,
  });

  final ProductMovement movement;
  final InventoryController controller;
  final bool showProduct;

  @override
  Widget build(BuildContext context) {
    final m = movement;
    final isIn = m.type == 'in';
    final color = isIn ? Colors.green : Colors.red;
    final qtyText = '${isIn ? '+' : '-'}${m.quantity}';
    final date = m.occurredAt.toLocal().toString().split('.').first;

    final Product? product = showProduct
        ? controller.products.cast<Product?>().firstWhere(
            (p) => p?.id == m.productId,
            orElse: () => null,
          )
        : null;

    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(
          isIn ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
          color: color,
        ),
      ),
      title: Text(
        qtyText,
        style: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 4),
          Text(
            date,
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
          if (m.note != null && m.note!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              m.note!,
              style: const TextStyle(
                fontStyle: FontStyle.italic,
                fontSize: 13,
              ),
            ),
          ],
        ],
      ),
      trailing: showProduct && product != null
          ? Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  product.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1E3A5F),
                  ),
                ),
                if ((product.sku ?? '').isNotEmpty)
                  Text(
                    product.sku!,
                    style: const TextStyle(fontSize: 11, color: Colors.grey),
                  ),
              ],
            )
          : null,
    );
  }
}