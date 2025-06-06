import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PasswordResetTokenService } from './password-reset-token.service';
import { UserSession } from 'src/sessions/entities/user-session.entity';
import { RegisterDto } from './dto/register.dto';
import { Role } from 'src/roles/entities/role.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        private readonly userService: UsersService,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly tokenService: PasswordResetTokenService,
        @InjectRepository(UserSession)
        private readonly sessionRepository: Repository<UserSession>
    ){}

    async validateUser(email:string, password:string): Promise<any>{
        const user = await this.userRepository.findOne({where: {email: email}});

        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }

        return null;
    }

    async registerClient(registerDto: RegisterDto, userAgent: string, ipAddress:string){
        const existingUser = await this.userRepository.findOne({
            where: {email: registerDto.email}
        });

        if(existingUser) throw new HttpException('Email is already taken', HttpStatus.BAD_REQUEST);

        const hashedPassword = await bcrypt.hash(registerDto.password,10);

        const user = this.userRepository.create({
            ... registerDto,
            password: hashedPassword,
        });

        await this.userRepository.save(user);

        const roleEntity = await this.roleRepository.findOne({where: {name: 'solicitante'}});

        if(!roleEntity) throw new HttpException('Role not found', HttpStatus.BAD_REQUEST);

        user.roles = [roleEntity];

        await this.userRepository.save(user);

        const session = this.sessionRepository.create({
            user,
            refreshToken:  '',
            userAgent,
            ipAddress,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        });
        
        await this.sessionRepository.save(session);

        const payload: JwtPayload = {email:user.email, sub:user.id, sessionId: session.id};

        const {accessToken, refreshToken} = await this.generateTokens(payload);

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        session.refreshToken = await bcrypt.hash(refreshToken, 10);

        await this.sessionRepository.save(session);

        return {accessToken, refreshToken};

    }

    async login(loginDto: LoginDto, userAgent: string, ipAddress: string){
        try {
            // Usar propiedades de la interfaz
            const { email, password } = loginDto;
    
            //  Buscar al usuario por su correo
            const user = await this.userRepository.findOne({ where: { email } });
    
            if (!user) throw new HttpException('Email not found', HttpStatus.BAD_REQUEST);
    
            // Cotejar contraseña recibida contra propiedad guardada
            const passwordMatches = await bcrypt.compare(password, user.password);
    
            if (!passwordMatches) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    
            const session = this.sessionRepository.create({
                user,
                refreshToken:  '',
                userAgent,
                ipAddress,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
             });
             await this.sessionRepository.save(session);

            // JWToken
            const payload: JwtPayload = { 
                email: user.email, 
                sub: user.id,
                sessionId: session.id, 
              };
    
            const {accessToken, refreshToken} = await this.generateTokens(payload);
    
            // Insertar token de refresco al user
            session.refreshToken = refreshToken;

            await this.sessionRepository.save(session);
            
            // Regresar tokens de acceso
            return { accessToken, refreshToken};
        } catch (error) {
            console.log(error);
            throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
        }
    }

    async logout(sessionId: number){
        const session = await this.sessionRepository.findOneBy({id: sessionId});

        if(!session || !session.isValid) throw new HttpException('Session not found or already invalidated', HttpStatus.BAD_REQUEST);

        session.isValid = false;

        await this.sessionRepository.save(session);

        return {message: 'Logout successfully'};
    }

    async refreshToken(token: string){
        try {
            const jwtSecret = this.configService.get<string>('JWT_SECRET');
            const payload = this.jwtService.verify<JwtPayload>(token, {
                secret: jwtSecret
            });

            const session = await this.sessionRepository.findOne({
                where: {id: payload.sessionId, isValid:true},
                relations: ['user']
            });

            if(!session) throw new HttpException('Session not found or invalid', HttpStatus.UNAUTHORIZED);

            const isRefreshTokenValid  = await bcrypt.compare(token, session.refreshToken);

            if(!isRefreshTokenValid ) throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);

            if(session.expiresAt && session.expiresAt.getTime() < Date.now()){
                session.isValid = false;
                await this.sessionRepository.save(session);
                throw new HttpException('Refresh token expired', HttpStatus.UNAUTHORIZED);
            }

            const newPayload: JwtPayload = {
                email: session.user.email,
                sub: session.user.id,
                sessionId: session.id
            }

            const {accessToken, refreshToken: newRefreshToken} = await this.generateTokens(newPayload);

            const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken,10);
            
            session.refreshToken = hashedNewRefreshToken;

            await this.sessionRepository.save(session);

            return {accessToken, refreshToken: newRefreshToken};


        } catch (error) {
            console.log(error);
            throw new HttpException('Refresh token expired or invalid', HttpStatus.UNAUTHORIZED);
        }
    }

    public async sendPasswordResetLink(email:string): Promise<string>{
        const user = await this.userRepository.findOne({ where: { email } });

        if(!user) throw new HttpException('User not found', HttpStatus.BAD_REQUEST);

        const payload = {email:user.email, sub:user.id};

        const expiresIn = 60 * 60;
        
        const jwtSecret = this.configService.get<string>('JWT_SECRET');
        const resetToken = this.jwtService.sign(payload, {
            secret: jwtSecret,
            expiresIn
        });

        await this.tokenService.create(user, resetToken, expiresIn);
        await this.mailService.sendPasswordResetEmail(user.email, resetToken);

        return 'Password reset email sent successfully';
    }

    public async changePassword(dto: ChangePasswordDto): Promise<string>{
        const {token, newPassword} = dto;

        const resetToken = await this.tokenService.findValid(token);

        if(!resetToken) throw new HttpException('Token expired or used', HttpStatus.BAD_REQUEST);

        let payload:any;

        try {
            const jwtSecret = this.configService.get<string>('JWT_SECRET');
            payload = this.jwtService.verify(token, { secret: jwtSecret});
        } catch (error) {
            throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
        }

        const user = await this.userService.findOne(payload.sub);
        
        if(!user) throw new HttpException('User not found', HttpStatus.FORBIDDEN);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.userRepository.update(user.id, {password: hashedPassword});

        return 'Password update successfully';
    }

    public async generateTokens(payload: JwtPayload){
        
        const secret = this.configService.get<string>('JWT_SECRET');
    
        const accessToken = this.jwtService.sign({
            email: payload.email,
            sub: payload.sub,
            sessionId: payload.sessionId,
        }, {
            secret,
            expiresIn: '15m',
        });
    
        const refreshToken = this.jwtService.sign({
            email: payload.email,
            sub: payload.sub,
            sessionId: payload.sessionId,
        }, {
            secret,
            expiresIn: '30d',
        });
        
        return { accessToken, refreshToken };
    }
}
