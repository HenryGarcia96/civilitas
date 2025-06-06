import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
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

    
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
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
    const user = await this.userRepository.findOne({
      where: {id},
      relations: ['roles'],
    });

    if(!user) throw new HttpException('Usuario no encontrado', HttpStatus.BAD_REQUEST);

    const { roles: roleIds, ...rest } = updateUserDto;

    Object.assign(user, rest);

    if (roleIds) {
      const roles = await this.roleRepository.findBy({ id: In(roleIds) });
      user.roles = roles;
    }

    return this.userRepository.save(user);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
}
