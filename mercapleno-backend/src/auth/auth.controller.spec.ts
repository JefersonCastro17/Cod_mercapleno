import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController cookie handling', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'login' | 'logout'>>;

  beforeEach(() => {
    authService = {
      login: jest.fn(),
      logout: jest.fn(),
    } as unknown as jest.Mocked<Pick<AuthService, 'login' | 'logout'>>;

    controller = new AuthController(authService as AuthService);
  });

  it('sets an httpOnly access_token cookie on successful login', async () => {
    const res = { cookie: jest.fn() } as unknown as Response;
    authService.login.mockResolvedValue({
      success: true,
      message: 'Inicio de sesion exitoso',
      token: 'abc123',
      user: { id: 1, email: 'test@example.com' },
    } as any);

    await controller.login({ email: 'test@example.com', password: 'secret' } as any, res);

    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      'abc123',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });

  it('clears the access_token cookie on logout', async () => {
    const res = { clearCookie: jest.fn() } as unknown as Response;
    authService.logout.mockReturnValue({ success: true, message: 'Sesion cerrada' } as any);

    await controller.logout(res);

    expect(res.clearCookie).toHaveBeenCalledWith('access_token', expect.objectContaining({ path: '/' }));
  });
});
