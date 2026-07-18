class RegisterRequest {
  const RegisterRequest({
    required this.nombre,
    required this.apellido,
    required this.email,
    required this.password,
    required this.direccion,
    required this.fechaNacimiento,
    required this.idTipoIdentificacion,
    required this.numeroIdentificacion,
    this.idRol = 3,
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
}

