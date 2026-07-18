import 'package:flutter/material.dart';
import 'package:mercapleno_appv1/features/auth/presentation/controllers/auth_controller.dart';
import 'package:mercapleno_appv1/features/venta/presentation/pages/catalogo_page.dart';
import 'package:mercapleno_appv1/features/Products/presentation/pages/lista_productos_page.dart';
import 'package:mercapleno_appv1/features/Products/presentation/controllers/product_controller.dart';
import 'package:mercapleno_appv1/features/users_admin/presentation/pages/users_admin_list_page.dart';
import 'package:mercapleno_appv1/features/statistics/presentation/pages/estadisticas_page.dart';
import 'package:mercapleno_appv1/features/statistics/presentation/controllers/reportes_controller.dart';
import 'package:mercapleno_appv1/features/statistics/domain/usecases/obtener_reportes_usecase.dart';
import 'package:mercapleno_appv1/features/statistics/data/repositories/reportes_repository_impl.dart';
import 'package:mercapleno_appv1/features/statistics/data/datasources/reportes_remote_datasource.dart';
import 'package:mercapleno_appv1/core/network/api_client.dart';
import 'package:provider/provider.dart';
import 'package:mercapleno_appv1/features/stock/presentation/controllers/inventory_controller.dart';
import 'package:mercapleno_appv1/features/stock/presentation/pages/inventory_page.dart';
import 'package:mercapleno_appv1/features/stock/data/repositories/products_repository_impl.dart';
import 'package:mercapleno_appv1/features/stock/data/datasources/products_remote_data_source.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key, required this.controller});

  final AuthController controller;

  @override
  Widget build(BuildContext context) {
    final idRol = controller.session?.user.idRol ?? 3;

    if (idRol == 1) {
      return _AdminDashboard(controller: controller);
    } else if (idRol == 2) {
      return _EmployeeDashboard(controller: controller);
    } else {
      return const CatalogoPage();
    }
  }
}

 
// DASHBOARD DE ADMINISTRADOR
 
class _AdminDashboard extends StatelessWidget {
  const _AdminDashboard({required this.controller});

  final AuthController controller;

  String _displayName() {
    final user = controller.session?.user;
    final name = user?.fullName.trim();
    if (name != null && name.isNotEmpty) {
      final parts = name.split(' ');
      return parts.first;
    }
    return 'Administrador';
  }

  Future<void> _logout(BuildContext context) async {
    try {
      await controller.logout();
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('No se pudo cerrar sesión: $error')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = _displayName();
    final token = controller.session?.token ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B4A8B),
        elevation: 0,
        title: const Text(
          'Mercapleno - Panel Admin',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.white),
            onPressed: () => _logout(context),
            tooltip: 'Cerrar sesión',
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final screenWidth = constraints.maxWidth;
          final double padding = screenWidth > 600 ? 24.0 : 16.0;
          final crossAxisCount = screenWidth > 600 ? 2 : 2;

          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFF0B4A8B), Color(0xFF123C63)],
                    ),
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(32),
                      bottomRight: Radius.circular(32),
                    ),
                  ),
                  padding: EdgeInsets.fromLTRB(padding, 8, padding, padding + 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 32,
                            backgroundColor: const Color.fromRGBO(255, 255, 255, 0.2),
                            child: Text(
                              name.isNotEmpty ? name[0].toUpperCase() : 'A',
                              style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '¡Bienvenido, $name!',
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF59E0B),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    'Administrador',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Panel de control administrativo de Mercapleno. Accede a las herramientas de catálogo y personal.',
                        style: TextStyle(
                          color: const Color.fromRGBO(255, 255, 255, 0.85),
                          fontSize: 14,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),

                Padding(
                  padding: EdgeInsets.fromLTRB(padding, 28, padding, 16),
                  child: const Center(
                    child: Text(
                      'Módulos Administrativos',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0B4A8B),
                      ),
                    ),
                  ),
                ),

                Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 580),
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: padding),
                      child: GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 20,
                        mainAxisSpacing: 20,
                        childAspectRatio: 0.88,
                        children: [
                          _DashboardCard(
                            title: 'Productos',
                            description: 'Lista y edición de productos.',
                            icon: Icons.inventory_2_rounded,
                            color: const Color(0xFFF59E0B),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ListaProductosPage(
                                    controller: ProductController(),
                                    token: token,
                                  ),
                                ),
                              );
                            },
                          ),
                          _DashboardCard(
                            title: 'Gestión Usuarios',
                            description: 'Administración de personal, asignación de roles y permisos del sistema.',
                            icon: Icons.manage_accounts_rounded,
                            color: Colors.teal,
                            onTap: () {
                              Navigator.pushNamed(
                                context,
                                UsersAdminListPage.routeName,
                              );
                            },
                          ),
                          _DashboardCard(
                            title: 'Estadísticas',
                            description: 'Monitoreo de ingresos, márgenes de ganancia y rendimiento diario.',
                            icon: Icons.bar_chart_rounded,
                            color: Colors.blueAccent,
                            onTap: () {
                              final apiClient = ApiClient();
                              final reportesController = ReportesController(
                                ObtenerReportesUseCase(
                                  ReportesRepositoryImpl(
                                    ReportesRemoteDataSource(apiClient),
                                  ),
                                ),
                              );
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => EstadisticasPage(
                                    controller: reportesController,
                                    token: token,
                                  ),
                                ),
                              );
                            },
                          ),
                          _DashboardCard(
                            title: 'Control Stock',
                            description: 'Monitoreo de inventario crítico, alertas de reabastecimiento en almacenes y registros de movimientos.',
                            icon: Icons.warehouse_rounded,
                            color: Colors.purple,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ChangeNotifierProvider(
                                    create: (_) => InventoryController(
                                      repository: ProductsRepositoryImpl(
                                        remote: ProductsRemoteDataSource(
                                          apiClient: ApiClient(),
                                        ),
                                      ),
                                    )..loadAll(),
                                    child: Consumer<InventoryController>(
                                      // ✅ Fix: token eliminado — InventoryPage ya no lo recibe
                                      builder: (context, inventoryController, child) =>
                                          InventoryPage(controller: inventoryController),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      '* Diseño adaptativo de píxeles activo en este dispositivo *',
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          );
        },
      ),
    );
  }
}

 
// DASHBOARD DE EMPLEADO
 
