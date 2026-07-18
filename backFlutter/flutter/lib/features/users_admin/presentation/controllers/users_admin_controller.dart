import 'package:flutter/material.dart';
import 'package:mercapleno_appv1/core/errors/api_exception.dart';
import 'package:mercapleno_appv1/features/users_admin/domain/entities/user_admin.dart';
import 'package:mercapleno_appv1/features/users_admin/domain/repositories/users_admin_repository.dart';

class UsersAdminController extends ChangeNotifier {
  UsersAdminController({required UsersAdminRepository repository}) : _repository = repository;

  final UsersAdminRepository _repository;

  List<UserAdmin> _users = const <UserAdmin>[];
  List<UserAdmin> _filteredUsers = const <UserAdmin>[];
  bool _isLoading = false;
  bool _isSaving = false;
  String? _error;
  String? _successMessage;
  String _searchQuery = '';

  List<UserAdmin> get users => _searchQuery.isEmpty ? _users : _filteredUsers;
  bool get isLoading => _isLoading;
  bool get isSaving => _isSaving;
  String? get error => _error;
  String? get successMessage => _successMessage;
  String get searchQuery => _searchQuery;

  void clearMessages() {
    _error = null;
    _successMessage = null;
  }

  void search(String query) {
    _searchQuery = query.trim().toLowerCase();
    if (_searchQuery.isEmpty) {
      _filteredUsers = const <UserAdmin>[];
    } else {
      _filteredUsers = _users.where((user) {
        final matchesName = user.fullName.toLowerCase().contains(_searchQuery);
        final matchesEmail = user.email.toLowerCase().contains(_searchQuery);
        final matchesDoc = user.numeroIdentificacion.contains(_searchQuery);
        return matchesName || matchesEmail || matchesDoc;
      }).toList();
    }
    notifyListeners();
  }

  Future<void> loadUsers({required String token}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _users = await _repository.getUsers(token: token);
      if (_searchQuery.isNotEmpty) {
        search(_searchQuery);
      }
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'No se pudieron cargar los usuarios.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createUser({
    required String token,
    required String nombre,
    required String apellido,
    required String email,
    required String password,
    required String direccion,
    required String fechaNacimiento,
    required int idRol,
    required int idTipoIdentificacion,
    required String numeroIdentificacion,
  }) async {
    _isSaving = true;
    _error = null;
    _successMessage = null;
    notifyListeners();

    try {
      await _repository.createUser(
        token: token,
        nombre: nombre,
        apellido: apellido,
        email: email,
        password: password,
        direccion: direccion,
        fechaNacimiento: fechaNacimiento,
        idRol: idRol,
        idTipoIdentificacion: idTipoIdentificacion,
        numeroIdentificacion: numeroIdentificacion,
      );
      _successMessage = 'Usuario creado con éxito.';
      await loadUsers(token: token);
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      return false;
    } catch (_) {
      _error = 'Ocurrió un error al crear el usuario.';
      return false;
    } finally {
      _isSaving = false;
      notifyListeners();
    }
  }

  Future<bool> updateUser({
    required String token,
    required int id,
    String? nombre,
    String? apellido,
    String? email,
    String? password,
    String? direccion,
    String? fechaNacimiento,
    int? idRol,
    int? idTipoIdentificacion,
    String? numeroIdentificacion,
  }) async {
    _isSaving = true;
    _error = null;
    _successMessage = null;
    notifyListeners();

    try {
      await _repository.updateUser(
        token: token,
        id: id,
        nombre: nombre,
        apellido: apellido,
        email: email,
        password: password,
        direccion: direccion,
        fechaNacimiento: fechaNacimiento,
        idRol: idRol,
        idTipoIdentificacion: idTipoIdentificacion,
        numeroIdentificacion: numeroIdentificacion,
      );
      _successMessage = 'Usuario actualizado con éxito.';
      await loadUsers(token: token);
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      return false;
    } catch (_) {
      _error = 'Ocurrió un error al actualizar el usuario.';
      return false;
    } finally {
      _isSaving = false;
      notifyListeners();
    }
  }

  Future<bool> deleteUser({required String token, required int id}) async {
    _error = null;
    _successMessage = null;
    notifyListeners();

    try {
      await _repository.deleteUser(token: token, id: id);
      _successMessage = 'Usuario eliminado con éxito.';
      await loadUsers(token: token);
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      return false;
    } catch (_) {
      _error = 'Ocurrió un error al eliminar el usuario.';
      return false;
    } finally {
      notifyListeners();
    }
  }
}
