/**
 * OpenAPI 3.0 Specification for Clerk Auth Microservice API
 * 
 * This file defines the complete API schema that can be imported into Swagger UI
 * Save this content and import into: https://editor.swagger.io/
 */

export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Clerk Authentication Microservice API",
    description:
      "Public RESTful API for authentication services with Clerk integration, testmail.app notifications, and comprehensive security features",
    version: "1.0.0",
    contact: {
      name: "API Support",
      url: "https://github.com/imtushaarr/Clerk-Auth-Microservice",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:5173",
      description: "Development server",
    },
    {
      url: "http://localhost:3000",
      description: "Production server",
    },
  ],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        description: "Create a new user account with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "firstName", "lastName"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                    description: "User email address",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "SecurePass123!",
                    description:
                      "Password (min 8 chars, uppercase, lowercase, number, special char)",
                  },
                  firstName: {
                    type: "string",
                    example: "John",
                    description: "First name (min 2 characters)",
                  },
                  lastName: {
                    type: "string",
                    example: "Doe",
                    description: "Last name (min 2 characters)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "user_123456" },
                        email: { type: "string", example: "user@example.com" },
                        firstName: { type: "string", example: "John" },
                        lastName: { type: "string", example: "Doe" },
                        createdAt: { type: "string", format: "date-time" },
                      },
                    },
                    message: { type: "string", example: "User registered successfully" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    error: { type: "string" },
                    code: { type: "string", example: "VALIDATION_ERROR" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          429: {
            description: "Rate limit exceeded",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "User login",
        description: "Authenticate user with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "SecurePass123!",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        email: { type: "string" },
                        sessionId: { type: "string" },
                        token: { type: "string" },
                        expiresIn: { type: "number", example: 3600 },
                      },
                    },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          400: { description: "Validation failed" },
          401: { description: "Invalid credentials" },
          429: { description: "Too many login attempts" },
        },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ["Authentication"],
        summary: "Get user profile",
        description: "Fetch authenticated user's profile information",
        security: [{ BearerAuth: [] }, { SessionAuth: [] }],
        responses: {
          200: {
            description: "Profile retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        email: { type: "string" },
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/auth/verify": {
      post: {
        tags: ["Authentication"],
        summary: "Verify email address",
        description: "Verify user email with OTP or code",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "code"],
                properties: {
                  email: { type: "string", format: "email" },
                  code: { type: "string", minLength: 4, example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Email verified successfully" },
          400: { description: "Invalid code" },
          429: { description: "Too many verification attempts" },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh access token",
        description: "Get a new access token using refresh token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Token refreshed successfully" },
          401: { description: "Invalid refresh token" },
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        description: "Check if the service is running",
        responses: {
          200: {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "healthy" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token from login endpoint",
      },
      SessionAuth: {
        type: "apiKey",
        in: "cookie",
        name: "sessionId",
        description: "Session cookie",
      },
    },
  },
};
