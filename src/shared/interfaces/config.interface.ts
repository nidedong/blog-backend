export interface EnvAppConfig {
  name: string;
  port: number;
  address: string;
  prefix: string;
  language: string;
  secure: boolean;
}

export interface EnvLogConfig {
  level: string;
  max_file_size: string;
  max_history_days: string;
}

export interface EnvHttpConfig {
  base_url: string;
  timeout: number;
}

export interface EnvMysqlConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entityPrefix: string;
  ssl: boolean;
  connectionLimit: number;
  retryDelay: number;
}

export interface EnvRedisConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  db: number;
  tls: boolean;
  keyPrefix?: string;
}
export interface EnvMailConfig {
  host: string;
  port: number;
  secure: boolean;
  authUser: string;
  authPass: string;
}

export interface EnvAuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  googleClientId: string;
  googleClientSecret: string;
  googleAuthCallbackUrl: string;
  githubClientId: string;
  githubClientSecret: string;
  githubAuthCallbackUrl: string;
}

export interface EnvMinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
}

export interface EnvClientConfig {
  clientHomePage: string;
}

export interface EnvironmentVariable {
  app: EnvAppConfig;
  log: EnvLogConfig;
  http: EnvHttpConfig;
  auth: EnvAuthConfig;
  mysql: EnvMysqlConfig;
  redis: EnvRedisConfig;
  mail: EnvMailConfig;
  minio: EnvMinioConfig;
  client: EnvClientConfig;
}
