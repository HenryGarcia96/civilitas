import { IsEmail, IsNotEmpty, IsString, Length, MinLength, minLength } from "class-validator";


export class RegisterDto{
    @IsNotEmpty()
    nombre: string;

    @IsNotEmpty()
    apellido: string;

    @IsEmail()
    email:string;

    @MinLength(10)
    password: string;

    @IsString()
    @Length(7, 20)
    telefono: string;
}