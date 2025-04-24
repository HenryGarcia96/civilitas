import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ){}

  async create(createUserDto: CreateUserDto) {
     // Verificar si el correo electrónico ya existe en la base de datos
     const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
     if (existingUser) {
       throw new ConflictException('El correo electrónico ya está registrado');
     }

    const roles = await this.roleRepository.findBy({id: In(createUserDto.roles)});

    const user = this.userRepository.create({
      ...createUserDto,
      roles,
    });

    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find({relations: ['roles']});
  }

  findOne(id: number) {
    return this.userRepository.findOne({where:{id}, relations: ['roles']});
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({id});

    if(!user) throw new NotFoundException('Usuario no encontrado');

    if(updateUserDto.roles){
      const roles = await this.roleRepository.findBy({id: In(updateUserDto.roles)});
      user.roles = roles;
    }

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
}
