// inventory_page.dart
// Responsabilidad: visualizar stock actual y registrar movimientos de inventario.
// La gestión de productos (crear, editar, eliminar) vive en products_page.dart.

import 'package:flutter/material.dart';
import 'package:mercapleno_appv1/core/config/app_config.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../controllers/inventory_controller.dart';
import '../../domain/entities/product.dart';
import '../../domain/entities/reference_document.dart';
import 'movements_page.dart';

class InventoryPage extends StatefulWidget {
  const InventoryPage({
    super.key,
    required this.controller,
  });

  final InventoryController controller;

  @override
  State<InventoryPage> createState() => _InventoryPageState();
}

class _InventoryPageState extends State<InventoryPage> {
  String _searchQuery = '';
  String _selectedFilter = 'Todos';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      widget.controller.loadAll();
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  Widget _buildProductImage(String imagePath) {
    if (imagePath.isEmpty) {
      return Container(
        color: const Color(0xFFF4F7FB),
        alignment: Alignment.center,
        child: const Icon(
          Icons.shopping_basket_rounded,
          size: 26,
          color: Color(0xFF0B4A8B),
        ),
      );
    }

    String cleanPath = imagePath.trim();
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      // Ya es una URL completa
    } else {
      // Limpia espacios y remueve barras o rutas relativas al inicio del string
      cleanPath = cleanPath.replaceAll(RegExp(r'^(\.\.\/|\.\/|\/)'), '');
      // Reemplaza barras invertidas de Windows si el backend las genera de ese modo
      cleanPath = cleanPath.replaceAll('\\', '/');
      // Evitar duplicar /uploads/ si ya viene en la ruta
      if (cleanPath.startsWith('uploads/')) {
        cleanPath = cleanPath.replaceFirst('uploads/', '');
      }
      final base = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/+$'), '');
      cleanPath = '$base/uploads/$cleanPath';
    }

