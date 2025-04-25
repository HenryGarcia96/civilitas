import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
    async login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @HttpCode(200)
    async refreshToken(@Body() body: { refreshToken: string}){
        return this.authService.refreshToken(body.refreshToken);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.ACCEPTED)
    async resetPassword(@Body() body:{ email: string}){
        return this.authService.sendPasswordResetLink(body.email);
    }

    @Post('change-password')
    @HttpCode(HttpStatus.ACCEPTED)
    async changePassword(@Body() dto:ChangePasswordDto){
        return await this.authService.changePassword(dto);
    }
}
