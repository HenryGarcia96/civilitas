import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
    async login(@Body() LoginDto: LoginDto){
        const user = await this.authService.validateUser(LoginDto.correo, LoginDto.password);
        if(!user){
            throw new Error('Credenciales invalidas');
        }
        return this.authService.login(user);
    }
}
