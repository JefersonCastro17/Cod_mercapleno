import 'package:mercapleno_appv1/features/auth/domain/entities/auth_user.dart';

class AuthSession {
  const AuthSession({
    required this.token,
    required this.user,
  });

  final String token;
  final AuthUser user;
}

