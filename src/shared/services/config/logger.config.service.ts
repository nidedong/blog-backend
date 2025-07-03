import { Injectable } from '@nestjs/common';
import {
  utilities,
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
} from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import { isDevMode } from 'app.environment';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from 'shared/interfaces';

const { resolve, join } = path;

const { timestamp } = winston.format;

@Injectable()
export class LoggerConfigService implements WinstonModuleOptionsFactory {
  // logger exception file
  private exceptionFile;

  // logger level
  private defaultLogLevel;

  private timestampConfig = timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' });

  private formatter;

  private consoleTransport;

  private logTransports;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariable>,
  ) {
    const logEnv = this.configService.get('log', { infer: true });
    const defaultAppName = this.configService.get('app.name', { infer: true });
    const logDir = resolve(process.cwd(), `logs/${defaultAppName}`);
    const errorFile = join(logDir, '%DATE%-error.log');

    const logFile = join(logDir, '%DATE%.log');
    const defaultMaxSize = logEnv.max_file_size;
    const defaultMaxFiles = logEnv.max_history_days;

    const dailyFormatter = winston.format.combine(
      this.timestampConfig,
      utilities.format.nestLike(defaultAppName, {
        // 日志文件里关闭颜色，会乱码
        colors: false,
        prettyPrint: true,
      }),
    );

    this.defaultLogLevel = logEnv.level;
    this.exceptionFile = join(logDir, 'exceptions.log');
    this.formatter = winston.format.combine(
      this.timestampConfig,
      utilities.format.nestLike(defaultAppName, {
        colors: true,
        prettyPrint: true,
      }),
    );
    this.consoleTransport = new winston.transports.Console({
      format: this.formatter,
      level: this.defaultLogLevel,
    });
    this.logTransports = [
      this.consoleTransport,
      // 错误日志信息
      new DailyRotateFile({
        level: 'error',
        filename: errorFile,
        datePattern: 'YYYY-MM-DD',
        maxFiles: defaultMaxFiles,
        maxSize: defaultMaxSize,
        format: dailyFormatter,
      }),
      // 所有日志信息
      new DailyRotateFile({
        filename: logFile,
        datePattern: 'YYYY-MM-DD',
        maxFiles: defaultMaxFiles,
        maxSize: defaultMaxSize,
        format: dailyFormatter,
      }),
    ];
  }

  createWinstonModuleOptions():
    | Promise<WinstonModuleOptions>
    | WinstonModuleOptions {
    return {
      level: this.defaultLogLevel,
      format: this.formatter,
      // 生产环境才开启日志信息存储
      transports: isDevMode ? this.consoleTransport : this.logTransports,
      // transports: this.logTransports,
      exceptionHandlers: [
        // 所有日志信息
        new winston.transports.File({
          filename: this.exceptionFile,
        }),
      ],
      exitOnError: false,
    };
  }
}
