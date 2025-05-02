import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { Repository } from 'typeorm';
import { RequestService } from 'src/request/request.service';
import { User } from 'src/users/entities/user.entity';
import { RequestType } from 'src/request/entities/request.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private requestService: RequestService,
  ){}

  async create(dto: CreateMatchDto, user: User) {
    const solicitud = await this.requestService.findOne(dto.solicitudId );

    if(!solicitud) throw new HttpException(`Request ${dto.solicitudId} not found`, HttpStatus.BAD_REQUEST);

    if(solicitud.type !== RequestType.SOLICITUD) throw new HttpException(`Request ${dto.solicitudId} is not valid request`, HttpStatus.BAD_REQUEST);

    const donacion = await this.requestService.findOne(dto.donacionId);

    if(!donacion) throw new HttpException(`Request ${dto.donacionId} not found`, HttpStatus.BAD_REQUEST);

    if(donacion.type !== RequestType.DONACION) throw new HttpException(`Request ${dto.solicitudId} is not valid donation`, HttpStatus.BAD_REQUEST);

    const match = this.matchRepository.create({
      solicitud,
      donacion,
      linkedBy: user,
    });

    return this.matchRepository.save(match);
  }

  findAll() {
    return this.matchRepository.find({relations: ['solicitud', 'donacion', 'linkedBy']});
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} match`;
  // }

  // update(id: number, updateMatchDto: UpdateMatchDto) {
  //   return `This action updates a #${id} match`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} match`;
  // }
}
