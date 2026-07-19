import 'package:mercapleno_appv1/core/network/api_client.dart';

class UsersAdminRemoteDataSource {
  UsersAdminRemoteDataSource({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<Map<String, dynamic>> getUsers({required String token}) async {
    final response = await _apiClient.get(
      '/api/admin/users',
      headers: <String, String>{'Authorization': 'Bearer $token'},
    );
    return response as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createUser({
    required String token,
    required Map<String, dynamic> body,
  }) {
    return _apiClient.post(
      '/api/admin/users',
      body: body,
      headers: <String, String>{'Authorization': 'Bearer $token'},
    );
  }

  Future<Map<String, dynamic>> updateUser({
    required String token,
    required int id,
    required Map<String, dynamic> body,
  }) {
    return _apiClient.patch(
      '/api/admin/users/$id',
      body: body,
      headers: <String, String>{'Authorization': 'Bearer $token'},
    );
  }

  Future<Map<String, dynamic>> deleteUser({
    required String token,
    required int id,
  }) {
    return _apiClient.delete(
      '/api/admin/users/$id',
      headers: <String, String>{'Authorization': 'Bearer $token'},
    );
  }
}
