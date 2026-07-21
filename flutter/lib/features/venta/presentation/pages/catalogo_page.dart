import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mercapleno_appv1/features/auth/presentation/controllers/auth_controller.dart';
import '../providers/venta_provider.dart';
import '../widgets/filter_bottom_sheet.dart';

class CatalogoPage extends StatefulWidget {
  const CatalogoPage({super.key});

  @override
  State<CatalogoPage> createState() => _CatalogoPageState();
}

class _CatalogoPageState extends State<CatalogoPage> {
  @override
  void initState() {
    super.initState();
    // Cargar productos al iniciar, similar a useEffect en Vite
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<VentaProvider>().loadCatalogo();
    });
  }

  @override
  Widget build(BuildContext context) {
    final ventaProvider = context.watch<VentaProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('MercaPleno', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          // Botón de Filtro (Igual que en el video de la web)
          IconButton(
            icon: const Icon(Icons.tune),
            onPressed: () => showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              builder: (_) => FilterBottomSheet(),
            ),
          ),
          // Carrito con Badge
          _CartBadge(count: ventaProvider.cart.length),
          // Botón de Cerrar Sesión para Clientes
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            onPressed: () async {
              try {
                await context.read<AuthController>().logout();
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error al cerrar sesión: $e')),
                  );
                }
              }
            },
            tooltip: 'Cerrar sesión',
          ),
        ],
      ),
      body: ventaProvider.isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ventaProvider.productos.isEmpty
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.search_off, size: 80, color: Colors.grey),
                      const SizedBox(height: 20),
                      const Text(
                        'No se encontraron productos con esos filtros.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Prueba otra categoría, amplía el rango de precio o limpia la búsqueda.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 14, color: Colors.grey),
                      ),
                      const SizedBox(height: 24),
                      OutlinedButton(
                        onPressed: () {
                          ventaProvider.updateFilters(
                            search: '',
                            category: 'Todo',
                            min: null,
                            max: null,
                          );
                        },
                        child: const Text('Mostrar todo'),
                      ),
                    ],
                  ),
                ),
              )
            : GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.75,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: ventaProvider.productos.length,
                itemBuilder: (context, index) {
                  final producto = ventaProvider.productos[index];
                  return Card(
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Expanded(
                      child: Image.network(
                        producto.urlImagenCompleta, // Usando la lógica de imageUtils
                        fit: BoxFit.cover,
                        width: double.infinity,
                        cacheWidth: 300, // Optimización de decodificación en memoria RAM
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return Container(
                            color: Colors.grey[100],
                            child: const Center(
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          );
                        },
                        errorBuilder: (_, __, ___) => Container(
                          color: Colors.grey[200],
                          child: const Icon(Icons.image_not_supported, color: Colors.grey),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.blue.shade50,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                producto.categoria,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blue[800]),
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.green.shade50,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Text(
                              'Disponible',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(8.0, 0, 8.0, 8.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(producto.nombre, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text(
                            producto.descripcion,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                          const SizedBox(height: 4),
                          Text('\$${producto.precio.toStringAsFixed(0)}', 
                            style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () => ventaProvider.addToCart(producto),
                              child: const Icon(Icons.add_shopping_cart, size: 18),
                            ),
                          )
                        ],
                      ),
                    )
                  ],
                ),
              );
            },
          ),
    );
  }
}

class _CartBadge extends StatelessWidget {
  final int count;
  const _CartBadge({required this.count});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        IconButton(
          icon: const Icon(Icons.shopping_cart),
          onPressed: () => Navigator.pushNamed(context, '/carrito'),
        ),
        if (count > 0)
          Positioned(
            right: 8, top: 8,
            child: CircleAvatar(
              radius: 8, backgroundColor: Colors.red,
              child: Text('$count', style: const TextStyle(fontSize: 10, color: Colors.white)),
            ),
          )
      ],
    );
  }
}