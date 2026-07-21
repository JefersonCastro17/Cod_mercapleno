import 'package:flutter/material.dart';
import 'package:mercapleno_appv1/features/auth/presentation/controllers/auth_controller.dart';
import 'package:mercapleno_appv1/features/auth/presentation/pages/auth_route_args.dart';
import 'package:mercapleno_appv1/features/auth/presentation/pages/register_page.dart';
import 'package:mercapleno_appv1/features/auth/presentation/widgets/auth_page_shell.dart';

class LoginPage extends StatefulWidget {
  static const routeName = '/login';
  const LoginPage({
    super.key,
    required this.controller,
    this.prefilledEmail,
    this.infoMessage,
  });

  final AuthController controller;
  final String? prefilledEmail;
  final String? infoMessage;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _loginFormKey = GlobalKey<FormState>();
  final _twoFactorFormKey = GlobalKey<FormState>();
  final _verifyEmailFormKey = GlobalKey<FormState>();
  final _requestResetFormKey = GlobalKey<FormState>();
  final _resetPasswordFormKey = GlobalKey<FormState>();

  final _loginEmailController = TextEditingController();
  final _loginPasswordController = TextEditingController();
  final _twoFactorCodeController = TextEditingController();
  final _verifyEmailController = TextEditingController();
  final _verifyCodeController = TextEditingController();
  final _requestResetEmailController = TextEditingController();
  final _resetEmailController = TextEditingController();
  final _resetCodeController = TextEditingController();
  final _resetPasswordController = TextEditingController();
  final _resetConfirmPasswordController = TextEditingController();

  AuthView? _lastView;
  String? _lastSyncedEmail;

  @override
  void initState() {
    super.initState();
    widget.controller.showLogin(
      email: widget.prefilledEmail,
      infoMessage: widget.infoMessage,
    );
  }

