import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth/sessions')
export class SessionsController {
    constructor(private readonly sessionService: SessionsService){}

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    async logoutAll(@Req() req: Request){
        const user = req.user as any;
        return this.sessionService.logoutAllSessions(user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getSessions(@Req() req: Request){
        const user = req.user as any;
        return this.sessionService.getMySessions(user.userId);
    }
}
