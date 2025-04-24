import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty({message: 'El nombre es obligatorio'})
    name: string;

    @IsString()
    @IsNotEmpty({message: 'La descripcion es obligatoria'})
    description: string
}
