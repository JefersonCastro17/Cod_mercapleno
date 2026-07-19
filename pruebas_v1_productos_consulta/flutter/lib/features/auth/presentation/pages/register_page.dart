import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/register_request.dart';
import 'package:mercapleno_appv1/features/auth/presentation/controllers/auth_controller.dart';
import 'package:mercapleno_appv1/features/auth/presentation/pages/auth_route_args.dart';
import 'package:mercapleno_appv1/features/auth/presentation/pages/login_page.dart';
import 'package:mercapleno_appv1/features/auth/presentation/widgets/auth_page_shell.dart';

class RegisterPage extends StatefulWidget {
  static const routeName = '/register';

  const RegisterPage({
    super.key,
    required this.controller,
    this.prefilledEmail,
  });

  final AuthController controller;
  final String? prefilledEmail;

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _registerFormKey = GlobalKey<FormState>();
  final _verifyEmailFormKey = GlobalKey<FormState>();

  final _registerNombreController = TextEditingController();
  final _registerApellidoController = TextEditingController();
  final _registerEmailController = TextEditingController();
  final _registerPasswordController = TextEditingController();
  final _registerDireccionController = TextEditingController();
  final _registerNumeroIdentificacionController = TextEditingController();
  final _registerBirthDateController = TextEditingController();
  final _verifyEmailController = TextEditingController();
  final _verifyCodeController = TextEditingController();

  int? _selectedDocumentTypeId;
  DateTime? _selectedBirthDate;
  AuthView? _lastView;
  String? _lastSyncedEmail;
  bool _isRoutingToLogin = false;

  @override
  void initState() {
    super.initState();
    if ((widget.prefilledEmail ?? '').trim().isNotEmpty) {
      _registerEmailController.text = widget.prefilledEmail!.trim();
    }
    unawaited(widget.controller.showRegister());
  }

