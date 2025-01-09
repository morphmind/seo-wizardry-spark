type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 100;

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.unshift(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.pop();
    }
    console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, entry.data || '');
  }

  info(message: string, data?: any) {
    this.addLog(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any) {
    this.addLog(this.formatMessage('warn', message, data));
  }

  error(message: string, data?: any) {
    this.addLog(this.formatMessage('error', message, data));
  }

  debug(message: string, data?: any) {
    this.addLog(this.formatMessage('debug', message, data));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
