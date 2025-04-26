import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class UserSession{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.sessions, {onDelete:'CASCADE'})
    user: User;

    @Column()
    refreshToken: string;

    @Column({nullable:true})
    userAgent: string;

    @Column({nullable:true})
    ipAddress: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({type: 'timestamp', nullable:true})
    expiresAt:Date;

    @Column({default:true})
    isValid: boolean;
}