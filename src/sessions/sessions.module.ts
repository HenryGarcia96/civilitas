import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './entities/user-session.entity';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserSession])],
    exports: [TypeOrmModule, SessionsService],
    providers: [SessionsService],
    controllers: [SessionsController], 
})
export class SessionsModule {}
