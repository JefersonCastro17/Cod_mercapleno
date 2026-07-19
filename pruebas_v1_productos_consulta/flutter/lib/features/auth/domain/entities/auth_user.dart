class AuthUser {
  const AuthUser({
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

  String get fullName {
    final value = '$nombre $apellido'.trim();
    return value.isEmpty ? email : value;
  }
}

