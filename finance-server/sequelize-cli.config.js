import path from 'path';
import { SequelizeOptions } from 'sequelize-typescript';
import dotenv from 'dotenv';
const config: { [key: string]: SequelizeOptions } = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST,        // поменяй на свой
    port: 5432,               // поменяй на свой
    database: process.env.DB_NAME, // поменяй на свой
    username: process.env.DB_USER,    // поменяй на свой
    password: process.env.DB_PASS,    // поменяй на свой
    models: [path.resolve(__dirname, 'src/**/*.model.ts')],
  },
};

export default config;
