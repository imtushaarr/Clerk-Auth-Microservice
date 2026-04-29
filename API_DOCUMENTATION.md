# Public API Documentation

## Overview

The Clerk Authentication Microservice provides a comprehensive REST API for user authentication, registration, and profile management. The API is designed to be consumed by external applications, mobile apps, and back-end services.

**Base URL**: `http://localhost:5173/api` (Development)

## Key Features

- ✅ **JWT Token-based Authentication**
- ✅ **Rate Limiting** (5 attempts per 15 minutes for auth endpoints)
- ✅ **CORS Enabled** for cross-origin requests
- ✅ **Input Validation** with detailed error messages
- ✅ **Security Best Practices** (password requirements, secure headers)
- ✅ **Email Verification** via testmail.app
- ✅ **Token Refresh** mechanism

## Authentication

### Token-Based (JWT)

Include the JWT token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer <token>" \
  https://api.example.com/api/auth/profile
```

### Session-Based (Clerk)

Sessions are automatically managed via Clerk middleware.

## Rate Limiting

All endpoints respect rate limits. Check response headers for limits:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 3600
```

**Limits per endpoint:**
- Auth endpoints (login, register, verify): 5 requests per 15 minutes
- General API: 100 requests per minute

When rate limited, you'll receive a `429` response with `Retry-After` header.

## CORS Configuration

The API accepts requests from:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:8000`
- `NEXT_PUBLIC_APP_URL` (from .env)

## Endpoints

### POST /api/auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "User registered successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### POST /api/auth/login

Authenticate user and get access token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "email": "user@example.com",
    "sessionId": "sess_abc123",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  },
  "message": "Login successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "AUTHENTICATION_FAILED",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### GET /api/auth/profile

Fetch authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "sessionId": "sess_abc123",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Profile retrieved successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Unauthorized - Please provide valid credentials",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### POST /api/auth/verify

Verify email address with OTP code.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "email": "user@example.com",
    "verifiedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Email verified successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid or expired verification code",
  "code": "INVALID_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### POST /api/auth/refresh

Refresh expired access token.

**Request:**
```json
{
  "refreshToken": "refresh_token_abc123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "refreshToken": "refresh_token_xyz789",
    "sessionId": "sess_abc123"
  },
  "message": "Token refreshed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### GET /api/health

Health check endpoint (no authentication required).

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `AUTHENTICATION_FAILED` | 401 | Invalid credentials |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Response Format

All responses follow a consistent format:

```json
{
  "success": true|false,
  "data": {...},          // Optional, only on success
  "error": "...",         // Optional, only on error
  "message": "...",       // Optional
  "code": "ERROR_CODE",   // Optional
  "timestamp": "ISO8601"
}
```

## CURL Examples

### Register User
```bash
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:5173/api/auth/profile \
  -H "Authorization: Bearer <token_from_login>"
```

### Verify Email
```bash
curl -X POST http://localhost:5173/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "123456"
  }'
```

## OpenAPI / Swagger

Access the OpenAPI specification at:
- **JSON Format**: `GET /api/docs/openapi.json`
- **Swagger UI**: `GET /api/docs` (when deployed)

Import the JSON spec into [Swagger Editor](https://editor.swagger.io/) for interactive documentation.

## SDK/Client Libraries

### JavaScript / TypeScript
```typescript
const response = await fetch('http://localhost:5173/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});
const data = await response.json();
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:5173/api/auth/login',
    json={
        'email': 'user@example.com',
        'password': 'SecurePass123!'
    }
)
data = response.json()
```

## Security Considerations

1. **Always use HTTPS** in production
2. **Never expose tokens** in URLs or logs
3. **Validate inputs** on the client side
4. **Use strong passwords** (enforced by API)
5. **Implement token rotation** for long-lived sessions
6. **Handle rate limits gracefully** with exponential backoff
7. **Store tokens securely** (localStorage with caution, httpOnly cookies preferred)

## Support & Resources

- **GitHub**: [Clerk-Auth-Microservice](https://github.com/imtushaarr/Clerk-Auth-Microservice)
- **Clerk Docs**: [Clerk Documentation](https://clerk.com/docs)
- **testmail.app**: [Email Testing Service](https://testmail.app)

## Changelog

### v1.0.0 (2024-01-15)
- Initial release
- User registration with password validation
- JWT-based authentication
- Email verification support
- Token refresh mechanism
- Rate limiting and CORS support
