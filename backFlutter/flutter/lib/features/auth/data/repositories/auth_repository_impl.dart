import 'package:mercapleno_appv1/features/auth/data/datasources/auth_remote_data_source.dart';
import 'package:mercapleno_appv1/features/auth/data/models/auth_session_model.dart';
import 'package:mercapleno_appv1/features/auth/data/models/document_type_model.dart';
import 'package:mercapleno_appv1/core/network/api_cache.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/action_feedback.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/auth_challenge.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/auth_session.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/document_type.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/login_result.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/register_request.dart';
import 'package:mercapleno_appv1/features/auth/domain/repositories/auth_repository.dart';
import 'package:mercapleno_appv1/core/storage/session_storage.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({
    required AuthRemoteDataSource remoteDataSource,
    required SessionStorage sessionStorage,
  }) : _remoteDataSource = remoteDataSource,
       _sessionStorage = sessionStorage,
       _cache = ApiCache();

  final AuthRemoteDataSource _remoteDataSource;
  final SessionStorage _sessionStorage;
  final ApiCache _cache;

  @override
  Future<LoginResult> login({
    required String email,
    required String password,
  }) async {
    final data = await _remoteDataSource.login(email: email, password: password);
    final message = _readMessage(data, fallback: 'Inicio de sesion exitoso');

    // Si el backend exige segundo factor, todavia no se crea sesion final.
    if (data['requiresTwoFactor'] == true) {
      final user = _readMap(data['user']);

      return LoginResult(
        message: message,
        challenge: AuthChallenge(
          pendingToken: _readString(data['pendingToken']),
          email: _readString(user['email'], fallback: email),
          expiresInMinutes: _readNullableInt(data['twoFactorExpiresInMinutes']),
        ),
      );
    }

    final session = _buildSession(data);
    await _sessionStorage.saveSession(session);

    return LoginResult(
      message: message,
      session: session,
    );
  }

  @override
  Future<AuthSession> verifyLoginCode({
    required String pendingToken,
    required String code,
  }) async {
    final data = await _remoteDataSource.verifyLoginCode(
      pendingToken: pendingToken,
      code: code,
    );

    final session = _buildSession(data);
    await _sessionStorage.saveSession(session);
    return session;
  }

  @override
  Future<List<DocumentType>> getDocumentTypes() async {
    // Evita pedir el mismo catalogo varias veces mientras la app esta abierta.
    // Verificar caché primero
    final cached = _cache.get('document_types');
    if (cached != null && cached.value is List<DocumentType>) {
      return cached.value as List<DocumentType>;
    }

    final data = await _remoteDataSource.getDocumentTypes();
    final rawList = data['tipos_identificacion'];

    if (rawList is! List) {
      return const <DocumentType>[];
    }

    final documentTypes = rawList
        .whereType<Map>()
        .map((item) => DocumentTypeModel.fromJson(item.cast<String, dynamic>()))
        .map((item) => item.toEntity())
        .toList(growable: false);

    // Guardar en caché por 24 horas
    // Cambia poco, asi que se conserva por 24 horas.
    _cache.set('document_types', documentTypes,
        ttl: const Duration(hours: 24));

    return documentTypes;
  }

  @override
  Future<ActionFeedback> register(RegisterRequest request) async {
    final data = await _remoteDataSource.register(request);
    return _buildActionFeedback(data);
  }

  @override
  Future<ActionFeedback> verifyEmail({
    required String email,
    required String code,
  }) async {
    final data = await _remoteDataSource.verifyEmail(email: email, code: code);
    return _buildActionFeedback(data);
  }

  @override
  Future<ActionFeedback> resendVerification({required String email}) async {
    final data = await _remoteDataSource.resendVerification(email: email);
    return _buildActionFeedback(data);
  }

  @override
  Future<ActionFeedback> requestPasswordReset({required String email}) async {
    final data = await _remoteDataSource.requestPasswordReset(email: email);
    return _buildActionFeedback(data);
  }

  @override
  Future<ActionFeedback> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    final data = await _remoteDataSource.resetPassword(
      email: email,
      code: code,
      newPassword: newPassword,
    );
    return _buildActionFeedback(data);
  }

  @override
  Future<AuthSession?> restoreSession() {
    return _sessionStorage.restoreSession();
  }

  @override
  Future<void> logout() async {
    _cache.clear();
    return _sessionStorage.clear();
  }

  // Construye la sesion de dominio a partir del JSON del backend.
  AuthSession _buildSession(Map<String, dynamic> data) {
    return AuthSessionModel.fromJson(<String, dynamic>{
      'token': _readString(data['token']),
      'user': _readMap(data['user']),
    }).toEntity();
  }

  // Sirve para respuestas simples de registro, verificacion y reset.
  ActionFeedback _buildActionFeedback(Map<String, dynamic> data) {
    return ActionFeedback(
      success: data['success'] == true,
      message: _readMessage(data, fallback: 'La operacion se completo.'),
      requiresVerification: data['requiresVerification'] as bool?,
      emailSent: data['emailSent'] as bool?,
    );
  }

  Map<String, dynamic> _readMap(dynamic value) {
    if (value is Map<String, dynamic>) {
      return value;
    }

    if (value is Map) {
      return value.cast<String, dynamic>();
    }

    return <String, dynamic>{};
  }

  String _readString(dynamic value, {String fallback = ''}) {
    if (value is String && value.trim().isNotEmpty) {
      return value;
    }
    return fallback;
  }

  String _readMessage(Map<String, dynamic> data, {required String fallback}) {
    final message = data['message'];
    if (message is String && message.trim().isNotEmpty) {
      return message;
    }
    return fallback;
  }

  int? _readNullableInt(dynamic value) {
    if (value is int) {
      return value;
    }

    if (value is String) {
      return int.tryParse(value);
    }

    return null;
  }
}

