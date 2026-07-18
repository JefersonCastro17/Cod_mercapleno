import 'package:mercapleno_appv1/core/config/app_config.dart';
import 'package:mercapleno_appv1/core/network/api_client.dart';
import 'package:mercapleno_appv1/features/auth/data/models/register_request_model.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/register_request.dart';

class AuthRemoteDataSource {
  AuthRemoteDataSource({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) {
    return _apiClient.post(
      AppConfig.loginEndpoint,
      body: <String, dynamic>{
        'email': email,
        'password': password,
      },
    );
  }

  Future<Map<String, dynamic>> verifyLoginCode({
    required String pendingToken,
    required String code,
  }) {
    return _apiClient.post(
      AppConfig.verifyLoginCodeEndpoint,
      body: <String, dynamic>{
        'pendingToken': pendingToken,
        'code': code,
      },
    );
  }

  Future<Map<String, dynamic>> getDocumentTypes() async {
    final response = await _apiClient.get(AppConfig.documentTypesEndpoint);
    return response as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> register(RegisterRequest request) {
    return _apiClient.post(
      AppConfig.registerEndpoint,
      body: RegisterRequestModel.fromEntity(request).toJson(),
    );
  }

  Future<Map<String, dynamic>> verifyEmail({
    required String email,
    required String code,
  }) {
    return _apiClient.post(
      AppConfig.verifyEmailEndpoint,
      body: <String, dynamic>{
        'email': email,
        'code': code,
      },
    );
  }

  Future<Map<String, dynamic>> resendVerification({required String email}) {
    return _apiClient.post(
      AppConfig.resendVerificationEndpoint,
      body: <String, dynamic>{'email': email},
    );
  }

  Future<Map<String, dynamic>> requestPasswordReset({required String email}) {
    return _apiClient.post(
      AppConfig.requestPasswordResetEndpoint,
      body: <String, dynamic>{'email': email},
    );
  }

  Future<Map<String, dynamic>> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) {
    return _apiClient.post(
      AppConfig.resetPasswordEndpoint,
      body: <String, dynamic>{
        'email': email,
        'code': code,
        'newPassword': newPassword,
      },
    );
  }
}

