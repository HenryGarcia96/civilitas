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

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly userService: UsersService,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService,
        private readonly tokenService: PasswordResetTokenService,
    ){}

    async validateUser(email:string, password:string): Promise<any>{
        const user = await this.userRepository.findOne({where: {email: email}});

        if(user && user.password === password){
            const {password, ...result} = user;
            return result;
        }

        return null;
    }

    async login(loginDto: LoginDto){
        try {
            // Usar propiedades de la interfaz
            const { email, password } = loginDto;
    
            //  Buscar al usuario por su correo
            const user = await this.userRepository.findOne({ where: { email } });
    
            if (!user) throw new HttpException('Email not found', HttpStatus.BAD_REQUEST);
    
            // Cotejar contraseña recibida contra propiedad guardada
            const passwordMatches = await bcrypt.compare(password, user.password);
    
            if (!passwordMatches) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    
            // JWToken
            const payload: JwtPayload = { email: user.email, sub: user.id };
    
            const {accessToken, refreshToken} = await this.generateTokens(payload);
    
            // Insertar token de refresco al user
            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
            await this.userRepository.update(user.id, {refreshToken: hashedRefreshToken});
    
            // Regresar tokens de acceso
            return { accessToken, refreshToken};
        } catch (error) {
            console.log(error);
            throw new HttpException('Refresh token expired or invalid', HttpStatus.UNAUTHORIZED);
        }
    }

    async refreshToken(refreshToken: string){
        try {
             
            const payload = this.jwtService.verify( refreshToken, {
                secret: 'mySecretKey',
            });

            // Verificar que el refresh token sea el mismo 
            const user = await this.userRepository.findOne({ where: { id: payload.sub } });

            if(!user || !user.refreshToken) throw new HttpException('User not found or token invalid', HttpStatus.BAD_REQUEST);

            // Comparar token recibido y BD
            const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);

            if(!refreshTokenMatches) throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);

            // Generar token
            const {accessToken, refreshToken: newRefreshToken} = await this.generateTokens(payload);

            const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

            await this.userRepository.update(user.id, {refreshToken: hashedNewRefreshToken})

            return { accessToken, refreshToken: newRefreshToken};

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
        
        const resetToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn
        });

        await this.tokenService.create(user, resetToken, expiresIn);
        await this.mailService.sendPasswordResetEmail(user.email, resetToken);

        return 'Password reset email sent successfully';
    }

    public async changePassword(dto: ChangePasswordDto): Promise<string>{
        const {token, newPassword} = dto;

        const resetToken = await this.tokenService.findValid(token);

        if(!resetToken) throw new HttpException('Token expired', HttpStatus.BAD_REQUEST);

        let payload:any;

        try {
            payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET});
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
        const accessToken = this.jwtService.sign({
            email: payload.email,
            sub: payload.sub
        }, {
            secret: 'mySecretKey',
            expiresIn: '15m',
        });
    
        const refreshToken = this.jwtService.sign({
            email: payload.email,
            sub: payload.sub
        }, {
            secret: 'mySecretKey',
            expiresIn: '30d',
        });
        
        return { accessToken, refreshToken };
    }
}
