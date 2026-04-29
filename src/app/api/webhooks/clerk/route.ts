import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { sendSignupWelcomeEmail } from "@/lib/email";
import { apiError, withErrorHandler } from "@/lib/api-error";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

async function handleWebhook(req: Request): Promise<Response> {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    return apiError("INTERNAL_ERROR", "Webhook secret is not configured");
  }

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return apiError("BAD_REQUEST", "Missing required Svix headers");
  }

  const body = await req.text();
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return apiError("UNAUTHORIZED", "Webhook signature verification failed", err);
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name } = evt.data;

    const primaryEmail = email_addresses?.[0]?.email_address;

    if (primaryEmail) {
      try {
        await sendSignupWelcomeEmail(primaryEmail, first_name || undefined);
        console.log(`Welcome email sent to ${primaryEmail}`);
      } catch (error) {
        console.error(`Failed to send welcome email to ${primaryEmail}:`, error);
      }
    }

    console.log(`User created: ${id} with email ${primaryEmail}`);
  }

  return new Response("Webhook received", { status: 200 });
}

export const POST = withRateLimit(
  withErrorHandler(handleWebhook as (...args: unknown[]) => Promise<Response>),
  RATE_LIMITS.webhook,
  "webhook"
) as typeof handleWebhook;
