import 'package:mercapleno_appv1/features/auth/domain/entities/auth_user.dart';

class AuthUserModel {
  const AuthUserModel({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.email,
    required this.idRol,
    required this.emailVerified,
    this.rol,
    this.tipoDocumento,
  });

  final int id;
  final String nombre;
  final String apellido;
  final String email;
  final int idRol;
  final bool emailVerified;
  final String? rol;
  final String? tipoDocumento;

  factory AuthUserModel.fromJson(Map<String, dynamic> json) {
    return AuthUserModel(
      id: _asInt(json['id']),
      nombre: _asString(json['nombre']),
      apellido: _asString(json['apellido']),
      email: _asString(json['email']),
      idRol: _asInt(json['id_rol']),
      emailVerified: _asBool(json['email_verified']),
      rol: _asNullableString(json['rol']),
      tipoDocumento: _asNullableString(json['tipo_documento']),
    );
  }

  factory AuthUserModel.fromEntity(AuthUser entity) {
    return AuthUserModel(
      id: entity.id,
      nombre: entity.nombre,
      apellido: entity.apellido,
      email: entity.email,
      idRol: entity.idRol,
      emailVerified: entity.emailVerified,
      rol: entity.rol,
      tipoDocumento: entity.tipoDocumento,
    );
  }

  AuthUser toEntity() {
    return AuthUser(
      id: id,
      nombre: nombre,
      apellido: apellido,
      email: email,
      idRol: idRol,
      emailVerified: emailVerified,
      rol: rol,
      tipoDocumento: tipoDocumento,
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'nombre': nombre,
      'apellido': apellido,
      'email': email,
      'id_rol': idRol,
      'email_verified': emailVerified,
      'rol': rol,
      'tipo_documento': tipoDocumento,
    };
  }

  static int _asInt(dynamic value) {
    if (value is int) {
      return value;
    }

    if (value is String) {
      return int.tryParse(value) ?? 0;
    }

    return 0;
  }

  static bool _asBool(dynamic value) {
    if (value is bool) {
      return value;
    }

    if (value is num) {
      return value != 0;
    }

    if (value is String) {
      return value.toLowerCase() == 'true' || value == '1';
    }

    return false;
  }

  static String _asString(dynamic value) {
    if (value is String) {
      return value;
    }
    return '';
  }

  static String? _asNullableString(dynamic value) {
    if (value is String && value.trim().isNotEmpty) {
      return value;
    }
    return null;
  }
}
