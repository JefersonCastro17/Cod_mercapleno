import 'package:mercapleno_appv1/features/users_admin/data/datasources/users_admin_remote_data_source.dart';
import 'package:mercapleno_appv1/features/users_admin/data/models/user_admin_model.dart';
import 'package:mercapleno_appv1/features/users_admin/domain/entities/user_admin.dart';
import 'package:mercapleno_appv1/features/users_admin/domain/repositories/users_admin_repository.dart';

class UsersAdminRepositoryImpl implements UsersAdminRepository {
  UsersAdminRepositoryImpl({required UsersAdminRemoteDataSource remoteDataSource})
    : _remoteDataSource = remoteDataSource;

  final UsersAdminRemoteDataSource _remoteDataSource;

  @override
  Future<List<UserAdmin>> getUsers({required String token}) async {
    final data = await _remoteDataSource.getUsers(token: token);
    final rawList = data['usuarios'];

    if (rawList is! List) {
      return const <UserAdmin>[];
    }

    return rawList
        .whereType<Map>()
        .map((item) => UserAdminModel.fromJson(item.cast<String, dynamic>()))
        .toList();
  }

  @override
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
  }) async {
    await _remoteDataSource.createUser(
      token: token,
      body: <String, dynamic>{
        'nombre': nombre,
        'apellido': apellido,
        'email': email,
        'password': password,
        'direccion': direccion,
        'fecha_nacimiento': fechaNacimiento,
        'id_rol': idRol,
        'id_tipo_identificacion': idTipoIdentificacion,
        'numero_identificacion': numeroIdentificacion,
      },
    );
  }

  @override
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
  }) async {
    final body = <String, dynamic>{};
    if (nombre != null) body['nombre'] = nombre;
    if (apellido != null) body['apellido'] = apellido;
    if (email != null) body['email'] = email;
    if (password != null && password.trim().isNotEmpty) body['password'] = password;
    if (direccion != null) body['direccion'] = direccion;
    if (fechaNacimiento != null) body['fecha_nacimiento'] = fechaNacimiento;
    if (idRol != null) body['id_rol'] = idRol;
    if (idTipoIdentificacion != null) {
      body['id_tipo_identificacion'] = idTipoIdentificacion;
    }
    if (numeroIdentificacion != null) {
      body['numero_identificacion'] = numeroIdentificacion;
    }

    await _remoteDataSource.updateUser(token: token, id: id, body: body);
  }

  @override
  Future<void> deleteUser({required String token, required int id}) async {
    await _remoteDataSource.deleteUser(token: token, id: id);
  }
}
