import 'package:mercapleno_appv1/features/users_admin/domain/entities/user_admin.dart';

class UserAdminModel extends UserAdmin {
  const UserAdminModel({
    required super.id,
    required super.nombre,
    required super.apellido,
    required super.email,
    required super.direccion,
    required super.fechaNacimiento,
    required super.rol,
    required super.tipoIdentificacion,
    required super.numeroIdentificacion,
    required super.idRol,
    required super.idTipoIdentificacion,
  });

  factory UserAdminModel.fromJson(Map<String, dynamic> json) {
    return UserAdminModel(
      id: json['id'] as int,
      nombre: json['nombre'] as String? ?? '',
      apellido: json['apellido'] as String? ?? '',
      email: json['email'] as String? ?? '',
      direccion: json['direccion'] as String? ?? '',
      fechaNacimiento: DateTime.parse(json['fecha_nacimiento'] as String),
      rol: json['rol'] as String?,
      tipoIdentificacion: json['tipo_identificacion'] as String?,
      numeroIdentificacion: json['numero_identificacion'] as String? ?? '',
      idRol: json['id_rol'] as int,
      idTipoIdentificacion: json['id_tipo_identificacion'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'nombre': nombre,
      'apellido': apellido,
      'email': email,
      'direccion': direccion,
      'fecha_nacimiento': fechaNacimiento.toIso8601String(),
      'rol': rol,
      'tipo_identificacion': tipoIdentificacion,
      'numero_identificacion': numeroIdentificacion,
      'id_rol': idRol,
      'id_tipo_identificacion': idTipoIdentificacion,
    };
  }
}
