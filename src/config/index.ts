import dotenv from "dotenv";

// Load environment variables
dotenv.config();

class Config {
  // Server configuration
  public readonly PORT: number;
  public readonly NODE_ENV: string;

  // Database configuration
  public readonly DATABASE_PATH: string;

  // JWT configuration
  public readonly JWT_SECRET: string;
  public readonly ACCESS_TOKEN_EXPIRES_IN: string;
  public readonly REFRESH_TOKEN_EXPIRES_IN: string;
  public readonly REFRESH_TOKEN_SECRET: string;

  // Logger configuration
  public readonly LOG_LEVEL: string;

  // CORS configuration
  public readonly FRONTEND_ORIGINS: string[];

  private static instance: Config;

  private constructor() {
    // Server
    this.PORT = parseInt(process.env.APP_PORT || "3000", 10);
    this.NODE_ENV = process.env.NODE_ENV || "development";

    // Database (SQLite + Sequelize)
    this.DATABASE_PATH = process.env.DATABASE_PATH || "./database.sqlite";

    // JWT
    this.JWT_SECRET =
      process.env.JWT_SECRET || "your-secret-key-change-in-production";
    this.ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "1h";
    this.REFRESH_TOKEN_EXPIRES_IN =
      process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
    this.REFRESH_TOKEN_SECRET =
      process.env.REFRESH_TOKEN_SECRET ||
      "your-secret-refresh-key-change-in-production";

    // Logger
    this.LOG_LEVEL =
      process.env.LOG_LEVEL ||
      (this.NODE_ENV === "development" ? "debug" : "info");

    // CORS - Parse comma-separated origins or use default
    const frontendOriginsEnv =
      process.env.FRONTEND_ORIGIN || "http://localhost:3001";
    this.FRONTEND_ORIGINS = frontendOriginsEnv
      .split(",")
      .map((origin) => origin.trim());

    // Validate required environment variables
    this.validate();
  }

  /**
   * Get singleton instance of Config
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Validate required environment variables
   */
  private validate(): void {
    const required: string[] = [];

    // Add validation for required env vars if needed
    // For example:
    // if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
    //   required.push('JWT_SECRET');
    // }

    if (required.length > 0) {
      throw new Error(
        `Missing required environment variables: ${required.join(", ")}`
      );
    }
  }

  /**
   * Check if running in development mode
   */
  public isDevelopment(): boolean {
    return this.NODE_ENV === "development";
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.NODE_ENV === "production";
  }
}

// Export singleton instance
export default Config.getInstance();
