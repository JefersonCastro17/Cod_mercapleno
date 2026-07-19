import 'dart:convert';
import 'package:mercapleno_appv1/features/auth/data/models/auth_session_model.dart';
import 'package:mercapleno_appv1/features/auth/domain/entities/auth_session.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SessionStorage {
  static const _tokenKey = 'mercapleno_auth_token';
  static const _userKey = 'mercapleno_auth_user';

  Future<void> saveSession(AuthSession session) async {
    final preferences = await SharedPreferences.getInstance();
    final sessionJson = AuthSessionModel.fromEntity(session).toJson();

    await preferences.setString(_tokenKey, session.token);
    await preferences.setString(_userKey, jsonEncode(sessionJson['user']));
  }

  Future<AuthSession?> restoreSession() async {
    final preferences = await SharedPreferences.getInstance();
    final token = preferences.getString(_tokenKey);
    final rawUser = preferences.getString(_userKey);

    if (token == null || rawUser == null) {
      return null;
    }

    try {
      final decodedUser = jsonDecode(rawUser);
      if (decodedUser is! Map<String, dynamic>) {
        await clear();
        return null;
      }

      final sessionModel = AuthSessionModel.fromJson(<String, dynamic>{
        'token': token,
        'user': decodedUser,
      });

      return sessionModel.toEntity();
    } catch (_) {
      await clear();
      return null;
    }
  }

  Future<void> clear() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_tokenKey);
    await preferences.remove(_userKey);
  }
}
