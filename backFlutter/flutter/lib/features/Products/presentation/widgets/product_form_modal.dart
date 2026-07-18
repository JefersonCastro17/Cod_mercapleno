import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/entities/product_entity.dart';
import '../utils/product_catalogs.dart';

class ProductFormModal extends StatefulWidget {
  final ProductEntity? producto;
  final Function(Map<String, String> fields, File? imageFile) onSave;

  const ProductFormModal({super.key, this.producto, required this.onSave});

  @override
  State<ProductFormModal> createState() => _ProductFormModalState();
}

class _ProductFormModalState extends State<ProductFormModal> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nombreCtrl;
  late TextEditingController _precioCtrl;
  late TextEditingController _descCtrl;
  String _estado = 'Disponible';
  int _idCategoria = 1;
  int _idProveedor = 1;
  File? _selectedImage;
  String? _imageError;

  @override
  void initState() {
    super.initState();
    _nombreCtrl = TextEditingController(text: widget.producto?.nombre ?? '');
    _precioCtrl = TextEditingController(
      text: widget.producto?.precio.toString() ?? '',
    );
    _descCtrl = TextEditingController(text: widget.producto?.descripcion ?? '');
    _estado = widget.producto?.estado ?? 'Disponible';
    _idCategoria = widget.producto?.idCategoria ?? 1;
    _idProveedor = widget.producto?.idProveedor ?? 1;

    // Validar que los IDs existan en los catálogos
    if (!ProductCatalogs.categorias.containsKey(_idCategoria)) {
      _idCategoria = ProductCatalogs.categorias.keys.first;
    }
    if (!ProductCatalogs.proveedores.containsKey(_idProveedor)) {
      _idProveedor = ProductCatalogs.proveedores.keys.first;
    }
  }

  Future<void> _pickImage() async {
    final pickedFile = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
        _imageError = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                widget.producto == null ? 'Nuevo Producto' : 'Editar Producto',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextFormField(
                controller: _nombreCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nombre',
                  hintText: 'Ingrese el nombre del producto',
                ),
                validator: (v) => v!.isEmpty ? 'Obligatorio' : null,
                textInputAction: TextInputAction.next,
              ),
              TextFormField(
                controller: _precioCtrl,
                decoration: const InputDecoration(
                  labelText: 'Precio',
                  hintText: 'Ingrese el precio del producto',
                ),
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.next,
              ),
              TextFormField(
                controller: _descCtrl,
                decoration: const InputDecoration(
                  labelText: 'Descripción',
                  hintText: 'Ingrese la descripción (opcional)',
                ),
                maxLines: 3,
                minLines: 1,
                keyboardType: TextInputType.multiline,
                textInputAction: TextInputAction.newline,
              ),
              DropdownButtonFormField<String>(
                initialValue: _estado,
                decoration: const InputDecoration(labelText: 'Estado'),
                items: const [
                  DropdownMenuItem(
                    value: 'Disponible',
                    child: Text('Disponible'),
                  ),
                  DropdownMenuItem(value: 'Agotado', child: Text('Agotado')),
                ],
                onChanged: (v) => setState(() => _estado = v!),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<int>(
                initialValue: _idCategoria,
                decoration: const InputDecoration(labelText: 'Categoría'),
                isExpanded: true,
                items: ProductCatalogs.categorias.entries
                    .map((e) => DropdownMenuItem<int>(
                          value: e.key,
                          child: Text(e.value),
                        ))
                    .toList(),
                validator: (v) => v == null ? 'Seleccione una categoría' : null,
                onChanged: (v) => setState(() => _idCategoria = v!),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<int>(
                initialValue: _idProveedor,
                decoration: const InputDecoration(labelText: 'Proveedor'),
                isExpanded: true,
                items: ProductCatalogs.proveedores.entries
                    .map((e) => DropdownMenuItem<int>(
                          value: e.key,
                          child: Text(e.value),
                        ))
                    .toList(),
                validator: (v) =>
                    v == null ? 'Seleccione un proveedor' : null,
                onChanged: (v) => setState(() => _idProveedor = v!),
              ),
              const SizedBox(height: 12),
              TextButton.icon(
                icon: const Icon(Icons.image),
                label: const Text('Subir Imagen'),
                onPressed: _pickImage,
              ),
              if (_selectedImage != null)
                Image.file(_selectedImage!, height: 80),
              if (_imageError != null)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    _imageError!,
                    style: const TextStyle(color: Colors.red, fontSize: 12),
                  ),
                ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancelar'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      final isNewProduct = widget.producto == null;
                      if (isNewProduct && _selectedImage == null) {
                        setState(() => _imageError = 'La imagen es obligatoria');
                        return;
                      }
                      if (_formKey.currentState!.validate()) {
                        setState(() => _imageError = null);
                        widget.onSave({
                          'nombre': _nombreCtrl.text,
                          'precio': _precioCtrl.text,
                          'estado': _estado,
                          'descripcion': _descCtrl.text,
                          'id_categoria': _idCategoria.toString(),
                          'id_proveedor': _idProveedor.toString(),
                        }, _selectedImage);
                      }
                    },
                    child: const Text('Guardar'),
                  ),
                ],
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
