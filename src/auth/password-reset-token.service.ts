import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { MoreThan, Repository } from "typeorm";
import { PasswordResetToken } from "./entities/password-reset-token.entity";

@Injectable()
export class PasswordResetTokenService{
    constructor(
        @InjectRepository(PasswordResetToken)
        private tokenRepo: Repository<PasswordResetToken>,
    ){}

    async create(user: User, token:string, expireIn: number):Promise <void>{
        const expiresAt = new Date(Date.now() + expireIn * 1000);
        const resetToken = this.tokenRepo.create({user,token, expiresAt});
        await this.tokenRepo.save(resetToken);
    }

    async findAll(userId?:string){
        if(userId){
            return this.tokenRepo.find({
                where: { user: { id: +userId}},
                relations: ['user']
            });
        }

        return this.tokenRepo.find({ relations: ['user']});
    }

    async delete(id:string){
        const result = await this.tokenRepo.delete(id);
        return {
            deleted: result.affected === 1,
            id
        };
    }

    async findValid(token:string): Promise<PasswordResetToken | null>{
        return await this.tokenRepo.findOne({
            where: {
                token,
                used:false,
                expiresAt: MoreThan(new Date()),
            },
            relations: ['user'],
        });
    }

    async markAsUsed(token: PasswordResetToken): Promise <void>{
        token.used = true;
        token.usedAt = new Date(); 
        await this.tokenRepo.save(token);
    }
}