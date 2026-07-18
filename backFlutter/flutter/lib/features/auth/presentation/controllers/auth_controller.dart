import 'package:flutter/material.dart';
import 'package:mercapleno_appv1/core/errors/api_exception.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/auth_challenge.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/auth_session.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/document_type.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/register_request.dart';
import 'package:mercapleno_appv1/features/auth/domain/repositories/auth_repository.dart';

enum AuthView {
  login,
  twoFactor,
  register,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
}

class AuthController extends ChangeNotifier {
  AuthController({required AuthRepository repository}) : _repository = repository;

  final AuthRepository _repository;

  // Estado principal del flujo de autenticacion.
  AuthSession? _session;
  AuthChallenge? _challenge;
  AuthView _currentView = AuthView.login;
  bool _isInitializing = true;
  bool _isSubmitting = false;
  bool _isLoadingDocumentTypes = false;
  String? _errorMessage;
  String? _infoMessage;
  String? _suggestedEmail;
  String? _documentTypesError;
  List<DocumentType> _documentTypes = const <DocumentType>[];

  AuthSession? get session => _session;
  AuthChallenge? get challenge => _challenge;
  AuthView get currentView => _currentView;
  bool get isInitializing => _isInitializing;
  bool get isSubmitting => _isSubmitting;
  bool get isAuthenticated => _session != null;
  bool get isLoadingDocumentTypes => _isLoadingDocumentTypes;
  String? get errorMessage => _errorMessage;
  String? get infoMessage => _infoMessage;
  String? get suggestedEmail => _suggestedEmail;
  String? get documentTypesError => _documentTypesError;
  List<DocumentType> get documentTypes => _documentTypes;

  // Al arrancar la app intenta recuperar una sesion previa.
  Future<void> initialize() async {
    try {
      _session = await _repository.restoreSession();
    } finally {
      _isInitializing = false;
      notifyListeners();
    }
  }

