import { IsNumber } from "class-validator";

export class CreateMatchDto {
    @IsNumber()
    solicitudId: number;

    @IsNumber()
    donacionId: number;
}