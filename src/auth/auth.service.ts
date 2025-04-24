import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from './interfaces/jwt-payload.interface';

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

    async login(user: any){
        const payload: JwtPayload = { email: user.correo, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
