import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/venta_provider.dart';

class FilterBottomSheet extends StatefulWidget {
  const FilterBottomSheet({super.key});

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  final TextEditingController _minController = TextEditingController();
  final TextEditingController _maxController = TextEditingController();
  final TextEditingController _searchController = TextEditingController();
  String _tempCategory = 'Todo';

  final List<String> _categorias = ['Todo', 'Abarrotes', 'Aseo', 'Carnes', 'Lácteos', 'Frutas y Verduras'];

  @override
  void dispose() {
    _minController.dispose();
    _maxController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ventaProvider = context.read<VentaProvider>();

    return Container(
      padding: EdgeInsets.only(
        left: 20, right: 20, top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Este es el widget que daba error por el "const" superior
          Center(
            child: Container(
              width: 50, 
              height: 5, 
              decoration: BoxDecoration(
                color: Colors.grey[300], 
                borderRadius: BorderRadius.circular(10)
              )
            ),
          ),
          const SizedBox(height: 20),
          const Text('Búsqueda y Filtros', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 15),
          
          TextField(
            controller: _searchController,
            decoration: const InputDecoration(
              labelText: 'Buscar producto...',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 15),

          const Text('Categoría', style: TextStyle(fontWeight: FontWeight.bold)),
          DropdownButtonFormField<String>(
            initialValue: _tempCategory,
            items: _categorias.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
            onChanged: (val) => setState(() => _tempCategory = val!),
            decoration: const InputDecoration(border: UnderlineInputBorder()),
          ),
          const SizedBox(height: 20),

          const Text('Rango de Precios', style: TextStyle(fontWeight: FontWeight.bold)),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _minController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Min \$'),
                ),
              ),
              const SizedBox(width: 20),
              Expanded(
                child: TextField(
                  controller: _maxController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Max \$'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 30),

          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D47A1),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                final double? min = double.tryParse(_minController.text);
                final double? max = double.tryParse(_maxController.text);
                
                ventaProvider.updateFilters(
                  search: _searchController.text,
                  category: _tempCategory,
                  min: min,
                  max: max
                );
                Navigator.pop(context);
              },
              child: const Text('APLICAR FILTROS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}