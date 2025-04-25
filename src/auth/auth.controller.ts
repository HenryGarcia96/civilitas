import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { PasswordResetTokenService } from './password-reset-token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

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

@Controller('auth/admin/password-reset-tokens')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PasswordResetTokenAdminController{
    constructor(private readonly tokenService:PasswordResetTokenService){}

    @Get()
    async findAll(@Query('user_id') userId?:string){
        return this.tokenService.findAll(userId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string){
        return this.tokenService.delete(id);
    }
}