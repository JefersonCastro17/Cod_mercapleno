import 'package:equatable/equatable.dart';

class UserAdmin extends Equatable {
  const UserAdmin({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.email,
    required this.direccion,
    required this.fechaNacimiento,
    required this.rol,
    required this.tipoIdentificacion,
    required this.numeroIdentificacion,
    required this.idRol,
    required this.idTipoIdentificacion,
  });

  final int id;
  final String nombre;
  final String apellido;
  final String email;
  final String direccion;
  final DateTime fechaNacimiento;
  final String? rol;
  final String? tipoIdentificacion;
  final String numeroIdentificacion;
  final int idRol;
  final int idTipoIdentificacion;

  String get fullName {
    final value = '$nombre $apellido'.trim();
    return value.isEmpty ? email : value;
  }

  @override
  List<Object?> get props => [
        id,
        nombre,
        apellido,
        email,
        direccion,
        fechaNacimiento,
        rol,
        tipoIdentificacion,
        numeroIdentificacion,
        idRol,
        idTipoIdentificacion,
      ];
}