  @override
  void dispose() {
    _loginEmailController.dispose();
    _loginPasswordController.dispose();
    _twoFactorCodeController.dispose();
    _verifyEmailController.dispose();
    _verifyCodeController.dispose();
    _requestResetEmailController.dispose();
    _resetEmailController.dispose();
    _resetCodeController.dispose();
    _resetPasswordController.dispose();
    _resetConfirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.controller,
      builder: (context, _) {
        final controller = widget.controller;
        _syncControllerState(controller);
        _handleAuthenticatedState(controller);

        final view = controller.currentView;
        final title = _titleFor(view);
        final subtitle = _subtitleFor(view);

        return AuthPageShell(
          title: title,
          subtitle: subtitle,
          errorMessage: controller.errorMessage,
          infoMessage: controller.infoMessage,
          switchLabel: 'Registrarme',
          switchIcon: Icons.person_add,
          onSwitchPressed: controller.isSubmitting ? null : _openRegisterPage,
          child: _buildCurrentForm(controller),
        );
      },
    );
  }

  void _handleAuthenticatedState(AuthController controller) {
    if (!controller.isAuthenticated || !mounted) {
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }

      final navigator = Navigator.of(context);
      if (navigator.canPop()) {
        navigator.popUntil((route) => route.isFirst);
      }
    });
  }

  void _openRegisterPage() {
    Navigator.of(context).pushReplacementNamed(
      RegisterPage.routeName,
      arguments: RegisterPageArgs(
        controller: widget.controller,
        prefilledEmail: _loginEmailController.text.trim(),
      ),
    );
  }

  Widget _buildCurrentForm(AuthController controller) {
    switch (controller.currentView) {
      case AuthView.twoFactor:
        return _buildTwoFactorForm(controller);
      case AuthView.verifyEmail:
        return _buildVerifyEmailForm(controller);
      case AuthView.requestPasswordReset:
        return _buildRequestResetForm(controller);
      case AuthView.resetPassword:
        return _buildResetPasswordForm(controller);
      case AuthView.register:
      case AuthView.login:
        return _buildLoginForm(controller);
    }
  }

  Widget _buildLoginForm(AuthController controller) {
    return Form(
      key: _loginFormKey,
      child: Column(
        key: const ValueKey('login_form'),
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _loginEmailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Correo electronico',
              hintText: 'correo@mercapleno.com',
              prefixIcon: Icon(Icons.alternate_email_rounded),
            ),
            validator: _validateEmail,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _loginPasswordController,
            obscureText: true,
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(
              labelText: 'Contrasena',
              hintText: 'Ingresa tu contrasena',
              prefixIcon: Icon(Icons.lock_outline_rounded),
            ),
            validator: (value) =>
                _validateRequired(value, 'Ingresa tu contrasena.'),
            onFieldSubmitted: (_) => _submitLogin(controller),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: controller.isSubmitting
                ? null
                : () => _submitLogin(controller),
            child: _buildButtonChild(
              isLoading: controller.isSubmitting,
              label: 'Ingresar',
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: controller.isSubmitting ? null : _openRegisterPage,
            child: const Text('Crear cuenta'),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              TextButton(
                onPressed: controller.isSubmitting
                    ? null
                    : () => controller.showVerifyEmail(
                        email: _loginEmailController.text.trim(),
                      ),
                child: const Text('Verificar correo'),
              ),
              TextButton(
                onPressed: controller.isSubmitting
                    ? null
                    : () => controller.showForgotPassword(
                        email: _loginEmailController.text.trim(),
                      ),
                child: const Text('Olvide mi contrasena'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTwoFactorForm(AuthController controller) {
    final challenge = controller.challenge;

    return Form(
      key: _twoFactorFormKey,
      child: Column(
        key: const ValueKey('two_factor_form'),
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFFDF7E8),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFF7D287)),
            ),
            child: Text(
              'Ingresa el codigo enviado a ${challenge?.email ?? _loginEmailController.text.trim()}'
              '${challenge?.expiresInMinutes != null ? '. Vence en ${challenge!.expiresInMinutes} minutos.' : ''}',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF805400),
                    height: 1.5,
                  ),
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _twoFactorCodeController,
            keyboardType: TextInputType.number,
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(
              labelText: 'Codigo de seguridad',
              hintText: 'Ejemplo: 123456',
              prefixIcon: Icon(Icons.password_rounded),
            ),
            validator: _validateCode,
            onFieldSubmitted: (_) => _submitTwoFactor(controller),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: controller.isSubmitting
                ? null
                : () => _submitTwoFactor(controller),
            child: _buildButtonChild(
              isLoading: controller.isSubmitting,
              label: 'Verificar codigo',
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: controller.isSubmitting
                ? null
                : controller.cancelTwoFactorFlow,
            child: const Text('Volver al login'),
          ),
        ],
      ),
    );
  }

  Widget _buildVerifyEmailForm(AuthController controller) {
    return Form(
      key: _verifyEmailFormKey,
      child: Column(
        key: const ValueKey('verify_email_form'),
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _verifyEmailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Correo electronico',
              prefixIcon: Icon(Icons.mail_outline_rounded),
            ),
            validator: _validateEmail,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _verifyCodeController,
            keyboardType: TextInputType.number,
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(
              labelText: 'Codigo',
              hintText: '6 digitos',
              prefixIcon: Icon(Icons.verified_outlined),
            ),
            validator: _validateCode,
            onFieldSubmitted: (_) => _submitVerifyEmail(controller),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: controller.isSubmitting
                ? null
                : () => _submitVerifyEmail(controller),
            child: _buildButtonChild(
              isLoading: controller.isSubmitting,
              label: 'Verificar correo',
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: controller.isSubmitting
                ? null
                : () => controller.resendVerification(
                    email: _verifyEmailController.text.trim(),
                  ),
            child: const Text('Reenviar codigo'),
          ),
          TextButton(
            onPressed: controller.isSubmitting
                ? null
                : () => controller.showLogin(
                    email: _verifyEmailController.text.trim(),
                  ),
            child: const Text('Volver al login'),
          ),
        ],
      ),
    );
  }

  Widget _buildRequestResetForm(AuthController controller) {
    return Form(
      key: _requestResetFormKey,
      child: Column(
        key: const ValueKey('request_reset_form'),
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _requestResetEmailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(
              labelText: 'Correo electronico',
              prefixIcon: Icon(Icons.alternate_email_rounded),
            ),
            validator: _validateEmail,
            onFieldSubmitted: (_) => _submitRequestReset(controller),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: controller.isSubmitting
                ? null
                : () => _submitRequestReset(controller),
            child: _buildButtonChild(
              isLoading: controller.isSubmitting,
              label: 'Enviar codigo',
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: controller.isSubmitting
                ? null
                : () => controller.showLogin(
                    email: _requestResetEmailController.text.trim(),
                  ),
            child: const Text('Volver al login'),
          ),
        ],
      ),
    );
  }

  Widget _buildResetPasswordForm(AuthController controller) {
    return Form(
      key: _resetPasswordFormKey,
      child: Column(
        key: const ValueKey('reset_password_form'),
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _resetEmailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Correo electronico',
              prefixIcon: Icon(Icons.mail_outline_rounded),
            ),
            validator: _validateEmail,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _resetCodeController,
            keyboardType: TextInputType.number,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Codigo',
              hintText: '6 digitos',
              prefixIcon: Icon(Icons.password_rounded),
            ),
            validator: _validateCode,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _resetPasswordController,
            obscureText: true,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Nueva contrasena',
              prefixIcon: Icon(Icons.lock_reset_outlined),
            ),
            validator: _validatePassword,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _resetConfirmPasswordController,
            obscureText: true,
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(
              labelText: 'Confirmar contrasena',
              prefixIcon: Icon(Icons.lock_outline_rounded),
            ),
            validator: (value) {
              final requiredMessage =
                  _validateRequired(value, 'Confirma tu nueva contrasena.');
              if (requiredMessage != null) {
                return requiredMessage;
              }

              if (value != _resetPasswordController.text) {
                return 'Las contrasenas no coinciden.';
              }

              return null;
            },
            onFieldSubmitted: (_) => _submitResetPassword(controller),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: controller.isSubmitting
                ? null
                : () => _submitResetPassword(controller),
            child: _buildButtonChild(
              isLoading: controller.isSubmitting,
              label: 'Actualizar contrasena',
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: controller.isSubmitting
                ? null
                : () => controller.showForgotPassword(
                    email: _resetEmailController.text.trim(),
                  ),
            child: const Text('Solicitar un nuevo codigo'),
          ),
          TextButton(
            onPressed: controller.isSubmitting
                ? null
                : () => controller.showLogin(
                    email: _resetEmailController.text.trim(),
                  ),
            child: const Text('Volver al login'),
          ),
        ],
      ),
    );
  }

  void _submitLogin(AuthController controller) {
    if (controller.isSubmitting) {
      return;
    }

    FocusScope.of(context).unfocus();
    if (!(_loginFormKey.currentState?.validate() ?? false)) {
      return;
    }

    controller.loginWithCredentials(
      email: _loginEmailController.text.trim(),
      password: _loginPasswordController.text,
    );
  }

  void _submitTwoFactor(AuthController controller) {
    if (controller.isSubmitting) {
      return;
    }

    FocusScope.of(context).unfocus();
    if (!(_twoFactorFormKey.currentState?.validate() ?? false)) {
      return;
    }

    controller.verifyTwoFactorCode(_twoFactorCodeController.text.trim());
  }

  void _submitVerifyEmail(AuthController controller) {
    if (controller.isSubmitting) {
      return;
    }

    FocusScope.of(context).unfocus();
    if (!(_verifyEmailFormKey.currentState?.validate() ?? false)) {
      return;
    }

    controller.verifyEmail(
      email: _verifyEmailController.text.trim(),
      code: _verifyCodeController.text.trim(),
    );
  }

  void _submitRequestReset(AuthController controller) {
    if (controller.isSubmitting) {
      return;
    }

    FocusScope.of(context).unfocus();
    if (!(_requestResetFormKey.currentState?.validate() ?? false)) {
      return;
    }

    controller.requestPasswordReset(
      email: _requestResetEmailController.text.trim(),
    );
  }

  void _submitResetPassword(AuthController controller) {
    if (controller.isSubmitting) {
      return;
    }

    FocusScope.of(context).unfocus();
    if (!(_resetPasswordFormKey.currentState?.validate() ?? false)) {
      return;
    }

    controller.resetPassword(
      email: _resetEmailController.text.trim(),
      code: _resetCodeController.text.trim(),
      newPassword: _resetPasswordController.text,
      confirmPassword: _resetConfirmPasswordController.text,
    );
  }

  void _syncControllerState(AuthController controller) {
    final suggestedEmail = controller.suggestedEmail;
    if (suggestedEmail != null &&
        suggestedEmail.isNotEmpty &&
        suggestedEmail != _lastSyncedEmail) {
      _syncEmailController(_loginEmailController, suggestedEmail);
      _syncEmailController(_verifyEmailController, suggestedEmail);
      _syncEmailController(_requestResetEmailController, suggestedEmail);
      _syncEmailController(_resetEmailController, suggestedEmail);
      _lastSyncedEmail = suggestedEmail;
    }

    if (_lastView == controller.currentView) {
      return;
    }

    if (controller.currentView == AuthView.twoFactor) {
      _twoFactorCodeController.clear();
    }

    if (controller.currentView == AuthView.verifyEmail) {
      _verifyCodeController.clear();
    }

    if (controller.currentView == AuthView.resetPassword) {
      _resetCodeController.clear();
      _resetPasswordController.clear();
      _resetConfirmPasswordController.clear();
    }

    if (controller.currentView == AuthView.requestPasswordReset &&
        suggestedEmail != null &&
        suggestedEmail.isNotEmpty) {
      _requestResetEmailController.text = suggestedEmail;
    }

    _lastView = controller.currentView;
  }

  void _syncEmailController(TextEditingController controller, String email) {
    final currentValue = controller.text.trim();
    if (currentValue.isEmpty || currentValue == (_lastSyncedEmail ?? '')) {
      controller.text = email;
    }
  }

  String _titleFor(AuthView view) {
    switch (view) {
      case AuthView.login:
      case AuthView.register:
        return 'Iniciar sesion';
      case AuthView.twoFactor:
        return 'Verificacion de seguridad';
      case AuthView.verifyEmail:
        return 'Verificar correo';
      case AuthView.requestPasswordReset:
        return 'Recuperar contrasena';
      case AuthView.resetPassword:
        return 'Actualizar contrasena';
    }
  }

  String _subtitleFor(AuthView view) {
    switch (view) {
      case AuthView.login:
      case AuthView.register:
        return 'Accede desde Flutter usando el backend actual de Mercapleno.';
      case AuthView.twoFactor:
        return 'Completa el segundo factor para terminar tu acceso.';
      case AuthView.verifyEmail:
        return 'Ingresa el codigo enviado a tu correo para activar la cuenta.';
      case AuthView.requestPasswordReset:
        return 'Solicita un codigo para recuperar tu contrasena.';
      case AuthView.resetPassword:
        return 'Ingresa el codigo recibido y define tu nueva contrasena.';
    }
  }

  String? _validateEmail(String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty) {
      return 'Ingresa tu correo.';
    }

    final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!emailRegex.hasMatch(email)) {
      return 'Ingresa un correo valido.';
    }

    return null;
  }

  String? _validatePassword(String? value) {
    final password = value ?? '';
    if (password.isEmpty) {
      return 'Ingresa una contrasena.';
    }

    if (password.length < 6) {
      return 'La contrasena debe tener al menos 6 caracteres.';
    }

    return null;
  }

  String? _validateCode(String? value) {
    final code = value?.trim() ?? '';
    if (code.isEmpty) {
      return 'Ingresa el codigo recibido.';
    }

    if (code.length != 6) {
      return 'El codigo debe tener 6 digitos.';
    }

    return null;
  }

  String? _validateRequired(String? value, String message) {
    if ((value ?? '').trim().isEmpty) {
      return message;
    }
    return null;
  }

  Widget _buildButtonChild({
    required bool isLoading,
    required String label,
  }) {
    if (!isLoading) {
      return Text(label);
    }

    return const SizedBox(
      width: 22,
      height: 22,
      child: CircularProgressIndicator(
        strokeWidth: 2.4,
        color: Colors.white,
      ),
    );
  }
}
