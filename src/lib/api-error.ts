import { NextResponse } from "next/server";

/** Generic error shape returned to API callers */
interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Converts any thrown value into a structured, non-sensitive JSON error response.
 * Internal error details are logged server-side but never exposed to the caller.
 */
export function handleApiError(error: unknown, context?: string): NextResponse<ApiError> {
  const label = context ? `[${context}]` : "[API]";

  if (error instanceof Response) {
    console.error(`${label} Upstream response error: status=${error.status}`);
    return NextResponse.json(
      {
        error: "Service Error",
        message: "An upstream service returned an error.",
        statusCode: 502,
      },
      { status: 502 }
    );
  }

  if (error instanceof Error) {
    console.error(`${label} Unhandled error:`, error.message, error.stack);
  } else {
    console.error(`${label} Unknown error:`, error);
  }

  return NextResponse.json(
    {
      error: "Internal Server Error",
      message: "An unexpected error occurred. Please try again later.",
      statusCode: 500,
    },
    { status: 500 }
  );
}

/**
 * Creates a uniform 400 Bad Request response.
 */
export function badRequest(message: string): NextResponse<ApiError> {
  return NextResponse.json(
    { error: "Bad Request", message, statusCode: 400 },
    { status: 400 }
  );
}

/**
 * Creates a uniform 401 Unauthorized response.
 */
export function unauthorized(message = "Authentication required"): NextResponse<ApiError> {
  return NextResponse.json(
    { error: "Unauthorized", message, statusCode: 401 },
    { status: 401 }
  );
}

/**
 * Creates a uniform 403 Forbidden response.
 */
export function forbidden(message = "Access denied"): NextResponse<ApiError> {
  return NextResponse.json(
    { error: "Forbidden", message, statusCode: 403 },
    { status: 403 }
  );
}
