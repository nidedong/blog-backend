/// 服务运行相关环境变量
export const environment = process.env.NODE_ENV || 'development';
export const isDevMode = Object.is(environment, 'development');
export const isProdMode = Object.is(environment, 'production');

export default {
  environment,
  isDevMode,
  isProdMode,
};
