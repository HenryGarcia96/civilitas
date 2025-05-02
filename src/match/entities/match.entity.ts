import { Request } from "src/request/entities/request.entity";
import { User } from "src/users/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Request)
    solicitud: Request;

    @ManyToOne(() => Request)
    donacion: Request;

    @ManyToOne(()=> User)
    linkedBy: User;

    @CreateDateColumn()
    linkedAt: Date;
}