    return Image.network(
      cleanPath,
      width: 50,
      height: 50,
      fit: BoxFit.cover,
      errorBuilder: (_, __, ___) => Container(
        color: const Color(0xFFF4F7FB),
        alignment: Alignment.center,
        child: const Icon(
          Icons.broken_image_rounded,
          color: Colors.grey,
          size: 24,
        ),
      ),
    );
  }

  ({Color fg, Color bg, String label, IconData icon}) _statusStyle(
    int stock,
    int threshold,
  ) {
    if (stock == 0) {
      return (
        fg: Colors.red.shade800,
        bg: Colors.red.shade50,
        label: 'Agotado',
        icon: Icons.error_rounded,
      );
    }
    if (stock <= threshold) {
      return (
        fg: Colors.orange.shade800,
        bg: Colors.orange.shade50,
        label: 'Stock Bajo (≤$threshold)',
        icon: Icons.warning_amber_rounded,
      );
    }
    return (
      fg: Colors.green.shade800,
      bg: Colors.green.shade50,
      label: 'Disponible',
      icon: Icons.check_circle_rounded,
    );
  }

  // ─── Escáner de producto ─────────────────────────────────────────────────────

  /// Abre la cámara para escanear un código de barras o QR.
  /// Busca el producto cuyo SKU coincida con el código escaneado y
  /// navega directo al formulario de movimiento de ese producto.
  Future<void> _openScanner(BuildContext context) async {
    final scanned = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (_) => const _ScannerPage()),
    );

    if (scanned == null || scanned.isEmpty) return;

    // Buscar producto por SKU o ID (ignorando mayúsculas)
    final match = widget.controller.products.cast<Product?>().firstWhere(
      (p) => (p?.sku ?? '').toLowerCase() == scanned.toLowerCase() || p?.id == scanned,
      orElse: () => null,
    );

    if (!mounted) return;

    if (match == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('No se encontró producto con SKU o ID: $scanned'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Producto encontrado → elegir tipo de movimiento
    final type = await showModalBottomSheet<String>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _MovementTypeSelector(productName: match.name),
    );

    if (type == null || !mounted) return;

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => _MovementFormWrapper(
          controller: widget.controller,
          type: type,
          preselectedProductId: match.id,
        ),
      ),
    );
  }

  // ─── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final threshold = AppConfig.lowStockThreshold;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        title: const Text('Control de Stock'),
        backgroundColor: const Color(0xFF0B4A8B),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            tooltip: 'Ver historial de movimientos',
            icon: const Icon(Icons.history_rounded),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => MovementsPage(controller: widget.controller),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          _SearchBar(
            onChanged: (q) => setState(() => _searchQuery = q.toLowerCase()),
            query: _searchQuery,
          ),
          _FilterChipRow(
            selected: _selectedFilter,
            onSelected: (f) => setState(() => _selectedFilter = f),
          ),
          const Divider(height: 1, color: Color(0xFFDCE6F1)),
          _LowStockBanner(controller: widget.controller, threshold: threshold),
          Expanded(
            child: AnimatedBuilder(
              animation: widget.controller,
              builder: (context, _) {
                if (widget.controller.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (widget.controller.error != null) {
                  return _ErrorView(
                    error: widget.controller.error!,
                    onRetry: widget.controller.loadAll,
                  );
                }

                final filtered = _applyFilters(threshold);

                if (filtered.isEmpty) {
                  return const Center(
                    child: Text(
                      'No se encontraron productos.',
                      style: TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(12),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) =>
                      _buildProductCard(context, filtered[index], threshold),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'scan_product',
        onPressed: () => _openScanner(context),
        label: const Text('Escanear producto'),
        icon: const Icon(Icons.qr_code_scanner_rounded),
        backgroundColor: const Color(0xFF0B4A8B),
        foregroundColor: Colors.white,
      ),
    );
  }

  // ─── Filtrado ────────────────────────────────────────────────────────────────

  List<Product> _applyFilters(int threshold) {
    return widget.controller.products.where((p) {
      // Si tu entidad Product NO tiene campo `sku`, elimina la segunda condición.
      // Si SÍ lo tiene como String?, déjalo tal cual.
      final matchesSearch =
          p.name.toLowerCase().contains(_searchQuery) ||
          p.id.toLowerCase().contains(_searchQuery) ||
          (p.sku?.toLowerCase().contains(_searchQuery) ?? false);

      final stock = widget.controller.currentStock[p.id] ?? 0;

      final matchesFilter = switch (_selectedFilter) {
        'Bajo Stock' => stock > 0 && stock <= threshold,
        'Disponible' => stock > threshold,
        'Agotado'   => stock == 0,
        _           => true,
      };

      return matchesSearch && matchesFilter;
    }).toList();
  }

  // ─── Tarjeta de producto ─────────────────────────────────────────────────────

  Widget _buildProductCard(BuildContext context, Product p, int threshold) {
    final stock = widget.controller.currentStock[p.id] ?? 0;
    final style = _statusStyle(stock, threshold);
    final imageUrl = p.imagen ?? '';
    // Si tu entidad Product tiene campo `sku`, cámbialo por: p.sku ?? ''
    final sku = p.sku ?? '';

    return Card(
      elevation: 2,
      shadowColor: const Color.fromRGBO(0, 0, 0, 0.04),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: stock <= threshold
              ? style.fg.withValues(alpha: 0.4)
              : const Color(0xFFDCE6F1),
          width: stock <= threshold ? 1.5 : 1,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => MovementsPage(
              controller: widget.controller,
              productId: p.id,
              productName: p.name,
            ),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── Fila superior: imagen + info + stock ─────────────────────
              Row(
                children: [
                  _ProductThumbnail(child: _buildProductImage(imageUrl)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          p.name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1E3A5F),
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (sku.isNotEmpty)
                          Text(
                            'SKU: $sku',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                              fontFamily: 'monospace',
                            ),
                          ),
                        const SizedBox(height: 6),
                        _StatusTag(
                          icon: style.icon,
                          label: style.label,
                          fg: style.fg,
                          bg: style.bg,
                        ),
                      ],
                    ),
                  ),
                  _StockCircle(stock: stock, fg: style.fg, bg: style.bg),
                ],
              ),
              const Divider(height: 20, color: Color(0xFFDCE6F1)),

              // ── Botones de movimiento ─────────────────────────────────────
              Row(
                children: [
                  _MovementButton(
                    label: 'Entrada',
                    icon: Icons.add_circle_outline_rounded,
                    color: const Color(0xFF0B4A8B),
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => _MovementFormWrapper(
                          controller: widget.controller,
                          type: 'in',
                          preselectedProductId: p.id,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  _MovementButton(
                    label: 'Salida',
                    icon: Icons.remove_circle_outline_rounded,
                    color: Colors.redAccent,
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => _MovementFormWrapper(
                          controller: widget.controller,
                          type: 'out',
                          preselectedProductId: p.id,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Sub-widgets internos (sin estado propio irrelevante al padre)
// ══════════════════════════════════════════════════════════════════════════════

class _SearchBar extends StatefulWidget {
  const _SearchBar({required this.onChanged, required this.query});
  final ValueChanged<String> onChanged;
  final String query;

  @override
  State<_SearchBar> createState() => _SearchBarState();
}

class _SearchBarState extends State<_SearchBar> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      color: Colors.white,
      child: TextField(
        controller: _controller,
        onChanged: widget.onChanged,
        decoration: InputDecoration(
          hintText: 'Buscar por nombre o SKU...',
          prefixIcon:
              const Icon(Icons.search_rounded, color: Color(0xFF0B4A8B)),
          suffixIcon: widget.query.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear_rounded),
                  onPressed: () {
                    _controller.clear();
                    widget.onChanged('');
                  },
                )
              : null,
          filled: true,
          fillColor: const Color(0xFFF4F7FB),
          contentPadding:
              const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }
}

class _FilterChipRow extends StatelessWidget {
  const _FilterChipRow({required this.selected, required this.onSelected});
  final String selected;
  final ValueChanged<String> onSelected;

  static const _filters = ['Todos', 'Bajo Stock', 'Disponible', 'Agotado'];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      color: Colors.white,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        children: _filters.map((f) {
          final isSelected = selected == f;
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: ChoiceChip(
              label: Text(f),
              selected: isSelected,
              onSelected: (ok) {
                if (ok) onSelected(f);
              },
              selectedColor: const Color.fromARGB(38, 11, 74, 139),
              labelStyle: TextStyle(
                color: isSelected
                    ? const Color(0xFF0B4A8B)
                    : Colors.grey.shade700,
                fontWeight:
                    isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _LowStockBanner extends StatelessWidget {
  const _LowStockBanner(
      {required this.controller, required this.threshold});
  final InventoryController controller;
  final int threshold;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        final count = controller.products.where((p) {
          final stock = controller.currentStock[p.id] ?? 0;
          return stock > 0 && stock <= threshold;
        }).length;

        if (count == 0) return const SizedBox.shrink();

        return Container(
          margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.orange.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.orange.shade200, width: 1.5),
          ),
          child: Row(
            children: [
              Icon(Icons.warning_amber_rounded,
                  color: Colors.orange.shade800),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Hay $count productos con stock bajo (≤ $threshold unidades). '
                  'Se ha enviado un aviso automático al administrador.',
                  style: TextStyle(
                    color: Colors.orange.shade900,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.error, required this.onRetry});
  final String error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded,
                size: 48, color: Colors.red),
            const SizedBox(height: 8),
            Text('Error: $error', textAlign: TextAlign.center),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: onRetry,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProductThumbnail extends StatelessWidget {
  const _ProductThumbnail({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFDCE6F1)),
      ),
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }
}

class _StatusTag extends StatelessWidget {
  const _StatusTag({
    required this.icon,
    required this.label,
    required this.fg,
    required this.bg,
  });
  final IconData icon;
  final String label;
  final Color fg;
  final Color bg;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: fg),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}

class _StockCircle extends StatelessWidget {
  const _StockCircle(
      {required this.stock, required this.fg, required this.bg});
  final int stock;
  final Color fg;
  final Color bg;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 46,
      height: 46,
      decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
      alignment: Alignment.center,
      child: Text(
        stock.toString(),
        style: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w800,
          color: fg,
        ),
      ),
    );
  }
}

class _MovementButton extends StatelessWidget {
  const _MovementButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onPressed,
  });
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton.icon(
      icon: Icon(icon, size: 18),
      label: Text(label),
      style: TextButton.styleFrom(
        foregroundColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      ),
      onPressed: onPressed,
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Formulario de movimiento (sin cambios de lógica, solo movimientos)
// ══════════════════════════════════════════════════════════════════════════════

class _MovementFormWrapper extends StatelessWidget {
  const _MovementFormWrapper({
    required this.controller,
    required this.type,
    this.preselectedProductId,
  });

  final InventoryController controller;
  final String type;
  final String? preselectedProductId;

  @override
  Widget build(BuildContext context) {
    return _MovementForm(
      controller: controller,
      type: type,
      preselectedProductId: preselectedProductId,
    );
  }
}

class _MovementForm extends StatefulWidget {
  const _MovementForm({
    required this.controller,
    required this.type,
    this.preselectedProductId,
  });

  final InventoryController controller;
  final String type;
  final String? preselectedProductId;

  @override
  State<_MovementForm> createState() => _MovementFormState();
}

class _MovementFormState extends State<_MovementForm> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedProductId;
  final _qtyCtl = TextEditingController();
  final _docCodeCtl = TextEditingController();
  final _noteCtl = TextEditingController();

  String? _movementType;
  List<ReferenceDocument> _documentOptions = [];
  String? _selectedDocumentId;
  bool _isLoadingDocuments = false;
  String? _documentLoadError;

  bool _isSaving = false;
  int _currentStock = 0;

  @override
  void initState() {
    super.initState();
    _movementType = widget.type == 'in' ? 'ENTRADA' : 'SALIDA';
    if (widget.preselectedProductId != null) {
      _selectedProductId = widget.preselectedProductId;
      _currentStock =
          widget.controller.currentStock[_selectedProductId!] ?? 0;
    }
    _loadDocumentOptions();
  }

  @override
  void dispose() {
    _qtyCtl.dispose();
    _docCodeCtl.dispose();
    _noteCtl.dispose();
    super.dispose();
  }

  Future<void> _loadDocumentOptions() async {
    if (_movementType == null) return;
    setState(() {
      _isLoadingDocuments = true;
      _selectedDocumentId = null;
      _docCodeCtl.clear();
      _documentLoadError = null;
    });

    try {
      final options =
          await widget.controller.getReferenceDocuments(_movementType!);
      if (mounted) {
        setState(() {
          _documentOptions = options;
          _isLoadingDocuments = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _documentOptions = [];
          _documentLoadError =
              'No se pudieron cargar los documentos de referencia.';
          _isLoadingDocuments = false;
        });
      }
    }
  }

  void _onProductSelected(String? productId) {
    setState(() {
      _selectedProductId = productId;
      _currentStock =
          productId != null
              ? (widget.controller.currentStock[productId] ?? 0)
              : 0;
    });
    _formKey.currentState?.validate();
  }

  @override
  Widget build(BuildContext context) {
    final products = widget.controller.products;
    final threshold = AppConfig.lowStockThreshold;
    final isEntrada = _movementType == 'ENTRADA';

    return Scaffold(
      appBar: AppBar(
        title: Text(isEntrada ? 'Registrar Entrada' : 'Registrar Salida'),
        backgroundColor:
            isEntrada ? const Color(0xFF0B4A8B) : Colors.redAccent,
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Tipo de movimiento
                DropdownButtonFormField<String>(
                  initialValue: _movementType,
                  items: const [
                    DropdownMenuItem(
                      value: 'ENTRADA',
                      child: Text('Entrada / Recepción de Mercancía'),
                    ),
                    DropdownMenuItem(
                      value: 'SALIDA',
                      child: Text('Salida / Ajuste Negativo'),
                    ),
                  ],
                  onChanged: _isSaving
                      ? null
                      : (val) {
                          if (val != null && val != _movementType) {
                            setState(() {
                              _movementType = val;
                            });
                            _loadDocumentOptions();
                          }
                        },
                  decoration: const InputDecoration(
                    labelText: 'Tipo de Movimiento',
                  ),
                ),
                const SizedBox(height: 16),

                // Selector de producto
                DropdownButtonFormField<String>(
                  initialValue: _selectedProductId,
                  items: products
                      .map((p) =>
                          DropdownMenuItem(value: p.id, child: Text(p.name)))
                      .toList(),
                  onChanged: _isSaving ? null : _onProductSelected,
                  decoration: const InputDecoration(
                    labelText: 'Producto',
                    hintText: 'Selecciona un producto',
                  ),
                  validator: (v) =>
                      v == null ? 'Por favor selecciona un producto' : null,
                ),

                // Stock actual
                if (_selectedProductId != null) ...[
                  const SizedBox(height: 12),
                  _CurrentStockInfo(stock: _currentStock, threshold: threshold),
                ],

                const SizedBox(height: 16),

                // Cantidad
                TextFormField(
                  controller: _qtyCtl,
                  enabled: !_isSaving,
                  keyboardType: TextInputType.number,
                  onChanged: (_) => setState(() {}),
                  decoration: const InputDecoration(
                    labelText: 'Cantidad',
                    hintText: 'Ej. 10',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Por favor ingresa la cantidad';
                    }
                    final q = int.tryParse(value);
                    if (q == null || q <= 0) {
                      return 'Ingresa una cantidad entera mayor a 0';
                    }
                    if (_movementType == 'SALIDA' && q > _currentStock) {
                      return 'Stock insuficiente (disponible: $_currentStock)';
                    }
                    return null;
                  },
                ),

                // Alerta de stock post-salida
                if (_movementType == 'SALIDA' &&
                    _selectedProductId != null &&
                    _qtyCtl.text.isNotEmpty)
                  _OutStockWarning(
                    qty: int.tryParse(_qtyCtl.text) ?? 0,
                    currentStock: _currentStock,
                    threshold: threshold,
                  ),

                const SizedBox(height: 16),

                // Documento de Referencia
                if (_isLoadingDocuments)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                        SizedBox(width: 12),
                        Text(
                          'Cargando documentos...',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                else if (_documentOptions.isNotEmpty)
                  DropdownButtonFormField<String>(
                    initialValue: _selectedDocumentId,
                    items: [
                      const DropdownMenuItem(
                        value: null,
                        child: Text('Seleccione un documento'),
                      ),
                      ..._documentOptions.map(
                        (doc) => DropdownMenuItem(
                          value: doc.idDocumento,
                          child: Text(doc.label),
                        ),
                      ),
                    ],
                    onChanged: _isSaving
                        ? null
                        : (val) {
                            setState(() {
                              _selectedDocumentId = val;
                            });
                          },
                    decoration: const InputDecoration(
                      labelText: 'Doc. de Referencia',
                    ),
                    validator: (v) => v == null || v.isEmpty
                        ? 'Debe seleccionar un documento de referencia'
                        : null,
                  )
                else
                  TextFormField(
                    controller: _docCodeCtl,
                    enabled: !_isSaving,
                    decoration: const InputDecoration(
                      labelText: 'Doc. de Referencia',
                      hintText: 'Ej: CC, RUC, 01, 02',
                      helperText:
                          'No hay documentos cargados. Ingresa un código.',
                    ),
                    onChanged: (val) {
                      final upper = val
                          .toUpperCase()
                          .replaceAll(RegExp(r'[^A-Z0-9]'), '');
                      if (upper != val) {
                        _docCodeCtl.value = TextEditingValue(
                          text: upper,
                          selection:
                              TextSelection.collapsed(offset: upper.length),
                        );
                      }
                    },
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Debe ingresar un documento de referencia';
                      }
                      final cleaned = value.trim();
                      if (cleaned.length > 5) {
                        return 'El código no puede superar los 5 caracteres';
                      }
                      if (!RegExp(r'^[A-Z0-9]+$').hasMatch(cleaned)) {
                        return 'Solo se permiten letras mayúsculas y números';
                      }
                      return null;
                    },
                  ),

                if (_documentLoadError != null && !_isLoadingDocuments)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      _documentLoadError!,
                      style: const TextStyle(color: Colors.red, fontSize: 12),
                    ),
                  ),

                const SizedBox(height: 16),

                // Nota / Comentario
                TextFormField(
                  controller: _noteCtl,
                  enabled: !_isSaving,
                  decoration: const InputDecoration(
                    labelText: 'Nota / Comentario',
                    hintText: 'Ej. Compra de inventario inicial',
                  ),
                  validator: (value) {
                    if (value != null && value.length > 255) {
                      return 'La nota no puede superar los 255 caracteres';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 32),

                // Botón guardar
                _isSaving
                    ? const Center(child: CircularProgressIndicator())
                    : FilledButton(
                        style: FilledButton.styleFrom(
                          backgroundColor: isEntrada
                              ? const Color(0xFF0B4A8B)
                              : Colors.redAccent,
                        ),
                        onPressed: _submit,
                        child: Text(
                          isEntrada ? 'Registrar Entrada' : 'Registrar Salida',
                        ),
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final documentId = _documentOptions.isNotEmpty
        ? _selectedDocumentId
        : _docCodeCtl.text.trim();

    if (documentId == null || documentId.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Debe seleccionar o ingresar un documento de referencia.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      await widget.controller.createMovement(
        productId: _selectedProductId!,
        quantity: int.parse(_qtyCtl.text),
        type: _movementType!,
        documentId: documentId.trim(),
        note: _noteCtl.text.trim().isEmpty ? null : _noteCtl.text.trim(),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Movimiento registrado correctamente'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al registrar movimiento: $e'),
            backgroundColor: Colors.red,
          ),
        );
        setState(() => _isSaving = false);
      }
    }
  }
}

class _CurrentStockInfo extends StatelessWidget {
  const _CurrentStockInfo({required this.stock, required this.threshold});
  final int stock;
  final int threshold;

  @override
  Widget build(BuildContext context) {
    final isLow = stock <= threshold;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: isLow ? Colors.orange.shade50 : Colors.blue.shade50,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isLow ? Colors.orange.shade300 : Colors.blue.shade200,
        ),
      ),
      child: Row(
        children: [
          Icon(
            isLow ? Icons.warning_rounded : Icons.info_outline_rounded,
            color: isLow ? Colors.orange.shade800 : Colors.blue.shade800,
          ),
          const SizedBox(width: 8),
          Text(
            'Stock actual disponible: $stock unidades',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isLow ? Colors.orange.shade900 : Colors.blue.shade900,
            ),
          ),
        ],
      ),
    );
  }
}

