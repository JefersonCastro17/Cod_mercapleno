import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:mercapleno_appv1/core/errors/api_exception.dart';

/// Representa un fallo manejable en la aplicación.
abstract class Failure extends Equatable {
  final String message;
  const Failure(this.message);

  @override
  List<Object?> get props => [message];

  @override
  String toString() => message;
}

class ApiFailure extends Failure {
  final int? statusCode;
  final Map<String, dynamic>? data;

  const ApiFailure(String message, {this.statusCode, this.data}) : super(message);

  @override
  List<Object?> get props => [message, statusCode, data];
}

class NoConnectionFailure extends Failure {
  const NoConnectionFailure([String message = 'Sin conexión a internet.']) : super(message);
}

class TimeoutFailure extends Failure {
  const TimeoutFailure([String message = 'Tiempo de espera agotado.']) : super(message);
}

class FormatFailure extends Failure {
  const FormatFailure([String message = 'Formato de respuesta inválido.']) : super(message);
}

class CacheFailure extends Failure {
  const CacheFailure([String message = 'Error de almacenamiento local.']) : super(message);
}

class UnexpectedFailure extends Failure {
  const UnexpectedFailure([String message = 'Ocurrió un error inesperado.']) : super(message);
}

/// Convierte una excepción/objeto de error en un [Failure] controlado.
Failure failureFrom(Object error) {
  if (error is ApiException) {
    return ApiFailure(error.message, statusCode: error.statusCode, data: error.data);
  }

  if (error is TimeoutException) {
    return const TimeoutFailure();
  }

  if (error is FormatException) {
    return const FormatFailure();
  }

  final raw = error.toString();
  if (raw.contains('SocketException') ||
      raw.contains('Connection refused') ||
      raw.contains('Failed host lookup')) {
    return const NoConnectionFailure();
  }

  return const UnexpectedFailure();
}
