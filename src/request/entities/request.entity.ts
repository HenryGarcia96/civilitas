import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum RequestType{
    SOLICITUD = 'SOLICITUD',
    DONACION = 'DONACION',
}

export enum RequestStatus {
    PENDIENTE = 'PENDIENTE',
    ACEPTADA = 'ACEPTADA',
    RECHAZADA = 'RECHAZADA',
}

@Entity()
export class Request {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'enum', enum: RequestType})
    type: RequestType;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column({type: 'enum', enum: RequestStatus, default: RequestStatus.PENDIENTE})
    status: RequestStatus;

    @ManyToOne(() => User, {eager: true})
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
