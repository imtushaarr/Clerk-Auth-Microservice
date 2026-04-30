/**
 * Environment Configuration Management
 * Validates and provides access to all environment variables
 * Runs at startup to ensure all required configs are present
 */

export interface EnvConfig {
  // Application
  app: {
    name: string;
    url: string;
    port: number;
    nodeEnv: "development" | "production" | "test";
    isProduction: boolean;
  };

  // Clerk Authentication
  clerk: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };

  // Testmail Email Service
  testmail: {
    namespace: string;
    apiKey: string;
    apiUrl: string;
    enabled: boolean;
  };

  // API Configuration
  api: {
    corsOrigins: string[];
    rateLimitAuthWindow: number; // milliseconds
    rateLimitAuthMax: number;
    rateLimitGeneralWindow: number;
    rateLimitGeneralMax: number;
  };

  // Logging
  logging: {
    level: "debug" | "info" | "warn" | "error";
    verbose: boolean;
  };
}

class ConfigValidator {
  private errors: string[] = [];

  private getEnv(key: string, defaultValue?: string): string | undefined {
    const value = process.env[key];
    if (value === undefined && defaultValue === undefined) {
      this.errors.push(`❌ Missing required environment variable: ${key}`);
      return undefined;
    }
    return value || defaultValue;
  }

  private getEnvNumber(key: string, defaultValue?: number): number {
    const value = this.getEnv(key);
    if (value === undefined) {
      if (defaultValue !== undefined) return defaultValue;
      throw new Error(`Missing required numeric env var: ${key}`);
    }
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      this.errors.push(`❌ Invalid number for ${key}: ${value}`);
      return defaultValue || 0;
    }
    return num;
  }

  private getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value === "true" || value === "1" || value === "yes";
  }

  private parseJsonArray(value: string | undefined, defaultValue: string[]): string[] {
    if (!value) return defaultValue;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch {
      this.errors.push(`❌ Invalid JSON array for CORS origins: ${value}`);
      return defaultValue;
    }
  }

  validate(): EnvConfig {
    const nodeEnv = (process.env.NODE_ENV || "development") as
      | "development"
      | "production"
      | "test";
    const isProduction = nodeEnv === "production";

    const config: EnvConfig = {
      app: {
        name: this.getEnv("APP_NAME") || "Clerk Auth Microservice",
        url: this.getEnv("NEXT_PUBLIC_APP_URL") || "http://localhost:5173",
        port: this.getEnvNumber("PORT", 5173),
        nodeEnv,
        isProduction,
      },

      clerk: {
        publishableKey:
          this.getEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") || "",
        secretKey: this.getEnv("CLERK_SECRET_KEY") || "",
        webhookSecret: this.getEnv("CLERK_WEBHOOK_SECRET") || "",
      },

      testmail: {
        namespace: this.getEnv("TESTMAIL_NAMESPACE") || "",
        apiKey: this.getEnv("TESTMAIL_API_KEY") || "",
        apiUrl: this.getEnv("TESTMAIL_API_URL") || "https://api.testmail.app/api/json",
        enabled: this.getEnvBoolean("TESTMAIL_ENABLED", true),
      },

      api: {
        corsOrigins: this.parseJsonArray(
          process.env.CORS_ORIGINS,
          [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8000",
          ]
        ),
        rateLimitAuthWindow: this.getEnvNumber("RATE_LIMIT_AUTH_WINDOW", 15 * 60 * 1000),
        rateLimitAuthMax: this.getEnvNumber("RATE_LIMIT_AUTH_MAX", 5),
        rateLimitGeneralWindow: this.getEnvNumber("RATE_LIMIT_GENERAL_WINDOW", 60 * 1000),
        rateLimitGeneralMax: this.getEnvNumber("RATE_LIMIT_GENERAL_MAX", 100),
      },

      logging: {
        level: (process.env.LOG_LEVEL || "info") as
          | "debug"
          | "info"
          | "warn"
          | "error",
        verbose: this.getEnvBoolean("LOG_VERBOSE", false),
      },
    };

    // Validate critical configs
    this.validateCriticalConfigs(config);

    return config;
  }

  private validateCriticalConfigs(config: EnvConfig): void {
    const { app, clerk, testmail } = config;
    const isProduction = app.isProduction;

    // Check Clerk configuration
    if (!clerk.publishableKey) {
      this.errors.push(
        "❌ Clerk: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"
      );
    }
    if (!clerk.secretKey) {
      this.errors.push("❌ Clerk: CLERK_SECRET_KEY is required");
    }
    if (!clerk.webhookSecret) {
      this.errors.push("❌ Clerk: CLERK_WEBHOOK_SECRET is required");
    }

    // Check Testmail configuration (only if enabled)
    if (testmail.enabled) {
      if (!testmail.namespace) {
        this.errors.push(
          "⚠️  Testmail: TESTMAIL_NAMESPACE is recommended for email features"
        );
      }
      if (!testmail.apiKey) {
        this.errors.push(
          "⚠️  Testmail: TESTMAIL_API_KEY is recommended for email features"
        );
      }
    }

    // Production-specific checks
    if (isProduction) {
      if (!config.app.url.startsWith("https://")) {
        this.errors.push(
          "⚠️  Production: NEXT_PUBLIC_APP_URL should use HTTPS"
        );
      }
      if (config.app.port !== 443 && config.app.port !== 80) {
        this.errors.push(
          `⚠️  Production: PORT should be 80 or 443, not ${config.app.port}`
        );
      }
    }
  }

  getErrors(): string[] {
    return this.errors;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.errors.some((e) => e.startsWith("⚠️"));
  }

  printValidationResult(): void {
    if (!this.hasErrors() && !this.hasWarnings()) {
      console.log("✅ All environment variables validated successfully");
      return;
    }

    console.log("\n📋 Configuration Validation Report:");
    console.log("=====================================");

    const errors = this.errors.filter((e) => e.startsWith("❌"));
    const warnings = this.errors.filter((e) => e.startsWith("⚠️"));

    if (errors.length > 0) {
      console.log("\n🔴 ERRORS:");
      errors.forEach((e) => console.log(e));
    }

    if (warnings.length > 0) {
      console.log("\n🟡 WARNINGS:");
      warnings.forEach((e) => console.log(e));
    }

    if (errors.length > 0) {
      console.log(
        "\n❌ Configuration validation failed. Please fix the errors above."
      );
      process.exit(1);
    }

    if (warnings.length > 0) {
      console.log("\n⚠️  Configuration has warnings. Please review above.");
    }
  }
}

let cachedConfig: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (cachedConfig) return cachedConfig;

  const validator = new ConfigValidator();
  const config = validator.validate();

  // Only print in development and at startup
  if (process.env.NODE_ENV !== "production" && !process.env.CONFIG_VALIDATED) {
    validator.printValidationResult();
    process.env.CONFIG_VALIDATED = "true";
  }

  cachedConfig = config;
  return config;
}

export function validateConfigAtStartup(): void {
  const validator = new ConfigValidator();
  validator.validate();
  validator.printValidationResult();
}
