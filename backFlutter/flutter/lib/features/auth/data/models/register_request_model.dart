import 'package:mercapleno_appv1/features/auth/domain/entities/register_request.dart';

class RegisterRequestModel {
  const RegisterRequestModel({
    required this.nombre,
    required this.apellido,
    required this.email,
    required this.password,
    required this.direccion,
    required this.fechaNacimiento,
    required this.idTipoIdentificacion,
    required this.numeroIdentificacion,
    required this.idRol,
  });

  final String nombre;
  final String apellido;
  final String email;
  final String password;
  final String direccion;
  final String fechaNacimiento;
  final int idTipoIdentificacion;
  final String numeroIdentificacion;
  final int idRol;

  factory RegisterRequestModel.fromEntity(RegisterRequest entity) {
    return RegisterRequestModel(
      nombre: entity.nombre,
      apellido: entity.apellido,
      email: entity.email,
      password: entity.password,
      direccion: entity.direccion,
      fechaNacimiento: entity.fechaNacimiento,
      idTipoIdentificacion: entity.idTipoIdentificacion,
      numeroIdentificacion: entity.numeroIdentificacion,
      idRol: entity.idRol,
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'nombre': nombre,
      'apellido': apellido,
      'email': email,
      'password': password,
      'direccion': direccion,
      'fecha_nacimiento': fechaNacimiento,
      'id_rol': idRol,
      'id_tipo_identificacion': idTipoIdentificacion,
      'numero_identificacion': numeroIdentificacion,
    };
  }
}
