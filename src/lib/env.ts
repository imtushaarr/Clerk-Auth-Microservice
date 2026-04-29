/**
 * Environment variable validation.
 * Call `validateEnv()` early in the application lifecycle so that missing
 * required variables surface at startup rather than at runtime.
 */

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  {
    name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    required: true,
    description: "Clerk publishable key (found in Clerk Dashboard)",
  },
  {
    name: "CLERK_SECRET_KEY",
    required: true,
    description: "Clerk secret key (found in Clerk Dashboard)",
  },
  {
    name: "CLERK_WEBHOOK_SECRET",
    required: true,
    description: "Clerk webhook signing secret (found in Clerk Dashboard → Webhooks)",
  },
  {
    name: "TESTMAIL_NAMESPACE",
    required: false,
    description: "Testmail namespace for email delivery (optional — emails are skipped if absent)",
  },
  {
    name: "TESTMAIL_API_KEY",
    required: false,
    description: "Testmail API key (optional — emails are skipped if absent)",
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: false,
    description: "Public URL of the application (defaults to http://localhost:5173)",
  },
];

/**
 * Validates that all required environment variables are present.
 * Logs warnings for optional but missing variables.
 *
 * @throws {Error} when one or more required variables are missing.
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];
    if (!value || value.trim() === "") {
      if (envVar.required) {
        missing.push(`  • ${envVar.name} — ${envVar.description}`);
      } else {
        warnings.push(`  • ${envVar.name} — ${envVar.description}`);
      }
    }
  }

  if (warnings.length > 0) {
    console.warn(
      "[env] Optional environment variables are not set — some features may be disabled:\n" +
        warnings.join("\n")
    );
  }

  if (missing.length > 0) {
    throw new Error(
      "[env] Missing required environment variables. " +
        "Set them in .env.local before starting the service:\n" +
        missing.join("\n")
    );
  }
}

/**
 * Returns a typed, validated snapshot of the application configuration.
 * Guaranteed to have all required values present.
 */
export function getConfig() {
  return {
    clerk: {
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
      secretKey: process.env.CLERK_SECRET_KEY!,
      webhookSecret: process.env.CLERK_WEBHOOK_SECRET!,
    },
    testmail: {
      namespace: process.env.TESTMAIL_NAMESPACE ?? "",
      apiKey: process.env.TESTMAIL_API_KEY ?? "",
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173",
    },
  };
}