class _EmployeeDashboard extends StatelessWidget {
  const _EmployeeDashboard({required this.controller});

  final AuthController controller;

  String _displayName() {
    final user = controller.session?.user;
    final name = user?.fullName.trim();
    if (name != null && name.isNotEmpty) {
      final parts = name.split(' ');
      return parts.first;
    }
    return 'Empleado';
  }

  Future<void> _logout(BuildContext context) async {
    try {
      await controller.logout();
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('No se pudo cerrar sesión: $error')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = _displayName();

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B4A8B),
        elevation: 0,
        title: const Text(
          'Mercapleno - Panel Empleado',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.white),
            onPressed: () => _logout(context),
            tooltip: 'Cerrar sesión',
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final screenWidth = constraints.maxWidth;
          final double padding = screenWidth > 600 ? 24.0 : 16.0;
          final crossAxisCount = screenWidth > 600 ? 2 : 2;

          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFF0B4A8B), Color(0xFF123C63)],
                    ),
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(32),
                      bottomRight: Radius.circular(32),
                    ),
                  ),
                  padding: EdgeInsets.fromLTRB(padding, 8, padding, padding + 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 32,
                            backgroundColor: const Color.fromRGBO(255, 255, 255, 0.2),
                            child: Text(
                              name.isNotEmpty ? name[0].toUpperCase() : 'E',
                              style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '¡Bienvenido, $name!',
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF59E0B),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    'Empleado',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Panel de operación diaria de Mercapleno. Monitorea y controla los movimientos internos.',
                        style: TextStyle(
                          color: const Color.fromRGBO(255, 255, 255, 0.85),
                          fontSize: 14,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),

                Padding(
                  padding: EdgeInsets.fromLTRB(padding, 28, padding, 16),
                  child: const Center(
                    child: Text(
                      'Módulos de Operación',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0B4A8B),
                      ),
                    ),
                  ),
                ),

                Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 580),
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: padding),
                      child: GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 20,
                        mainAxisSpacing: 20,
                        childAspectRatio: 0.88,
                        children: [
                          _DashboardCard(
                            title: 'Control Stock',
                            description: 'Monitoreo de inventario crítico, alertas de reabastecimiento en almacenes.',
                            icon: Icons.warehouse_rounded,
                            color: Colors.purple,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ChangeNotifierProvider(
                                    create: (_) => InventoryController(
                                      repository: ProductsRepositoryImpl(
                                        remote: ProductsRemoteDataSource(
                                          apiClient: ApiClient(),
                                        ),
                                      ),
                                    )..loadAll(),
                                    child: Consumer<InventoryController>(
                                      // ✅ Fix: token eliminado — InventoryPage ya no lo recibe
                                      builder: (context, inventoryController, child) =>
                                          InventoryPage(controller: inventoryController),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                          _DashboardCard(
                            title: 'Centro de Reportes',
                            description: 'Generación y exportación de informes de venta e inventario consolidados.',
                            icon: Icons.receipt_long_rounded,
                            color: Colors.deepOrange,
                            onTap: () {
                              final token = controller.session?.token ?? '';
                              final apiClient = ApiClient();
                              final reportesController = ReportesController(
                                ObtenerReportesUseCase(
                                  ReportesRepositoryImpl(
                                    ReportesRemoteDataSource(apiClient),
                                  ),
                                ),
                              );
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => EstadisticasPage(
                                    controller: reportesController,
                                    token: token,
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      '* Diseño adaptativo de píxeles activo en este dispositivo *',
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          );
        },
      ),
    );
  }
}

 
// TARJETA DE MÓDULO REUTILIZABLE
 
class _DashboardCard extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _DashboardCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 6,
      shadowColor: color.withValues(alpha: 0.15),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 34),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF123C63),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      description,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.grey,
                        height: 1.4,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Icon(Icons.arrow_forward_rounded, color: color, size: 22),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}