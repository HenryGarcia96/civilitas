import { DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { PasswordResetToken } from 'src/auth/entities/password-reset-token.entity';

export const ormConfig: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'henrygodev',
  database: 'civilitas',
  entities: [User, Role, PasswordResetToken],
  synchronize: true, 
};