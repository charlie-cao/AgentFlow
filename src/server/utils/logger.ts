import { config } from './load-env';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = this.getLogLevel(config.log.level);
  }

  private getLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
      default:
        return LogLevel.INFO;
    }
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] ${level}: ${message}${dataStr}`;
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any) {
    if (level <= this.level) {
      const formattedMessage = this.formatMessage(levelName, message, data);

      // Also write to file if configured
      if (config.log.file) {
        Bun.write(config.log.file, formattedMessage + '\n', { createPath: true });
      }

      // Console output with colors
      switch (level) {
        case LogLevel.ERROR:
          console.error(`\x1b[31m${formattedMessage}\x1b[0m`);
          break;
        case LogLevel.WARN:
          console.warn(`\x1b[33m${formattedMessage}\x1b[0m`);
          break;
        case LogLevel.DEBUG:
          console.debug(`\x1b[36m${formattedMessage}\x1b[0m`);
          break;
        case LogLevel.INFO:
        default:
          console.info(`\x1b[32m${formattedMessage}\x1b[0m`);
      }
    }
  }

  error(message: string, data?: any) {
    this.log(LogLevel.ERROR, 'ERROR', message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }
}

export const logger = new Logger();