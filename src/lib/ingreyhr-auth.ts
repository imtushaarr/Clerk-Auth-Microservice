import crypto from "crypto";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

export type IngreyhrAuthRole = "company-admin" | "hr-admin" | "employee" | "ingreyhr-admin";

export interface IngreyhrAuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: IngreyhrAuthRole;
  sessionId: string;
  createdAt: string;
  expiresAt: string;
}

export interface IngreyhrAuthSession extends IngreyhrAuthProfile {
  token: string;
  expiresIn: number;
}

export interface IngreyhrRequestAuthContext {
  authenticated: boolean;
  source: "token" | "clerk" | null;
  profile: IngreyhrAuthProfile | null;
  clerkUserId?: string | null;
  clerkSessionId?: string | null;
}

const INGREYHR_ALLOWED_ROLES: IngreyhrAuthRole[] = [
  "company-admin",
  "hr-admin",
  "employee",
  "ingreyhr-admin",
];

const INGREYHR_TOKEN_SEPARATOR = ".";

function ingreyhrGetSigningKey(): string {
  return (
    process.env.INGREYHR_AUTH_SIGNING_KEY ||
    process.env.CLERK_SECRET_KEY ||
    "ingreyhr-development-signing-key"
  );
}

function ingreyhrGetTokenTtlSeconds(): number {
  const ingreyhrConfiguredTtl = Number(process.env.INGREYHR_AUTH_TOKEN_TTL_SECONDS || 3600);
  return Number.isFinite(ingreyhrConfiguredTtl) && ingreyhrConfiguredTtl > 0
    ? ingreyhrConfiguredTtl
    : 3600;
}

function ingreyhrBase64UrlEncode(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function ingreyhrBase64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function ingreyhrNormalizeRole(role?: string): IngreyhrAuthRole {
  if (!role) return "employee";
  return INGREYHR_ALLOWED_ROLES.includes(role as IngreyhrAuthRole)
    ? (role as IngreyhrAuthRole)
    : "employee";
}

export function ingreyhrIsValidRole(role?: string): role is IngreyhrAuthRole {
  if (!role) return false;
  return INGREYHR_ALLOWED_ROLES.includes(role as IngreyhrAuthRole);
}

export function ingreyhrInferRoleFromEmail(email: string): IngreyhrAuthRole {
  const normalizedEmail = email.toLowerCase();

  if (normalizedEmail.includes("company") || normalizedEmail.startsWith("company-")) {
    return "company-admin";
  }

  if (normalizedEmail.includes("hr") || normalizedEmail.startsWith("hr-")) {
    return "hr-admin";
  }

  return "employee";
}

function ingreyhrBuildSessionId(): string {
  return `ingreyhr_session_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

function ingreyhrBuildSubjectId(email: string): string {
  const emailSeed = email.toLowerCase().trim();
  const digest = crypto.createHash("sha256").update(emailSeed).digest("hex").slice(0, 16);
  return `ingreyhr_user_${digest}`;
}

function ingreyhrCreateSignature(payload: string): string {
  return crypto
    .createHmac("sha256", ingreyhrGetSigningKey())
    .update(payload)
    .digest("base64url");
}

export function ingreyhrCreateAuthToken(profile: IngreyhrAuthProfile): string {
  const tokenPayload = ingreyhrBase64UrlEncode(JSON.stringify(profile));
  const tokenSignature = ingreyhrCreateSignature(tokenPayload);
  return `${tokenPayload}${INGREYHR_TOKEN_SEPARATOR}${tokenSignature}`;
}

export function ingreyhrVerifyAuthToken(token: string): IngreyhrAuthProfile | null {
  const [tokenPayload, tokenSignature] = token.split(INGREYHR_TOKEN_SEPARATOR);

  if (!tokenPayload || !tokenSignature) return null;

  const expectedSignature = ingreyhrCreateSignature(tokenPayload);
  const incomingSignatureBuffer = Buffer.from(tokenSignature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    incomingSignatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(incomingSignatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const ingreyhrProfile = JSON.parse(ingreyhrBase64UrlDecode(tokenPayload)) as IngreyhrAuthProfile;
    if (!ingreyhrProfile?.expiresAt) return null;

    const expirationTime = new Date(ingreyhrProfile.expiresAt).getTime();
    if (Number.isNaN(expirationTime) || expirationTime <= Date.now()) return null;

    return ingreyhrProfile;
  } catch {
    return null;
  }
}

export function ingreyhrCreateAuthSession(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}): IngreyhrAuthSession {
  const ingreyhrRole = ingreyhrNormalizeRole(input.role || ingreyhrInferRoleFromEmail(input.email));
  const ingreyhrCreatedAt = new Date();
  const ingreyhrExpiresAt = new Date(
    ingreyhrCreatedAt.getTime() + ingreyhrGetTokenTtlSeconds() * 1000
  );
  const ingreyhrProfile: IngreyhrAuthProfile = {
    id: ingreyhrBuildSubjectId(input.email),
    email: input.email,
    firstName: input.firstName?.trim() || input.email.split("@")[0] || "IngreyHR",
    lastName: input.lastName?.trim() || ingreyhrRole.replace("-", " "),
    role: ingreyhrRole,
    sessionId: ingreyhrBuildSessionId(),
    createdAt: ingreyhrCreatedAt.toISOString(),
    expiresAt: ingreyhrExpiresAt.toISOString(),
  };

  return {
    ...ingreyhrProfile,
    token: ingreyhrCreateAuthToken(ingreyhrProfile),
    expiresIn: ingreyhrGetTokenTtlSeconds(),
  };
}

export function ingreyhrExtractBearerToken(request: NextRequest): string | null {
  const authorizationHeader = request.headers.get("authorization");
  if (!authorizationHeader?.startsWith("Bearer ")) return null;

  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token || null;
}

export async function ingreyhrResolveRequestAuth(
  request: NextRequest
): Promise<IngreyhrRequestAuthContext> {
  const ingreyhrToken = ingreyhrExtractBearerToken(request);

  if (ingreyhrToken) {
    const ingreyhrProfile = ingreyhrVerifyAuthToken(ingreyhrToken);
    if (ingreyhrProfile) {
      return {
        authenticated: true,
        source: "token",
        profile: ingreyhrProfile,
      };
    }
  }

  const ingreyhrClerkContext = await clerkAuth();
  if (ingreyhrClerkContext.userId) {
    const ingreyhrFallbackProfile: IngreyhrAuthProfile = {
      id: ingreyhrClerkContext.userId,
      email: `${ingreyhrClerkContext.userId}@ingreyhr.local`,
      firstName: "IngreyHR",
      lastName: "Clerk User",
      role: "employee",
      sessionId: ingreyhrClerkContext.sessionId || `ingreyhr_clerk_${ingreyhrClerkContext.userId}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ingreyhrGetTokenTtlSeconds() * 1000).toISOString(),
    };

    return {
      authenticated: true,
      source: "clerk",
      profile: ingreyhrFallbackProfile,
      clerkUserId: ingreyhrClerkContext.userId,
      clerkSessionId: ingreyhrClerkContext.sessionId,
    };
  }

  return {
    authenticated: false,
    source: null,
    profile: null,
    clerkUserId: null,
    clerkSessionId: null,
  };
}
