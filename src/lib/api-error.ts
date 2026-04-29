import { NextResponse } from "next/server";

/**
 * Standard API error codes used across all endpoints.
 */
export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

/**
 * Standardized error response shape returned by all API routes.
 */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}

const STATUS_MAP: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500,
};

/**
 * Creates a standardized JSON error response.
 *
 * Internal error details are never exposed to clients — only the
 * provided `message` is returned. Full error context is logged
 * server-side when `cause` is supplied.
 *
 * @example
 * return apiError("UNAUTHORIZED", "You must be logged in");
 * return apiError("INTERNAL_ERROR", "Something went wrong", err);
 */
export function apiError(
  code: ApiErrorCode,
  message: string,
  cause?: unknown
): NextResponse<ApiErrorBody> {
  if (cause !== undefined) {
    console.error(`[api-error] ${code}: ${message}`, cause);
  }

  const status = STATUS_MAP[code];
  return NextResponse.json<ApiErrorBody>(
    { error: { code, message } },
    { status }
  );
}

/**
 * Wraps an async route handler so that any unhandled exceptions are
 * converted into a standardized 500 response instead of crashing or
 * leaking stack traces to the client.
 *
 * @example
 * export const GET = withErrorHandler(async (req) => { ... });
 */
export function withErrorHandler<T>(
  handler: (...args: T[]) => Promise<NextResponse>
): (...args: T[]) => Promise<NextResponse> {
  return async (...args: T[]) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("[api-error] Unhandled exception in route handler:", err);
      return apiError("INTERNAL_ERROR", "An unexpected error occurred");
    }
  };
}
