import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envs } from '../../config';
import { AuthUser } from '../interfaces/auth-user.interface';

interface JwtPayload {
  sub: string | number;
  id_rol: number;
  email: string;
  token_type: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envs.jwtSecret,
    });
  }

  validate(payload: JwtPayload): AuthUser {
    if (
      payload.sub === undefined ||
      payload.sub === null ||
      !payload.email ||
      payload.id_rol === undefined ||
      payload.token_type !== 'access'
    ) {
      throw new UnauthorizedException('Token invalido');
    }

    return {
      id: Number(payload.sub),
      id_rol: payload.id_rol,
      email: payload.email,
    };
  }
}
