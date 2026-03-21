/**
 * Central logging facade. All log calls in the app go through here.
 * To switch to a different log format or provider (pino, winston, Sentry, etc.),
 * change the implementation of these methods — nothing else needs updating.
 */
export class AppLogger {
  static log(message: string, context = 'App'): void {
    console.log(`[${context}] ${message}`);
  }

  static error(message: string, stack?: string, context = 'App'): void {
    console.error(`[${context}] ${message}`);
    if (stack) console.error(stack);
  }
}
