import 'package:mercapleno_appv1/features/auth/data/models/auth_user_model.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/auth_session.dart';

class AuthSessionModel {
  const AuthSessionModel({
    required this.token,
    required this.user,
  });

  final String token;
  final AuthUserModel user;

  factory AuthSessionModel.fromJson(Map<String, dynamic> json) {
    return AuthSessionModel(
      token: _asString(json['token']),
      user: AuthUserModel.fromJson(_readMap(json['user'])),
    );
  }

  factory AuthSessionModel.fromEntity(AuthSession entity) {
    return AuthSessionModel(
      token: entity.token,
      user: AuthUserModel.fromEntity(entity.user),
    );
  }

  AuthSession toEntity() {
    return AuthSession(
      token: token,
      user: user.toEntity(),
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'token': token,
      'user': user.toJson(),
    };
  }

  static String _asString(dynamic value) {
    if (value is String && value.trim().isNotEmpty) {
      return value;
    }
    return '';
  }

  static Map<String, dynamic> _readMap(dynamic value) {
    if (value is Map<String, dynamic>) {
      return value;
    }

    if (value is Map) {
      return value.cast<String, dynamic>();
    }

    return <String, dynamic>{};
  }
}
