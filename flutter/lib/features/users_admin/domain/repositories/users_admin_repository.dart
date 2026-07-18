import 'package:mercapleno_appv1/features/users_admin/domain/entities/user_admin.dart';

abstract class UsersAdminRepository {
  Future<List<UserAdmin>> getUsers({required String token});

  Future<void> createUser({
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
  });

  Future<void> updateUser({
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
  });

  Future<void> deleteUser({
    required String token,
    required int id,
  });
}