class _OutStockWarning extends StatelessWidget {
  const _OutStockWarning({
    required this.qty,
    required this.currentStock,
    required this.threshold,
  });
  final int qty;
  final int currentStock;
  final int threshold;

  @override
  Widget build(BuildContext context) {
    final remaining = currentStock - qty;
    if (qty <= 0 || remaining > threshold || remaining < 0) {
      return const SizedBox.shrink();
    }
    final msg = remaining == 0
        ? '⚠️ ¡Cuidado! El stock quedará en 0 (Agotado).'
        : '⚠️ Alerta: El stock quedará en $remaining (≤ $threshold). '
            'Se enviará una notificación al administrador.';

    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Text(
        msg,
        style: TextStyle(
          color: Colors.orange.shade900,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}


// Pantalla de escáner de código de barras / QR

class _ScannerPage extends StatefulWidget {
  const _ScannerPage();

  @override
  State<_ScannerPage> createState() => _ScannerPageState();
}

class _ScannerPageState extends State<_ScannerPage> {
  final MobileScannerController _ctrl = MobileScannerController();
  bool _detected = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_detected) return;
    final code = capture.barcodes.firstOrNull?.rawValue;
    if (code == null || code.isEmpty) return;
    _detected = true;
    Navigator.of(context).pop(code);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Escanear código de producto'),
        backgroundColor: const Color(0xFF0B4A8B),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_rounded),
            tooltip: 'Linterna',
            onPressed: () => _ctrl.toggleTorch(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(controller: _ctrl, onDetect: _onDetect),
          // Visor central
          Center(
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white, width: 2),
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          // Instrucción
          Positioned(
            bottom: 48,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Apunta al código de barras o QR del producto',
                  style: TextStyle(color: Colors.white, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
          // Ingreso manual
          Positioned(
            top: 16,
            left: 0,
            right: 0,
            child: Center(
              child: TextButton.icon(
                icon: const Icon(Icons.keyboard_alt_outlined, color: Colors.white),
                label: const Text(
                  'Ingresar SKU manualmente',
                  style: TextStyle(color: Colors.white),
                ),
                onPressed: () async {
                  final manual = await showDialog<String>(
                    context: context,
                    builder: (_) => const _ManualSkuDialog(),
                  );
                  if (manual != null && mounted) {
                    Navigator.of(context).pop(manual);
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Diálogo para ingresar el SKU a mano cuando no hay cámara o el código no escanea.
class _ManualSkuDialog extends StatefulWidget {
  const _ManualSkuDialog();

  @override
  State<_ManualSkuDialog> createState() => _ManualSkuDialogState();
}

class _ManualSkuDialogState extends State<_ManualSkuDialog> {
  final _ctl = TextEditingController();

  @override
  void dispose() {
    _ctl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Ingresar SKU'),
      content: TextField(
        controller: _ctl,
        autofocus: true,
        decoration: const InputDecoration(
          hintText: 'Ej. PROD-001',
          labelText: 'SKU del producto',
        ),
        onSubmitted: (v) {
          if (v.trim().isNotEmpty) Navigator.of(context).pop(v.trim());
        },
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: () {
            final v = _ctl.text.trim();
            if (v.isNotEmpty) Navigator.of(context).pop(v);
          },
          child: const Text('Buscar'),
        ),
      ],
    );
  }
}

/// Bottom sheet para elegir si registrar entrada o salida tras escanear.
class _MovementTypeSelector extends StatelessWidget {
  const _MovementTypeSelector({required this.productName});

  final String productName;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 36),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            productName,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E3A5F),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          const Text(
            '¿Qué tipo de movimiento deseas registrar?',
            style: TextStyle(color: Colors.grey),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  icon: const Icon(Icons.add_circle_outline_rounded),
                  label: const Text('Entrada'),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF0B4A8B),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () => Navigator.of(context).pop('in'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton.icon(
                  icon: const Icon(Icons.remove_circle_outline_rounded),
                  label: const Text('Salida'),
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.redAccent,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () => Navigator.of(context).pop('out'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}