import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSession } from './entities/user-session.entity';
import { Repository } from 'typeorm';
import { session } from 'passport';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(UserSession)
        private readonly sessionRepository: Repository<UserSession>
    ){}

    async logoutAllSessions(userId: number){
        const sessions = await this.sessionRepository.find({
            where: {user: {id: userId}, isValid: true},
        });

        if(session.length === 0) throw new HttpException('No active sessions found', HttpStatus.BAD_REQUEST);

        for (const session of sessions){
            session.isValid = false;
        }

        await this.sessionRepository.save(sessions);

        return {message: 'All sessions has been logged out successfully', 'status': true};

    }

    async getMySessions(userId:number){
        const sessions = await this.sessionRepository.find({
            where: {user: {id: userId}, isValid: true},
            select: ['id', 'ipAddress', 'userAgent', 'createdAt', 'expiresAt']
        });

        return sessions;
    }
}
