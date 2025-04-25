import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
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
    console.log('Payload recibido', payload);
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.BAD_REQUEST);
    }
    return { userId: payload.sub, email: payload.email };
  }
}
