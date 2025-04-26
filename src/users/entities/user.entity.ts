import { Role } from 'src/roles/entities/role.entity';
import { UserSession } from 'src/sessions/entities/user-session.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  email: string;

  @Column({nullable:false})
  password: string;

  @Column()
  telefono: string;

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro: Date;

  @ManyToMany(() => Role, role => role.usuarios, {cascade:true})
  @JoinTable({
    name: 'users_has_roles',
    joinColumn: {name: 'usuario_id', referencedColumnName: 'id'},
    inverseJoinColumn: {name: 'role_id', referencedColumnName: 'id'}
  })
  roles: Role[];

  @OneToMany(()=> UserSession, session => session.user)
  sessions: UserSession[];
}
