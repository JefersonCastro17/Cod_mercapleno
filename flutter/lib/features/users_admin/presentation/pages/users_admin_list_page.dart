import 'package:flutter/material.dart';
import 'package:mercapleno_appv1/features/auth/presentation/controllers/auth_controller.dart';
import 'package:mercapleno_appv1/features/users_admin/domain/entities/user_admin.dart';
import 'package:mercapleno_appv1/features/users_admin/presentation/controllers/users_admin_controller.dart';
import 'package:mercapleno_appv1/features/users_admin/presentation/pages/user_form_page.dart';

class UsersAdminListPage extends StatefulWidget {
  static const routeName = '/admin/users';

  const UsersAdminListPage({
    super.key,
    required this.usersController,
    required this.authController,
  });

  final UsersAdminController usersController;
  final AuthController authController;

  @override
  State<UsersAdminListPage> createState() => _UsersAdminListPageState();
}

class _UsersAdminListPageState extends State<UsersAdminListPage> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadData() {
    final token = widget.authController.session?.token;
    if (token != null) {
      widget.usersController.loadUsers(token: token);
    }
  }

  Future<void> _deleteUser(UserAdmin user) async {
    final token = widget.authController.session?.token;
    if (token == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar eliminación'),
        content: Text('¿Estás seguro de que deseas eliminar al usuario "${user.fullName}"? Esta acción no se puede deshacer.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFD92D20),
              padding: const EdgeInsets.symmetric(horizontal: 16),
            ),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final success = await widget.usersController.deleteUser(token: token, id: user.id);
      if (mounted) {
        final snackBar = SnackBar(
          content: Text(
            success
                ? 'Usuario eliminado correctamente.'
                : (widget.usersController.error ?? 'Error al eliminar el usuario.'),
          ),
          backgroundColor: success ? const Color(0xFF12B76A) : const Color(0xFFD92D20),
        );
        ScaffoldMessenger.of(context).showSnackBar(snackBar);
      }
    }
  }

  Widget _buildRoleBadge(int idRol, String? label) {
    final roleName = label ?? (idRol == 1 ? 'Administrador' : 'Usuario');
    final isAdmin = idRol == 1;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isAdmin ? const Color(0xFFE0ECF8) : const Color(0xFFFFF3CD),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isAdmin ? const Color(0xFFB7C7DA) : const Color(0xFFFFE69C),
        ),
      ),
      child: Text(
        roleName,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: isAdmin ? const Color(0xFF0B4A8B) : const Color(0xFF856404),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B4A8B),
        elevation: 0,
        title: const Text(
          'Gestión de Usuarios',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadData,
            tooltip: 'Actualizar lista',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(
            context,
            UserFormPage.routeName,
            arguments: UserFormPageArgs(
              usersController: widget.usersController,
              authController: widget.authController,
            ),
          );
        },
        backgroundColor: const Color(0xFFF59E0B),
        child: const Icon(Icons.person_add, color: Colors.white),
      ),
      body: Column(
        children: [
          // Barra de búsqueda.
          Container(
            color: const Color(0xFF0B4A8B),
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16, top: 8),
            child: TextField(
              controller: _searchController,
              onChanged: widget.usersController.search,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Buscar por nombre, correo o documento...',
                hintStyle: const TextStyle(color: Color(0xFFB3C8DF)),
                prefixIcon: const Icon(Icons.search, color: Color(0xFFB3C8DF)),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.white),
                        onPressed: () {
                          _searchController.clear();
                          widget.usersController.search('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: const Color(0x1F000000),
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(18),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(18),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(18),
                  borderSide: const BorderSide(color: Color(0xFFF59E0B), width: 1.4),
                ),
              ),
            ),
          ),
          // Lista de usuarios reactiva.
          Expanded(
            child: AnimatedBuilder(
              animation: widget.usersController,
              builder: (context, _) {
                final controller = widget.usersController;

                if (controller.isLoading && controller.users.isEmpty) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF0B4A8B)),
                  );
                }

                if (controller.error != null && controller.users.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, size: 60, color: Color(0xFFD92D20)),
                          const SizedBox(height: 16),
                          Text(
                            controller.error!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 16, color: Color(0xFF3F5874)),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: _loadData,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Reintentar'),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                if (controller.users.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.people_outline, size: 80, color: Colors.grey.shade400),
                          const SizedBox(height: 16),
                          const Text(
                            'No se encontraron usuarios.',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => _loadData(),
                  color: const Color(0xFF0B4A8B),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: controller.users.length,
                    itemBuilder: (context, index) {
                      final user = controller.users[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        elevation: 2,
                        shadowColor: Colors.black12,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CircleAvatar(
                                    backgroundColor: const Color(0xFF0B4A8B),
                                    child: Text(
                                      user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : 'U',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          user.fullName,
                                          style: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF0B4A8B),
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          user.email,
                                          style: TextStyle(
                                            fontSize: 13,
                                            color: Colors.grey.shade600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  _buildRoleBadge(user.idRol, user.rol),
                                ],
                              ),
                              const Divider(height: 20),
                              Row(
                                children: [
                                  Icon(Icons.badge, size: 16, color: Colors.grey.shade500),
                                  const SizedBox(width: 6),
                                  Text(
                                    '${user.tipoIdentificacion ?? "C.C."}: ${user.numeroIdentificacion}',
                                    style: const TextStyle(fontSize: 13),
                                  ),
                                ],
                              ),
                              if (user.direccion.isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    Icon(Icons.location_on, size: 16, color: Colors.grey.shade500),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Text(
                                        user.direccion,
                                        style: const TextStyle(fontSize: 13),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                              const SizedBox(height: 10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  TextButton.icon(
                                    onPressed: () {
                                      Navigator.pushNamed(
                                        context,
                                        UserFormPage.routeName,
                                        arguments: UserFormPageArgs(
                                          usersController: controller,
                                          authController: widget.authController,
                                          userToEdit: user,
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.edit, size: 18),
                                    label: const Text('Editar'),
                                  ),
                                  const SizedBox(width: 8),
                                  TextButton.icon(
                                    onPressed: () => _deleteUser(user),
                                    icon: const Icon(Icons.delete, size: 18),
                                    label: const Text('Eliminar'),
                                    style: TextButton.styleFrom(
                                      foregroundColor: const Color(0xFFD92D20),
                                    ),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
