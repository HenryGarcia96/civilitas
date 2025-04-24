import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
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
        const { email, password } = loginDto;

        // Buscar el usuario por email
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
        throw new Error('Credenciales invalidas');
        }

        // Verificar la contraseña
        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
        throw new Error('Credenciales invalidas');
        }

        const payload: JwtPayload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
