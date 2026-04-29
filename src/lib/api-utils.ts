import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

export function errorResponse(
  statusCode: number,
  error: string,
  code?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain lowercase letters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain uppercase letters");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain numbers");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain special characters (!@#$%^&*)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic international phone validation
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateObject(
  obj: Record<string, any>,
  schema: Record<string, (value: any) => ValidationError | null>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [field, validator] of Object.entries(schema)) {
    const error = validator(obj[field]);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

export const RATE_LIMIT_HEADERS = {
  "X-RateLimit-Limit": "100",
  "X-RateLimit-Remaining": "99",
  "X-RateLimit-Reset": "3600",
};
