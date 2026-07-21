import 'package:mercapleno_appv1/features/auth/presentation/controllers/auth_controller.dart';

class LoginPageArgs {
  final AuthController controller;
  final String? prefilledEmail;
  final String? infoMessage;

  LoginPageArgs({
    required this.controller,
    this.prefilledEmail,
    this.infoMessage,
  });
}

class RegisterPageArgs {
  final AuthController controller;
  final String? prefilledEmail;

  RegisterPageArgs({
    required this.controller,
    this.prefilledEmail,
  });
}
