import { Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RequestService {

  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
  ){}

  create(dto: CreateRequestDto, user: User) {
    const request = this.requestRepository.create({...dto, createdBy: user});
    return this.requestRepository.save(request);
  }

  findAll() {
    return this.requestRepository.find();
  }

  findOne(id: number) {
    return this.requestRepository.findOneBy({id});
  }

  update(id: number, dto: UpdateRequestDto) {
    return this.requestRepository.update(id, dto)
  }

  remove(id: number) {
    return this.requestRepository.delete(id);
  }
}
