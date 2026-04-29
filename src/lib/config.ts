/**
 * Startup configuration validation.
 * Validates all required environment variables at boot and fails fast
 * with a clear message listing any missing or malformed variables.
 */

interface ConfigVariable {
  name: string;
  description: string;
  required: boolean;
}

const CONFIG_VARIABLES: ConfigVariable[] = [
  {
    name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    description: "Clerk publishable key (from Clerk Dashboard)",
    required: true,
  },
  {
    name: "CLERK_SECRET_KEY",
    description: "Clerk secret key (from Clerk Dashboard)",
    required: true,
  },
  {
    name: "CLERK_WEBHOOK_SECRET",
    description: "Clerk webhook signing secret (from Clerk Dashboard)",
    required: true,
  },
  {
    name: "TESTMAIL_NAMESPACE",
    description: "Testmail namespace for sending emails",
    required: true,
  },
  {
    name: "TESTMAIL_API_KEY",
    description: "Testmail API key",
    required: true,
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    description: "Public URL of the application (e.g. http://localhost:5173)",
    required: false,
  },
  {
    name: "TESTMAIL_TIMEOUT",
    description: "Timeout in milliseconds for Testmail API requests (default: 10000)",
    required: false,
  },
];

export function validateConfig(): void {
  const missing: string[] = [];

  for (const variable of CONFIG_VARIABLES) {
    if (variable.required && !process.env[variable.name]) {
      missing.push(`  - ${variable.name}: ${variable.description}`);
    }
  }

  if (missing.length > 0) {
    const message = [
      "❌ Missing required environment variables:",
      ...missing,
      "",
      "Please set the above variables in your .env.local file before starting the service.",
      "Refer to README.md for the full list of required configuration variables.",
    ].join("\n");

    console.error(message);
    throw new Error(`Missing required environment variables:\n${missing.join("\n")}`);
  }
}

export const config = {
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
    secretKey: process.env.CLERK_SECRET_KEY ?? "",
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET ?? "",
  },
  testmail: {
    namespace: process.env.TESTMAIL_NAMESPACE ?? "",
    apiKey: process.env.TESTMAIL_API_KEY ?? "",
    timeout: Number(process.env.TESTMAIL_TIMEOUT) || 10000,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173",
    port: Number(process.env.PORT) || 5173,
  },
} as const;
