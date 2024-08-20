type LogLevel = "off" | "errors" | "normal" | "verbose";

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = "normal";

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    console.log(`Log level set to: ${level}`);
  }

  public error(...args: any[]): void {
    if (this.logLevel !== "off") {
      console.error(...args);
    }
  }

  public warn(...args: any[]): void {
    if (this.logLevel === "normal" || this.logLevel === "verbose") {
      console.warn(...args);
    }
  }

  public log(...args: any[]): void {
    if (this.logLevel === "normal" || this.logLevel === "verbose") {
      console.log(...args);
    }
  }

  public verbose(...args: any[]): void {
    if (this.logLevel === "verbose") {
      console.log("[VERBOSE]", ...args);
    }
  }
}

export const logger = Logger.getInstance();
