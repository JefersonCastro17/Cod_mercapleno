import 'package:flutter/material.dart';

class TicketPage extends StatelessWidget {
  const TicketPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).primaryColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.white, size: 100),
            const SizedBox(height: 20),
            const Text('¡VENTA EXITOSA!', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            const Text('La orden ha sido registrada en el sistema.', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () => Navigator.pushNamedAndRemoveUntil(context, '/catalogo', (route) => false),
              child: const Text('VOLVER AL INICIO'),
            )
          ],
        ),
      ),
    );
  }
}