  // Puede terminar en sesion valida o en un paso extra de 2FA.
  Future<void> loginWithCredentials({
    required String email,
    required String password,
  }) async {
    if (_isSubmitting) {
      return;
    }

    _clearFeedback();
    _isSubmitting = true;
    notifyListeners();

    try {
      final result = await _repository.login(email: email, password: password);
      _infoMessage = result.message;
      _suggestedEmail = email;

      if (result.requiresTwoFactor) {
        _challenge = result.challenge;
        _currentView = AuthView.twoFactor;
      } else {
        _challenge = null;
        _session = result.session;
        _currentView = AuthView.login;
      }
    } on ApiException catch (error) {
      _handleApiError(error, fallbackEmail: email);
    } catch (_) {
      _errorMessage = 'Ocurrio un error inesperado. Intenta nuevamente.';
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  Future<void> verifyTwoFactorCode(String code) async {
    if (_isSubmitting) {
      return;
    }

    final activeChallenge = _challenge;
    if (activeChallenge == null) {
      _errorMessage =
          'La verificacion ya no esta activa. Inicia sesion otra vez.';
      notifyListeners();
      return;
    }

    _clearFeedback();
    _isSubmitting = true;
    notifyListeners();

    try {
      _session = await _repository.verifyLoginCode(
        pendingToken: activeChallenge.pendingToken,
        code: code,
      );
      _challenge = null;
      _currentView = AuthView.login;
      _infoMessage = 'Inicio de sesion exitoso.';
      _suggestedEmail = _session?.user.email;
    } on ApiException catch (error) {
      if (error.statusCode == 400 || error.statusCode == 401) {
        _challenge = null;
        _currentView = AuthView.login;
        _infoMessage = 'La verificacion expiro. Vuelve a iniciar sesion.';
      }
      _errorMessage = error.message;
    } catch (_) {
      _errorMessage = 'Ocurrio un error inesperado. Intenta nuevamente.';
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  // Cambia a registro y carga catalogos auxiliares si hacen falta.
  Future<void> showRegister() async {
    _challenge = null;
    _currentView = AuthView.register;
    _clearFeedback();
    notifyListeners();

    if (_documentTypes.isEmpty) {
      await loadDocumentTypes();
    }
  }

  void showLogin({String? email, String? infoMessage}) {
    _challenge = null;
    _currentView = AuthView.login;
    _suggestedEmail = email ?? _suggestedEmail;
    _clearFeedback();
    _infoMessage = infoMessage;
    notifyListeners();
  }

  void showVerifyEmail({String? email}) {
    _challenge = null;
    _currentView = AuthView.verifyEmail;
    _suggestedEmail = email ?? _suggestedEmail;
    _clearFeedback();
    notifyListeners();
  }

  void showForgotPassword({String? email}) {
    _challenge = null;
    _currentView = AuthView.requestPasswordReset;
    _suggestedEmail = email ?? _suggestedEmail;
    _clearFeedback();
    notifyListeners();
  }

  void showResetPassword({String? email}) {
    _challenge = null;
    _currentView = AuthView.resetPassword;
    _suggestedEmail = email ?? _suggestedEmail;
    _clearFeedback();
    notifyListeners();
  }

  // Lee los tipos de identificacion y evita repetir trabajo innecesario.
  Future<void> loadDocumentTypes({bool force = false}) async {
    if (_isLoadingDocumentTypes) {
      return;
    }

    if (!force && _documentTypes.isNotEmpty) {
      return;
    }

    _isLoadingDocumentTypes = true;
    _documentTypesError = null;
    notifyListeners();

    try {
      _documentTypes = await _repository.getDocumentTypes();
    } on ApiException catch (error) {
      _documentTypesError = error.message;
    } catch (_) {
      _documentTypesError =
          'No se pudieron cargar los tipos de identificacion.';
    } finally {
      _isLoadingDocumentTypes = false;
      notifyListeners();
    }
  }

  Future<void> register(RegisterRequest request) async {
    if (_isSubmitting) {
      return;
    }

    _clearFeedback();
    _isSubmitting = true;
    notifyListeners();

    try {
      final feedback = await _repository.register(request);
      _suggestedEmail = request.email;
      _currentView = AuthView.verifyEmail;
      _infoMessage = feedback.message;
    } on ApiException catch (error) {
      _errorMessage = error.message;
    } catch (_) {
      _errorMessage = 'Ocurrio un error inesperado. Intenta nuevamente.';
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  Future<void> verifyEmail({
    required String email,
    required String code,
  }) async {
    if (_isSubmitting) {
      return;
    }

    _clearFeedback();
    _isSubmitting = true;
    notifyListeners();

    try {
      final feedback = await _repository.verifyEmail(email: email, code: code);
      _suggestedEmail = email;
      _currentView = AuthView.login;
      _infoMessage = feedback.message;
    } on ApiException catch (error) {
      _errorMessage = error.message;
    } catch (_) {
      _errorMessage = 'Ocurrio un error inesperado. Intenta nuevamente.';
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  Future<void> resendVerification({required String email}) async {
    if (_isSubmitting) {
      return;
    }

    _clearFeedback();
    _isSubmitting = true;
    notifyListeners();

    try {
      final feedback = await _repository.resendVerification(email: email);
      _suggestedEmail = email;
      _infoMessage = feedback.message;
    } on ApiException catch (error) {
      _errorMessage = error.message;
    } catch (_) {
      _errorMessage = 'Ocurrio un error inesperado. Intenta nuevamente.';
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  Future<void> requestPasswordReset({required String email}) async {
    if (_isSubmitting) {
      return;
    }

    _clearFeedback();
    _isSubmitting = true;
    notifyListeners();

    try {
      final feedback = await _repository.requestPasswordReset(email: email);
      _suggestedEmail = email;
      _currentView = AuthView.resetPassword;
      _infoMessage = feedback.message;
    } on ApiException catch (error) {
      _errorMessage = error.message;
    } catch (_) {
      _errorMessage = 'Ocurrio un error inesperado. Intenta nuevamente.';
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  Future<void> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    if (_isSubmitting) {
      return;
    }

    _clearFeedback();
    _isSubmitting = true;
    notifyListeners();

    try {
      final feedback = await _repository.resetPassword(
        email: email,
        code: code,
        newPassword: newPassword,
      );
      _suggestedEmail = email;
      _currentView = AuthView.login;
      _infoMessage = feedback.message;
    } on ApiException catch (error) {
      _errorMessage = error.message;
    } catch (_) {
      _errorMessage = 'Ocurrio un error inesperado. Intenta nuevamente.';
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  void cancelTwoFactorFlow() {
    _challenge = null;
    _currentView = AuthView.login;
    _clearFeedback();
    notifyListeners();
  }

  // Limpia sesion y devuelve la app al estado publico.
  Future<void> logout() async {
    await _repository.logout();
    _session = null;
    _challenge = null;
    _currentView = AuthView.login;
    _clearFeedback();
    notifyListeners();
  }

  void dismissMessages() {
    _clearFeedback();
    notifyListeners();
  }

  void _handleApiError(ApiException error, {String? fallbackEmail}) {
    final data = error.data;
    final errorCode = data is Map<String, dynamic> ? data['code'] : null;

    if (error.statusCode == 403 && errorCode == 'EMAIL_NOT_VERIFIED') {
      _currentView = AuthView.verifyEmail;
      _suggestedEmail = fallbackEmail ?? _suggestedEmail;
      _errorMessage = 'Debes verificar tu correo antes de iniciar sesion.';
      return;
    }

    if (_challenge != null &&
        (error.statusCode == 400 || error.statusCode == 401)) {
      _challenge = null;
      _currentView = AuthView.login;
      _infoMessage = 'La verificacion ya no es valida. Inicia sesion de nuevo.';
    }

    _errorMessage = error.message;
  }

  void _clearFeedback() {
    _errorMessage = null;
    _infoMessage = null;
  }
}
