import 'package:flutter/material.dart';
import '../../domain/entities/product_entity.dart';
import '../controllers/product_controller.dart';
import '../utils/product_catalogs.dart';
import '../widgets/product_form_modal.dart';

class ListaProductosPage extends StatefulWidget {
  final ProductController controller;
  final String token;
  const ListaProductosPage({super.key, required this.controller, required this.token});

  @override
  State<ListaProductosPage> createState() => _ListaProductosPageState();
}

class _ListaProductosPageState extends State<ListaProductosPage> {
  late final String _token;
  String _searchTerm = "";
  String _statusFilter = "todos";
  static const _disabledStatus = 'Deshabilitado';

  @override
  void initState() {
    super.initState();
    _token = widget.token;
    widget.controller.loadProducts(_token);
    widget.controller.addListener(_onControllerUpdate);
  }

  void _onControllerUpdate() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onControllerUpdate);
    super.dispose();
  }

  List<ProductEntity> get _filteredProducts {
    final normalizedSearch = _searchTerm.trim().toLowerCase();
    return widget.controller.products.where((p) {
      final productStatus = p.estado.toLowerCase();
      final matchesSearch =
          normalizedSearch.isEmpty ||
          p.id.toString().contains(normalizedSearch) ||
          p.nombre.toLowerCase().contains(normalizedSearch) ||
          (p.descripcion?.toLowerCase().contains(normalizedSearch) ?? false) ||
          ProductCatalogs.categoriaNombre(p.idCategoria).toLowerCase().contains(normalizedSearch) ||
          ProductCatalogs.proveedorNombre(p.idProveedor).toLowerCase().contains(normalizedSearch) ||
          p.idCategoria.toString().contains(normalizedSearch) ||
          p.idProveedor.toString().contains(normalizedSearch);
      final matchesStatus = _statusFilter == 'todos'
          ? true
          : productStatus == _statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    }).toList();
  }

  Widget _buildStatusBadge(String status) {
    final normalized = status.toLowerCase();
    final color = normalized == 'agotado'
        ? const Color.fromRGBO(255, 152, 0, 1)
        : normalized == 'deshabilitado'
            ? const Color.fromRGBO(244, 67, 54, 1)
            : const Color.fromRGBO(76, 175, 80, 1);

    final bgColor = normalized == 'agotado'
        ? const Color.fromRGBO(255, 152, 0, 0.12)
        : normalized == 'deshabilitado'
            ? const Color.fromRGBO(244, 67, 54, 0.12)
            : const Color.fromRGBO(76, 175, 80, 0.12);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Widget _buildProductInfoChip(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: RichText(
        text: TextSpan(
          style: TextStyle(color: Colors.grey.shade800, fontSize: 13),
          children: [
            TextSpan(text: '$label: ', style: const TextStyle(fontWeight: FontWeight.w600)),
            TextSpan(text: value),
          ],
        ),
      ),
    );
  }

  void _openForm({ProductEntity? producto}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => ProductFormModal(
        producto: producto,
        onSave: (fields, file) async {
          try {
            await widget.controller.saveProduct(
              token: _token,
              id: producto?.id,
              fields: fields,
              imageFile: file,
            );
            if (mounted) Navigator.pop(context);
          } catch (e) {
            if (mounted) {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Error al guardar producto: $e')),
              );
            }
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.controller;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventario Mercapleno'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              state.loadProducts(_token);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: const InputDecoration(
                      hintText: 'Nombre, ID, categoría o proveedor',
                      prefixIcon: Icon(Icons.search),
                    ),
                    onChanged: (v) => setState(() => _searchTerm = v),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade400),
                  ),
                  child: DropdownButton<String>(
                    value: _statusFilter,
                    underline: const SizedBox.shrink(),
                    items: const [
                      DropdownMenuItem(value: "todos", child: Text("Todos")),
                      DropdownMenuItem(value: "Disponible", child: Text("Disponibles")),
                      DropdownMenuItem(value: "Agotado", child: Text("Agotados")),
                      DropdownMenuItem(value: "Deshabilitado", child: Text("Deshabilitados")),
                    ],
                    onChanged: (v) => setState(() => _statusFilter = v!),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_filteredProducts.length} resultado(s)',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _searchTerm = '';
                      _statusFilter = 'todos';
                    });
                  },
                  child: const Text('Limpiar filtros'),
                ),
              ],
            ),
          ),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : state.errorMessage.isNotEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, size: 48, color: Colors.red),
                            const SizedBox(height: 16),
                            Text(
                              'Error al cargar productos',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 8),
                            Text(state.errorMessage, textAlign: TextAlign.center),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () => state.loadProducts(_token),
                              child: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      )
                    : _filteredProducts.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.shopping_basket_outlined, size: 48, color: Colors.grey),
                                const SizedBox(height: 16),
                                Text(
                                  'No hay productos',
                                  style: Theme.of(context).textTheme.titleMedium,
                                ),
                                const SizedBox(height: 8),
                                const Text('Crea tu primer producto para comenzar'),
                              ],
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            itemCount: _filteredProducts.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 8),
                            itemBuilder: (context, idx) {
                              final p = _filteredProducts[idx];
                              return Card(
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                elevation: 1,
                                child: Padding(
                                  padding: const EdgeInsets.all(14),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          ClipRRect(
                                            borderRadius: BorderRadius.circular(12),
                                            child: p.imagen.isNotEmpty
                                                ? Image.network(
                                                    p.imagen,
                                                    width: 70,
                                                    height: 70,
                                                    fit: BoxFit.cover,
                                                    errorBuilder: (context, error, stackTrace) => Container(
                                                      width: 70,
                                                      height: 70,
                                                      color: Colors.grey.shade200,
                                                      child: const Icon(Icons.broken_image, color: Colors.grey),
                                                    ),
                                                  )
                                                : Container(
                                                    width: 70,
                                                    height: 70,
                                                    color: Colors.grey.shade200,
                                                    child: const Icon(Icons.shopping_basket, color: Colors.grey),
                                                  ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  children: [
                                                    Expanded(
                                                      child: Text(
                                                        p.nombre,
                                                        style: const TextStyle(
                                                          fontSize: 16,
                                                          fontWeight: FontWeight.w700,
                                                        ),
                                                      ),
                                                    ),
                                                    _buildStatusBadge(p.estado),
                                                  ],
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  'ID ${p.id}',
                                                  style: TextStyle(
                                                    color: Colors.grey.shade600,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                                const SizedBox(height: 8),
                                                Text(
                                                  p.descripcion?.isNotEmpty == true ? p.descripcion! : 'Sin descripción registrada.',
                                                  style: TextStyle(
                                                    color: Colors.grey.shade700,
                                                    fontSize: 13,
                                                  ),
                                                  maxLines: 2,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Wrap(
                                        spacing: 8,
                                        runSpacing: 8,
                                        children: [
                                          _buildProductInfoChip('Precio', '\$${p.precio.toStringAsFixed(0)}'),
                                          _buildProductInfoChip('Categoría', ProductCatalogs.categoriaNombre(p.idCategoria)),
                                          _buildProductInfoChip('Proveedor', ProductCatalogs.proveedorNombre(p.idProveedor)),
                                        ],
                                      ),
                                      const SizedBox(height: 14),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          TextButton(
                                            onPressed: () => _openForm(producto: p),
                                            child: const Text('Editar'),
                                          ),
                                          const SizedBox(width: 8),
                                          TextButton(
                                            style: TextButton.styleFrom(foregroundColor: Colors.orange),
                                            onPressed: () async {
                                              final confirm = await showDialog<bool>(
                                                context: context,
                                                builder: (context) => AlertDialog(
                                                  title: const Text('Deshabilitar Producto'),
                                                  content: Text('¿Estás seguro de que deseas deshabilitar "${p.nombre}"? El producto quedará oculto y no desaparecerá.'),
                                                  actions: [
                                                    TextButton(
                                                      onPressed: () => Navigator.pop(context, false),
                                                      child: const Text('Cancelar'),
                                                    ),
                                                    TextButton(
                                                      onPressed: () => Navigator.pop(context, true),
                                                      style: TextButton.styleFrom(foregroundColor: Colors.orange),
                                                      child: const Text('Deshabilitar'),
                                                    ),
                                                  ],
                                                ),
                                              );

                                              if (confirm == true) {
                                                try {
                                                  await state.saveProduct(
                                                    token: _token,
                                                    id: p.id,
                                                    fields: {'estado': _disabledStatus},
                                                    imageFile: null,
                                                  );
                                                  if (mounted) {
                                                    ScaffoldMessenger.of(context).showSnackBar(
                                                      SnackBar(
                                                        content: Text('Producto "${p.nombre}" deshabilitado correctamente.'),
                                                        backgroundColor: Colors.green,
                                                      ),
                                                    );
                                                  }
                                                } catch (e) {
                                                  if (mounted) {
                                                    String errorMsg = e.toString();
                                                    if (errorMsg.startsWith('Exception: ')) {
                                                      errorMsg = errorMsg.substring(11);
                                                    }
                                                    ScaffoldMessenger.of(context).showSnackBar(
                                                      SnackBar(
                                                        content: Text('Error al deshabilitar producto: $errorMsg'),
                                                        backgroundColor: Colors.red,
                                                      ),
                                                    );
                                                  }
                                                }
                                              }
                                            },
                                            child: const Text('Deshabilitar'),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openForm(),
        child: const Icon(Icons.add),
      ),
    );
  }
}
