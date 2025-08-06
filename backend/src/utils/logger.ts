export interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  timestamp?: boolean;
}

class Logger {
  private level: string;
  private timestamp: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || 'info';
    this.timestamp = options.timestamp !== false;
  }

  private getTimestamp(): string {
    return this.timestamp ? `[${new Date().toISOString()}]` : '';
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(`${this.getTimestamp()} [DEBUG] ${message}`, meta || '');
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.info(`${this.getTimestamp()} [INFO] ${message}`, meta || '');
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`${this.getTimestamp()} [WARN] ${message}`, meta || '');
    }
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      console.error(`${this.getTimestamp()} [ERROR] ${message}`, meta || '');
    }
  }

  // Méthodes spécialisées pour les erreurs
  errorWithContext(message: string, error: Error, context?: any): void {
    this.error(message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    });
  }

  // Méthodes pour les requêtes HTTP
  request(method: string, url: string, duration?: number): void {
    this.info(`HTTP ${method} ${url}${duration ? ` - ${duration}ms` : ''}`);
  }

  // Méthodes pour les opérations de base de données
  db(operation: string, table: string, duration?: number): void {
    this.debug(`DB ${operation} on ${table}${duration ? ` - ${duration}ms` : ''}`);
  }
}

// Instance singleton
export const logger = new Logger({
  level: process.env['LOG_LEVEL'] as any || 'info',
  timestamp: process.env['NODE_ENV'] !== 'test'
});

// Export de la classe pour les tests
export { Logger }; 