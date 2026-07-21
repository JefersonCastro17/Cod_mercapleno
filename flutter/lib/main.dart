import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'app/app.dart';
import 'core/network/api_client.dart';
import 'core/storage/session_storage.dart';
import 'features/auth/data/datasources/auth_remote_data_source.dart';
import 'features/auth/data/repositories/auth_repository_impl.dart';
import 'features/auth/presentation/controllers/auth_controller.dart';
import 'features/venta/presentation/providers/venta_provider.dart';
import 'features/users_admin/data/datasources/users_admin_remote_data_source.dart';
import 'features/users_admin/data/repositories/users_admin_repository_impl.dart';
import 'features/users_admin/presentation/controllers/users_admin_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: '.env');
  } catch (_) {}
  final apiClient = ApiClient();
  final authRepository = AuthRepositoryImpl(
    remoteDataSource: AuthRemoteDataSource(apiClient: apiClient),
    sessionStorage: SessionStorage(),
  );
  final authController = AuthController(repository: authRepository);
  await authController.initialize();
  final usersRepository = UsersAdminRepositoryImpl(
    remoteDataSource: UsersAdminRemoteDataSource(apiClient: apiClient),
  );
  final usersController = UsersAdminController(repository: usersRepository);
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: authController),
        ChangeNotifierProvider.value(value: usersController),
        ChangeNotifierProvider(
          create: (_) => VentaProvider()..loadCatalogo(),
        ),
      ],
      child: MyApp(authController: authController),
    ),
  );
}
