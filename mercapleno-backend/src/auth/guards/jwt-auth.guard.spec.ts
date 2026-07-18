import { Reflector } from '@nestjs/core';
import { describe, expect, it } from '@jest/globals';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('allows CORS preflight OPTIONS requests without authentication', () => {
    const guard = new JwtAuthGuard(new Reflector());
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ method: 'OPTIONS' }),
      }),
    } as any;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
