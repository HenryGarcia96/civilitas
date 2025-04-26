import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { SessionsService } from 'src/sessions/sessions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly sessionService:  SessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),  
      jsonWebTokenOptions:{
        ignoreNotBefore: true
      }
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const activeSessions = await this.sessionService.getMySessions(payload.sub);

    if(activeSessions.length === 0) throw new HttpException('No active sessions found', HttpStatus.UNAUTHORIZED);

    return { userId: payload.sub, email: payload.email };
  }
}