  @override
  void dispose() {
    _registerNombreController.dispose();
    _registerApellidoController.dispose();
    _registerEmailController.dispose();
    _registerPasswordController.dispose();
    _registerDireccionController.dispose();
    _registerNumeroIdentificacionController.dispose();
    _registerBirthDateController.dispose();
    _verifyEmailController.dispose();
    _verifyCodeController.dispose();
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
        _handleLoginTransition(controller);

        return AuthPageShell(
          title: _titleFor(controller.currentView),
          subtitle: _subtitleFor(controller.currentView),
          errorMessage: controller.errorMessage,
          infoMessage: controller.infoMessage,
          showLoadingBar: controller.isLoadingDocumentTypes,
          switchLabel: 'Iniciar sesion',
          switchIcon: Icons.login,
          onSwitchPressed: controller.isSubmitting ? null : _openLoginPage,
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

  void _handleLoginTransition(AuthController controller) {
    if (_isRoutingToLogin || controller.currentView != AuthView.login || !mounted) {
      return;
    }

    _isRoutingToLogin = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }

      Navigator.of(context).pushReplacementNamed(
        LoginPage.routeName,
        arguments: LoginPageArgs(
          controller: widget.controller,
          prefilledEmail: controller.suggestedEmail,
          infoMessage: controller.infoMessage,
        ),
      );
    });
  }

  void _openLoginPage() {
    Navigator.of(context).pushReplacementNamed(
      LoginPage.routeName,
      arguments: LoginPageArgs(
        controller: widget.controller,
        prefilledEmail: _registerEmailController.text.trim(),
      ),
    );
  }

  Widget _buildCurrentForm(AuthController controller) {
    if (controller.currentView == AuthView.verifyEmail) {
      return _buildVerifyEmailForm(controller);
    }

    return _buildRegisterForm(controller);
  }

  Widget _buildRegisterForm(AuthController controller) {
    return Form(
      key: _registerFormKey,
      child: Column(
        key: const ValueKey('register_form'),
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _registerNombreController,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Nombre',
              prefixIcon: Icon(Icons.person_outline_rounded),
            ),
            validator: (value) => _validateRequired(value, 'Ingresa tu nombre.'),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _registerApellidoController,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Apellido',
              prefixIcon: Icon(Icons.badge_outlined),
            ),
            validator: (value) =>
                _validateRequired(value, 'Ingresa tu apellido.'),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<int>(
            initialValue: _selectedDocumentTypeId,
            items: controller.documentTypes
                .map(
                  (documentType) => DropdownMenuItem<int>(
                    value: documentType.id,
                    child: Text(documentType.nombre),
                  ),
                )
                .toList(growable: false),
            onChanged: controller.isSubmitting || controller.isLoadingDocumentTypes
                ? null
                : (value) {
                    setState(() {
                      _selectedDocumentTypeId = value;
                    });
                  },
            decoration: const InputDecoration(
              labelText: 'Tipo de identificacion',
              prefixIcon: Icon(Icons.credit_card_rounded),
            ),
            validator: (value) {
              if (value == null) {
                return 'Selecciona un tipo de identificacion.';
              }
              return null;
            },
          ),
          if (controller.documentTypesError != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Text(
                    controller.documentTypesError!,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: const Color(0xFFB42318),
                        ),
                  ),
                ),
                TextButton(
                  onPressed: controller.isLoadingDocumentTypes
                      ? null
                      : () => controller.loadDocumentTypes(force: true),
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          ],
          const SizedBox(height: 16),
          TextFormField(
            controller: _registerNumeroIdentificacionController,
            keyboardType: TextInputType.number,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Numero de identificacion',
              prefixIcon: Icon(Icons.numbers_rounded),
            ),
            validator: (value) => _validateRequired(
              value,
              'Ingresa tu numero de identificacion.',
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _registerBirthDateController,
            readOnly: true,
            onTap: _pickBirthDate,
            decoration: const InputDecoration(
              labelText: 'Fecha de nacimiento',
              prefixIcon: Icon(Icons.calendar_month_rounded),
            ),
            validator: (value) => _validateRequired(
              value,
              'Selecciona tu fecha de nacimiento.',
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _registerEmailController,
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
            controller: _registerDireccionController,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Direccion',
              prefixIcon: Icon(Icons.home_work_outlined),
            ),
            validator: (value) =>
                _validateRequired(value, 'Ingresa tu direccion.'),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _registerPasswordController,
            obscureText: true,
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(
              labelText: 'Contrasena',
              prefixIcon: Icon(Icons.lock_person_outlined),
            ),
            validator: _validatePassword,
            onFieldSubmitted: (_) => _submitRegister(controller),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: controller.isSubmitting || controller.isLoadingDocumentTypes
                ? null
                : () => _submitRegister(controller),
            child: _buildButtonChild(
              isLoading: controller.isSubmitting,
              label: 'Crear cuenta',
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: controller.isSubmitting ? null : _openLoginPage,
            child: const Text('Ya tengo cuenta'),
          ),
          TextButton(
            onPressed: controller.isSubmitting
                ? null
                : () => controller.showVerifyEmail(
                    email: _registerEmailController.text.trim(),
                  ),
            child: const Text('Ya tengo codigo de verificacion'),
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
            onPressed: controller.isSubmitting ? null : _openLoginPage,
            child: const Text('Volver al login'),
          ),
        ],
      ),
    );
  }

  Future<void> _pickBirthDate() async {
    final now = DateTime.now();
    final initialDate =
        _selectedBirthDate ?? DateTime(now.year - 18, now.month, now.day);
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1900),
      lastDate: now,
    );

    if (!mounted || pickedDate == null) {
      return;
    }

    setState(() {
      _selectedBirthDate = pickedDate;
      _registerBirthDateController.text = _formatDate(pickedDate);
    });
  }

  void _submitRegister(AuthController controller) {
    if (controller.isSubmitting) {
      return;
    }

    FocusScope.of(context).unfocus();
    if (!(_registerFormKey.currentState?.validate() ?? false)) {
      return;
    }

    final birthDate = _selectedBirthDate;
    if (birthDate == null) {
      return;
    }

    if (_calculateAge(birthDate) < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Debes tener al menos 10 anos para registrarte.'),
        ),
      );
      return;
    }

    final documentTypeId = _selectedDocumentTypeId;
    if (documentTypeId == null) {
      return;
    }

    controller.register(
      RegisterRequest(
        nombre: _registerNombreController.text.trim(),
        apellido: _registerApellidoController.text.trim(),
        email: _registerEmailController.text.trim(),
        password: _registerPasswordController.text,
        direccion: _registerDireccionController.text.trim(),
        fechaNacimiento: _registerBirthDateController.text,
        idTipoIdentificacion: documentTypeId,
        numeroIdentificacion:
            _registerNumeroIdentificacionController.text.trim(),
      ),
    );
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

  void _syncControllerState(AuthController controller) {
    final suggestedEmail = controller.suggestedEmail;
    if (suggestedEmail != null &&
        suggestedEmail.isNotEmpty &&
        suggestedEmail != _lastSyncedEmail) {
      _syncEmailController(_registerEmailController, suggestedEmail);
      _syncEmailController(_verifyEmailController, suggestedEmail);
      _lastSyncedEmail = suggestedEmail;
    }

    if (_lastView == controller.currentView) {
      return;
    }

    if (controller.currentView == AuthView.verifyEmail) {
      _verifyCodeController.clear();
      _isRoutingToLogin = false;
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
    if (view == AuthView.verifyEmail) {
      return 'Verificar correo';
    }
    return 'Crear cuenta';
  }

  String _subtitleFor(AuthView view) {
    if (view == AuthView.verifyEmail) {
      return 'Ingresa el codigo enviado a tu correo para activar la cuenta.';
    }
    return 'Registra tu usuario, valida tu correo y deja listo tu acceso.';
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

  int _calculateAge(DateTime birthDate) {
    final today = DateTime.now();
    var age = today.year - birthDate.year;
    final hasNotHadBirthday =
        today.month < birthDate.month ||
        (today.month == birthDate.month && today.day < birthDate.day);
    if (hasNotHadBirthday) {
      age -= 1;
    }
    return age;
  }

  String _formatDate(DateTime value) {
    final month = value.month.toString().padLeft(2, '0');
    final day = value.day.toString().padLeft(2, '0');
    return '${value.year}-$month-$day';
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
