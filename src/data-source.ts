// migration 使用的mysql配置文件

import { DataSource } from 'typeorm';
import getConfiguration from './shared/configuration';

const {
  host,
  port,
  username,
  password,
  database,
  ssl,
  entityPrefix,
  connectionLimit,
} = getConfiguration().mysql;

export default new DataSource({
  type: 'mysql',
  host,
  port,
  username,
  password,
  database,
  ssl,
  entityPrefix,
  entities: ['dist/**/*.entity{.ts,.js}'],
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: true,
  synchronize: false,
  connectorPackage: 'mysql2',
  migrations: ['src/migrations/**.ts'],
  extra: {
    connectionLimit,
  },
});
