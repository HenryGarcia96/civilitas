import { IsString, IsEmail, Length, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';
import { Unique } from 'typeorm';

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(7, 20)
  telefono: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({each:true})
  roles: number[]
}
