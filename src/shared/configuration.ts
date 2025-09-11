import { EnvironmentVariable } from './interfaces';

export default () => {
  const enviroment: EnvironmentVariable = {
    client: {
      clientHomePage: process.env.CLIENT_HOME_PAGE,
    },
    app: {
      name: process.env.APP_NAME,
      port: parseInt(process.env.APP_PORT),
      address: process.env.APP_ADDRESS,
      prefix: process.env.APP_PREFIX,
      language: process.env.APP_LANGUAGE,
      secure: Object.is(process.env.APP_SECURE, 'true'),
    },
    log: {
      level: process.env.LOG_LEVEL,
      max_file_size: process.env.LOG_MAX_FILE_SIZE,
      max_history_days: process.env.LOG_MAX_HISTORY_DAYS,
    },
    http: {
      base_url: process.env.HTTP_BASE_URL,
      timeout: parseInt(process.env.HTTP_TIMEOUT),
    },
    auth: {
      jwtSecret: process.env.AUTH_JWT_SECRET,
      jwtExpiresIn: process.env.AUTH_JWT_EXPIRES_IN || '0.5h',
      googleClientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      googleAuthCallbackUrl: process.env.AUTH_GOOGLE_CALLBACK_URL,
      githubClientId: process.env.AUTH_GITHUB_CLIENT_ID,
      githubClientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
      githubAuthCallbackUrl: process.env.AUTH_GITHUB_CALLBACK_URL,
    },
    mysql: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      username: process.env.MYSQL_USERNAME || 'root',
      password: process.env.MYSQL_PASSWORD || 'dongbibo',
      database: process.env.MYSQL_DATABASE || 'blog',
      entityPrefix: process.env.MYSQL_DATABASE_TABLE_PREFIX || 'blog_',
      ssl: Object.is(process.env.MYSQL_SSL, true),
      connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT) || 20,
      retryDelay: parseInt(process.env.MYSQL_RETRY_DELAY!) || 300,
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      db: parseInt(process.env.REDIS_DB || '0', 10),
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      tls: Object.is(process.env.REDIS_SSL_ENABLED, 'true'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || '',
    },
    mail: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: Object.is(process.env.APP_SECURE, 'true'),
      authUser: process.env.EMAIL_AUTH_USER,
      authPass: process.env.EMAIL_AUTH_PASS,
    },
    minio: {
      endPoint: process.env.MINIO_END_POINT,
      port: parseInt(process.env.MINIO_PORT, 10),
      useSSL: Object.is(process.env.MINIO_USE_SSL, 'true'),
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      bucketName: process.env.MINIO_BUCKET_NAME,
    },
  };

  return enviroment;
};
