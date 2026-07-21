import 'package:mercapleno_appv1/features/auth/domain/entities/auth_challenge.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/auth_session.dart';

class LoginResult {
  const LoginResult({
    required this.message,
    this.session,
    this.challenge,
  });

  final String message;
  final AuthSession? session;
  final AuthChallenge? challenge;

  bool get requiresTwoFactor => challenge != null;
}

