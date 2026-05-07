import { getConfig, validateConfigAtStartup } from "@/lib/config";

const INGREYHR_AVAILABLE_ROUTES = [
  "GET /api/health",
  "GET /api/auth/status",
  "POST /api/auth/login",
  "POST /api/auth/register",
  "POST /api/auth/verify",
  "POST /api/auth/refresh",
  "GET /api/auth/profile",
  "GET /api/auth/logout",
  "POST /api/webhooks/clerk",
  "POST /api/email/send-welcome",
];

export async function register(): Promise<void> {
  const ingreyhrIsDevelopment = process.env.NODE_ENV !== "production";

  if (!ingreyhrIsDevelopment) {
    return;
  }

  console.log("\n🚀 IngreyHR Auth Microservice starting...");

  try {
    validateConfigAtStartup();
    const ingreyhrConfig = getConfig();

    console.log("✅ IngreyHR Auth Microservice ready");
    console.log(`   Service: ${ingreyhrConfig.app.name}`);
    console.log(`   URL: ${ingreyhrConfig.app.url}`);
    console.log(`   Port: ${ingreyhrConfig.app.port}`);
    console.log(`   Environment: ${ingreyhrConfig.app.nodeEnv}`);
    console.log(`   Auth roles: company-admin | hr-admin | employee`);
    console.log("\n📡 Available API routes:");
    INGREYHR_AVAILABLE_ROUTES.forEach((ingreyhrRoute) => {
      console.log(`   - ${ingreyhrRoute}`);
    });
    console.log("\n🔌 HRMS integration:");
    console.log("   - Company portal login depends on this service");
    console.log("   - HR portal login depends on this service");
    console.log("   - Employee portal login depends on this service");
    console.log("   - Send Authorization: Bearer <token> from the IngreyHR UI apps");
    console.log("");
  } catch (ingreyhrStartupError) {
    console.error("❌ IngreyHR Auth Microservice startup failed");
    console.error(ingreyhrStartupError);
    throw ingreyhrStartupError;
  }
}
