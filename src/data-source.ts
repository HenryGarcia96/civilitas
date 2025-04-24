import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { ormConfig } from './config/ormconfig';
// Agrega todas tus entidades aquí

export const AppDataSource = new DataSource(ormConfig);
