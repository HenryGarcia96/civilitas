import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { RequestType } from "../entities/request.entity";

export class CreateRequestDto {
    @IsEnum(RequestType)
    type: RequestType;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}