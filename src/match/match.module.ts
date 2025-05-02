import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { RequestModule } from 'src/request/request.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), RequestModule],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
