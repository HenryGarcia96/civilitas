import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController, PasswordResetTokenAdminController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { MailModule } from 'src/mail/mail.module';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { PasswordResetTokenService } from './password-reset-token.service';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SessionsModule } from 'src/sessions/sessions.module';
import { Role } from 'src/roles/entities/role.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User,PasswordResetToken, Role]),
    JwtModule.registerAsync({
      imports:[ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION_TIME')},
      }),
      inject: [ConfigService]
    }),
    UsersModule,
    MailModule,
    SessionsModule,
  ],
  providers: [AuthService, JwtStrategy, PasswordResetTokenService, RolesGuard, JwtAuthGuard],
  controllers: [AuthController, PasswordResetTokenAdminController]
})
export class AuthModule {}
