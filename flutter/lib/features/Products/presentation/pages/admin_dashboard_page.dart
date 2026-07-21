import 'package:flutter/material.dart';
import 'lista_productos_page.dart';
import '../controllers/product_controller.dart';

class AdminDashboardPage extends StatelessWidget {
  final String token;
  const AdminDashboardPage({super.key, required this.token});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Panel de Administración")),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
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
          child: const Text("Gestionar Productos"),
        ),
      ),
    );
  }
}
