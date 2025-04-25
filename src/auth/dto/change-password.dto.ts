import { IsString, MinLength } from "class-validator";

export class ChangePasswordDto{
    @IsString()
    token: string;

    @IsString()
    @MinLength(10)
    newPassword: string;
}