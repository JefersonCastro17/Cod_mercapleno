import 'package:mercapleno_appv1/features/auth/domain/entities/action_feedback.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/auth_session.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/document_type.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/login_result.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/register_request.dart';

abstract class AuthRepository {
  Future<LoginResult> login({
    required String email,
    required String password,
  });

  Future<AuthSession> verifyLoginCode({
    required String pendingToken,
    required String code,
  });

  Future<List<DocumentType>> getDocumentTypes();

  Future<ActionFeedback> register(RegisterRequest request);

  Future<ActionFeedback> verifyEmail({
    required String email,
    required String code,
  });

  Future<ActionFeedback> resendVerification({required String email});

  Future<ActionFeedback> requestPasswordReset({required String email});

  Future<ActionFeedback> resetPassword({
    required String email,
    required String code,
    required String newPassword,
    required String confirmPassword,
  });

  Future<AuthSession?> restoreSession();

  Future<void> logout();
}
