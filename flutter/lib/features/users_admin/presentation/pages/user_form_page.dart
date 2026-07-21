import 'package:flutter/material.dart';
import 'package:mercapleno_appv1/features/auth/presentation/controllers/auth_controller.dart';
import 'package:mercapleno_appv1/features/users_admin/domain/entities/user_admin.dart';
import 'package:mercapleno_appv1/features/users_admin/presentation/controllers/users_admin_controller.dart';

class UserFormPageArgs {
  UserFormPageArgs({
    required this.usersController,
    required this.authController,
    this.userToEdit,
  });

  final UsersAdminController usersController;
  final AuthController authController;
  final UserAdmin? userToEdit;
}

class UserFormPage extends StatefulWidget {
  static const routeName = '/admin/users/form';

  const UserFormPage({
    super.key,
    required this.usersController,
    required this.authController,
    this.userToEdit,
  });

  final UsersAdminController usersController;
  final AuthController authController;
  final UserAdmin? userToEdit;

  @override
  State<UserFormPage> createState() => _UserFormPageState();
}

class _UserFormPageState extends State<UserFormPage> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _nombreController;
  late final TextEditingController _apellidoController;
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;
  late final TextEditingController _direccionController;
  late final TextEditingController _fechaNacimientoController;
  late final TextEditingController _numeroIdentificacionController;

  int? _selectedRol;
  int? _selectedTipoIdentificacion;
  bool _obscurePassword = true;
  DateTime? _selectedDate;

  bool get _isEditing => widget.userToEdit != null;

  @override
  void initState() {
    super.initState();
    final user = widget.userToEdit;

    _nombreController = TextEditingController(text: user?.nombre ?? '');
    _apellidoController = TextEditingController(text: user?.apellido ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _passwordController = TextEditingController();
    _direccionController = TextEditingController(text: user?.direccion ?? '');
    _numeroIdentificacionController =
        TextEditingController(text: user?.numeroIdentificacion ?? '');

    if (user != null) {
      _selectedDate = user.fechaNacimiento;
      _fechaNacimientoController = TextEditingController(
        text: _formatDate(user.fechaNacimiento),
      );
      _selectedRol = user.idRol;
      _selectedTipoIdentificacion = user.idTipoIdentificacion;
    } else {
      _fechaNacimientoController = TextEditingController();
      _selectedRol = 3; // Cliente por defecto para creación.
      // Intentamos seleccionar el primer tipo de documento si está disponible.
      if (widget.authController.documentTypes.isNotEmpty) {
        _selectedTipoIdentificacion = widget.authController.documentTypes.first.id;
      }
    }

    // Cargamos los tipos de identificación si no se han cargado aún.
    if (widget.authController.documentTypes.isEmpty) {
      widget.authController.loadDocumentTypes();
    }
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _apellidoController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _direccionController.dispose();
    _fechaNacimientoController.dispose();
    _numeroIdentificacionController.dispose();
    super.dispose();
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime(2000, 1, 1),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF0B4A8B),
              onPrimary: Colors.white,
              onSurface: Color(0xFF0B4A8B),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _fechaNacimientoController.text = _formatDate(picked);
      });
    }
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    if (_selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor, selecciona tu fecha de nacimiento.'),
          backgroundColor: Color(0xFFD92D20),
        ),
      );
      return;
    }

    final token = widget.authController.session?.token;
    if (token == null) return;

    bool success;
    if (_isEditing) {
      success = await widget.usersController.updateUser(
        token: token,
        id: widget.userToEdit!.id,
        nombre: _nombreController.text.trim(),
        apellido: _apellidoController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text.isEmpty ? null : _passwordController.text,
        direccion: _direccionController.text.trim(),
        fechaNacimiento: _formatDate(_selectedDate!),
        idRol: _selectedRol,
        idTipoIdentificacion: _selectedTipoIdentificacion,
        numeroIdentificacion: _numeroIdentificacionController.text.trim(),
      );
    } else {
      success = await widget.usersController.createUser(
        token: token,
        nombre: _nombreController.text.trim(),
        apellido: _apellidoController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        direccion: _direccionController.text.trim(),
        fechaNacimiento: _formatDate(_selectedDate!),
        idRol: _selectedRol!,
        idTipoIdentificacion: _selectedTipoIdentificacion!,
        numeroIdentificacion: _numeroIdentificacionController.text.trim(),
      );
    }

    if (mounted) {
      if (success) {
        final snackBar = SnackBar(
          content: Text(widget.usersController.successMessage ?? 'Operación realizada con éxito.'),
          backgroundColor: const Color(0xFF12B76A),
        );
        ScaffoldMessenger.of(context).showSnackBar(snackBar);
        Navigator.pop(context);
      } else {
        final snackBar = SnackBar(
          content: Text(widget.usersController.error ?? 'Ocurrió un error al guardar.'),
          backgroundColor: const Color(0xFFD92D20),
        );
        ScaffoldMessenger.of(context).showSnackBar(snackBar);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B4A8B),
        elevation: 0,
        title: Text(
          _isEditing ? 'Editar Usuario' : 'Nuevo Usuario',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: AnimatedBuilder(
        animation: Listenable.merge([widget.usersController, widget.authController]),
        builder: (context, _) {
          final isSaving = widget.usersController.isSaving;
          final docTypes = widget.authController.documentTypes;

          return Stack(
            children: [
              SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        _isEditing ? 'Modificar datos del usuario' : 'Completa la información del usuario',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0B4A8B),
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Nombre.
                      TextFormField(
                        controller: _nombreController,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'Nombre',
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                        validator: (value) =>
                            value == null || value.trim().isEmpty ? 'Ingresa el nombre.' : null,
                      ),
                      const SizedBox(height: 16),
                      // Apellido.
                      TextFormField(
                        controller: _apellidoController,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'Apellido',
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                        validator: (value) =>
                            value == null || value.trim().isEmpty ? 'Ingresa el apellido.' : null,
                      ),
                      const SizedBox(height: 16),
                      // Email.
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'Correo electrónico',
                          prefixIcon: Icon(Icons.alternate_email),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Ingresa el correo.';
                          }
                          final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
                          if (!emailRegex.hasMatch(value.trim())) {
                            return 'Ingresa un correo válido.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      // Contraseña (Solo requerida si no es edición).
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        textInputAction: TextInputAction.next,
                        decoration: InputDecoration(
                          labelText: _isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña',
                          prefixIcon: const Icon(Icons.lock_outline),
                          suffixIcon: IconButton(
                            icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                        ),
                        validator: (value) {
                          if (!_isEditing && (value == null || value.isEmpty)) {
                            return 'Ingresa la contraseña.';
                          }
                          if (value != null && value.isNotEmpty && value.length < 6) {
                            return 'La contraseña debe tener al menos 6 caracteres.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      // Dirección.
                      TextFormField(
                        controller: _direccionController,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'Dirección',
                          prefixIcon: Icon(Icons.location_on_outlined),
                        ),
                        validator: (value) =>
                            value == null || value.trim().isEmpty ? 'Ingresa la dirección.' : null,
                      ),
                      const SizedBox(height: 16),
                      // Fecha de nacimiento.
                      TextFormField(
                        controller: _fechaNacimientoController,
                        readOnly: true,
                        onTap: _selectDate,
                        decoration: const InputDecoration(
                          labelText: 'Fecha de nacimiento',
                          prefixIcon: Icon(Icons.calendar_today_outlined),
                        ),
                        validator: (value) =>
                            value == null || value.isEmpty ? 'Selecciona la fecha.' : null,
                      ),
                      const SizedBox(height: 16),
                      // Tipo de identificación.
                      DropdownButtonFormField<int>(
                        initialValue: docTypes.any(
                          (e) => e.id == _selectedTipoIdentificacion,
                        )
                            ? _selectedTipoIdentificacion
                            : null,
                        decoration: const InputDecoration(
                          labelText: 'Tipo de identificación',
                          prefixIcon: Icon(Icons.badge_outlined),
                        ),
                        items: docTypes.map((type) {
                          return DropdownMenuItem<int>(
                            value: type.id,
                            child: Text(type.nombre),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedTipoIdentificacion = value;
                          });
                        },
                        validator: (value) =>
                            value == null ? 'Selecciona el tipo de identificación.' : null,
                      ),
                      const SizedBox(height: 16),
                      // Número de identificación.
                      TextFormField(
                        controller: _numeroIdentificacionController,
                        keyboardType: TextInputType.number,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'Número de identificación',
                          prefixIcon: Icon(Icons.numbers),
                        ),
                        validator: (value) =>
                            value == null || value.trim().isEmpty ? 'Ingresa el número.' : null,
                      ),
                      const SizedBox(height: 16),
                      // Rol.
                      DropdownButtonFormField<int>(
                        initialValue: [1, 2, 3].contains(_selectedRol)
                            ? _selectedRol
                            : null,
                        decoration: const InputDecoration(
                          labelText: 'Rol del usuario',
                          prefixIcon: Icon(Icons.admin_panel_settings_outlined),
                        ),
                        items: const [
                          DropdownMenuItem<int>(
                            value: 1,
                            child: Text('Administrador'),
                          ),
                          DropdownMenuItem<int>(
                            value: 2,
                            child: Text('Empleado'),
                          ),
                          DropdownMenuItem<int>(
                            value: 3,
                            child: Text('Cliente'),
                          ),
                        ],
                        onChanged: (value) {
                          setState(() {
                            _selectedRol = value;
                          });
                        },
                        validator: (value) =>
                            value == null ? 'Selecciona el rol.' : null,
                      ),
                      const SizedBox(height: 32),
                      // Botón de guardar.
                      FilledButton(
                        onPressed: isSaving ? null : _submit,
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF0B4A8B),
                        ),
                        child: Text(_isEditing ? 'Actualizar Usuario' : 'Crear Usuario'),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
              if (isSaving)
                Container(
                  color: Colors.black26,
                  child: const Center(
                    child: CircularProgressIndicator(color: Color(0xFF0B4A8B)),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
