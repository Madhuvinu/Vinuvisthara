// Frontend logging utility
// Logs are written to localStorage and can be sent to backend

interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

class FrontendLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.loadLogsFromStorage();
    this.setupErrorHandlers();
  }

  private loadLogsFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('frontend_logs');
      if (stored) {
        this.logs = JSON.parse(stored).slice(-this.maxLogs);
      }
    } catch (error) {
      // Failed to load logs - start with empty array
    }
  }

  private saveLogsToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('frontend_logs', JSON.stringify(this.logs.slice(-this.maxLogs)));
    } catch (error) {
      // Failed to save logs - silently ignore (storage may be full)
    }
  }

  private setupErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('Unhandled error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });
    });

    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason,
        error: event.reason?.stack || String(event.reason),
      });
    });
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.maskSensitiveData(context),
    };

    // Try to get user ID from storage
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const auth = JSON.parse(authData);
        entry.userId = auth.user?.id;
      }
    } catch (error) {
      // Ignore
    }

    return entry;
  }

  private maskSensitiveData(data?: Record<string, any>): Record<string, any> | undefined {
    if (!data) return data;

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
    const masked = { ...data };

    for (const key in masked) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = this.maskSensitiveData(masked[key]);
      }
    }

    return masked;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.saveLogsToStorage();

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = entry.level === 'ERROR' ? 'error' :
                           entry.level === 'WARN' ? 'warn' :
                           entry.level === 'DEBUG' ? 'debug' : 'log';
      console[consoleMethod](`[${entry.level}] ${entry.message}`, entry.context);
    }

    // Send critical errors to backend
    if (entry.level === 'ERROR') {
      this.sendToBackend(entry).catch(() => {
        // Ignore errors when sending to backend
      });
    }
  }

  private async sendToBackend(entry: LogEntry): Promise<void> {
    try {
      // In production, you might want to batch these or send via a dedicated endpoint
      // For now, we'll just store locally
      // You can implement backend logging endpoint if needed
    } catch (error) {
      // Ignore
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    // Only log debug messages in development
    if (process.env.NODE_ENV === 'development') {
      this.addLog(this.createLogEntry('DEBUG', message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    this.addLog(this.createLogEntry('INFO', message, context));
  }

  warn(message: string, context?: Record<string, any>): void {
    this.addLog(this.createLogEntry('WARN', message, context));
  }

  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    const errorContext = error instanceof Error
      ? { error: error.message, stack: error.stack, ...error, ...context }
      : { error, ...context };
    this.addLog(this.createLogEntry('ERROR', message, errorContext));
  }

  getLogs(level?: LogEntry['level'], limit: number = 100): LogEntry[] {
    let filtered = this.logs;
    if (level) {
      filtered = this.logs.filter(log => log.level === level);
    }
    return filtered.slice(-limit);
  }

  clearLogs(): void {
    this.logs = [];
    this.saveLogsToStorage();
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new FrontendLogger();
export default logger;
