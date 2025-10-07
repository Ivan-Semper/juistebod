/**
 * Professional Logging System
 * Structured logging for the JuisteBod backend
 */

import { AppConfig } from '@/lib/config/app.config';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  error?: Error;
  requestId?: string;
  userId?: string;
  endpoint?: string;
  duration?: number;
}

class Logger {
  private readonly levels = {
    error: LogLevel.ERROR,
    warn: LogLevel.WARN,
    info: LogLevel.INFO,
    debug: LogLevel.DEBUG,
  };

  private readonly colors = {
    [LogLevel.ERROR]: '\x1b[31m', // Red
    [LogLevel.WARN]: '\x1b[33m',  // Yellow
    [LogLevel.INFO]: '\x1b[36m',  // Cyan
    [LogLevel.DEBUG]: '\x1b[35m', // Magenta
  };

  private readonly reset = '\x1b[0m';

  private shouldLog(level: LogLevel): boolean {
    const configLevel = this.levels[AppConfig.logging.level as keyof typeof this.levels];
    return level <= configLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = LogLevel[entry.level].padEnd(5);
    const color = this.colors[entry.level] || '';
    
    let message = `${color}[${timestamp}] ${level}${this.reset} ${entry.message}`;
    
    if (entry.endpoint) {
      message += ` | ${entry.endpoint}`;
    }
    
    if (entry.duration) {
      message += ` | ${entry.duration}ms`;
    }
    
    if (entry.requestId) {
      message += ` | req:${entry.requestId}`;
    }
    
    if (entry.metadata) {
      message += ` | ${JSON.stringify(entry.metadata)}`;
    }
    
    if (entry.error) {
      message += `\n${entry.error.stack}`;
    }
    
    return message;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      error,
    };

    const formattedMessage = this.formatMessage(entry);

    if (AppConfig.logging.enableConsole) {
      console.log(formattedMessage);
    }

    // In production, you might want to send logs to external services
    if (AppConfig.logging.enableFile) {
      // TODO: Implement file logging
    }
  }

  error(message: string, metadata?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  // Request logging helper
  request(method: string, url: string, statusCode: number, duration: number, requestId?: string): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `${method} ${url} ${statusCode}`;
    
    this.log(level, message, {
      method,
      url,
      statusCode,
      duration,
      requestId,
    });
  }

  // Scraping specific logging
  scraping = {
    start: (url: string, requestId?: string) => {
      this.info(`Starting scrape`, { url, requestId });
    },
    
    success: (url: string, duration: number, requestId?: string) => {
      this.info(`Scrape successful`, { url, duration, requestId });
    },
    
    error: (url: string, error: Error, duration: number, requestId?: string) => {
      this.error(`Scrape failed`, { url, duration, requestId }, error);
    },
    
    retry: (url: string, attempt: number, maxAttempts: number, requestId?: string) => {
      this.warn(`Scrape retry ${attempt}/${maxAttempts}`, { url, attempt, maxAttempts, requestId });
    },
  };
}

export const logger = new Logger(); 