import { DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

export const ormConfig: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'henrygodev',
  database: 'civilitas',
  entities: [User, Role],
  synchronize: true, // ⚠️ Solo para desarrollo
};
// TypeOrmModule.forRoot({
//       type: 'postgres',
//       host: 'localhost',
//       port: 5432,
//       username: 'postgres',
//       password: 'henrygodev',
//       database: 'civilitas',
//       entities: [__dirname + '/**/*.entity{.ts, .js}'],
//       synchronize: true,
//       autoLoadEntities: true
//     }),