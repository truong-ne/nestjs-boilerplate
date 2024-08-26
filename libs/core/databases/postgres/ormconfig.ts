import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
config();

const options = {
  type: (process.env.DB_TYPE as any) || 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'username',
  password: process.env.DB_PWD || 'password',
  database: process.env.DB_NAME || 'roundus',
  migrations: [join(__dirname, './migrations/*.ts')],
  entities: [join(__dirname, './entities/*.entity.ts')],
  synchronize: true,
};

export default new DataSource(options);
