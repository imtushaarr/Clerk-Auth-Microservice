# IngreyHR Auth Microservice

A modern authentication API microservice built with Next.js and Clerk, featuring email notifications through testmail.app and role-aware auth tokens for the IngreyHR portals.

## Features

- ✅ **Clerk Authentication** - Secure user authentication with Clerk
- ✅ **Email Notifications** - Automatic welcome emails via testmail.app
- ✅ **Webhook Integration** - Real-time events from Clerk
- ✅ **Public REST API** - RESTful endpoints for external integration
- ✅ **Role-Based Auth** - Token sessions for company-admin, hr-admin, and employee portals
- ✅ **Rate Limiting** - Built-in rate limiting for security
- ✅ **CORS Support** - Cross-origin request handling
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **API Documentation** - OpenAPI/Swagger spec included

## Tech Stack

- **Framework**: Next.js 14+
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **Email Service**: testmail.app
- **Language**: TypeScript
- **Port**: 5173

## Prerequisites

Before running this project, you need:

1. **Clerk Account** - Sign up at [https://clerk.com](https://clerk.com)
   - Create a new application
   - Get your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

2. **testmail.app Account** - Sign up at [https://testmail.app](https://testmail.app)
   - Get your `TESTMAIL_NAMESPACE` and `TESTMAIL_API_KEY`

3. **Node.js 18+** - Download from [https://nodejs.org](https://nodejs.org)

4. **Optional - Redis** (recommended for production)
  - Used for session store, token revocation blacklist, and shared rate-limit counters.
  - Provide `REDIS_URL` or `INGREYHR_REDIS_URL` in your environment.

## Installation

1. Clone the repository:
```bash
cd /Users/agustya/Documents/Projects/Clerk-Auth-Microservice
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your credentials:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
INGREYHR_AUTH_SIGNING_KEY=your_signing_key
INGREYHR_AUTH_TOKEN_TTL_SECONDS=3600
INGREYHR_CORS_ORIGINS=["http://localhost:5173","http://localhost:5174","http://localhost:5175"]
TESTMAIL_NAMESPACE=your_testmail_namespace
TESTMAIL_API_KEY=your_testmail_api_key
```

## Setup Clerk Webhooks

1. Go to Clerk Dashboard
2. Navigate to Webhooks
3. Create a new webhook endpoint:
   - **URL**: `http://localhost:5173/api/webhooks/clerk` (for local development)
   - **Events**: Select `user.created`
4. Copy the signing secret and add it to `.env.local` as `CLERK_WEBHOOK_SECRET`

## Running the Application

### Development Mode

```bash
npm run dev
```

The API will be available at `http://localhost:5173`

On startup, the service prints readiness logs and the available auth endpoints. If configuration is invalid, startup fails with a clear error.

## Redis & Session Store (recommended)

This microservice supports an optional Redis backend for high-performance session storage and revocation lists. If `REDIS_URL` (or `INGREYHR_REDIS_URL`) is set and `ioredis` is installed, the service will use Redis; otherwise it falls back to an in-memory store (suitable for local dev only).

Install Redis client (recommended for production):

```bash
npm install ioredis
```

The session helper is available at `src/lib/session-store.ts` and provides:
- `setSession(sessionId, session, ttlSeconds)`
- `getSession(sessionId)`
- `revokeSession(sessionId, ttlSeconds)`
- `isRevoked(sessionId)`
- `incrCounter(key, windowSeconds)` (useful for rate limits)

Set `REDIS_URL=redis://localhost:6379` in `.env.local` to enable.

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns the service status.

### Auth Status
```
GET /api/auth/status
```
Returns the current authentication status (requires authentication).

### IngreyHR Integration

The HRMS frontends authenticate with this service by sending `Authorization: Bearer <token>` to `/api/auth/login`, `/api/auth/register`, `/api/auth/profile`, `/api/auth/refresh`, `/api/auth/status`, and `/api/auth/logout`.

Supported roles are:

- `company-admin`
- `hr-admin`
- `employee`

### Clerk Webhooks
```
POST /api/webhooks/clerk
```
Receives events from Clerk and triggers email notifications.

## User Flow

1. **User Signs Up**: Calls `POST /api/auth/register` from the HRMS portal
2. **Account Created**: Auth service creates the role-aware session
3. **Webhook Event**: Clerk sends a `user.created` event
4. **Email Sent**: Welcome email is sent via testmail.app
5. **User Signs In**: HRMS portal calls `POST /api/auth/login`
6. **Dashboard Access**: HRMS portals use the returned bearer token for protected API calls

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── status/route.ts      # Auth status endpoint
│   │   ├── health/route.ts           # Health check endpoint
│   │   └── webhooks/
│   │       └── clerk/route.ts        # Clerk webhook handler
├── lib/
│   ├── api-utils.ts                 # Response helpers and validation
│   ├── config.ts                    # Environment configuration
│   ├── cors.ts                      # CORS and security headers
│   ├── email.ts                     # Email notification service
│   ├── ingreyhr-auth.ts             # IngreyHR auth token logic
│   ├── openapi-spec.ts              # OpenAPI specification
│   └── rate-limit.ts                # Rate limiting helpers
└── middleware.ts                    # Public route handling

```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key (exposed to browser) |
| `CLERK_SECRET_KEY` | Clerk secret key (server-only) |
| `CLERK_WEBHOOK_SECRET` | Webhook signing secret from Clerk |
| `TESTMAIL_NAMESPACE` | Your testmail namespace |
| `TESTMAIL_API_KEY` | Your testmail API key |

## Testing Email Notifications

1. Sign up with an email
2. Check your testmail inbox at `https://testmail.app/v1/{namespace}?inboxId={email}`
3. You should see the welcome email

## Security Considerations

- All sensitive keys are stored in `.env.local` (not committed to git)
- Clerk webhook signatures are verified
- Protected routes require authentication
- CSRF protection enabled by default in Next.js

## Troubleshooting

### Webhook not triggering?
- Verify the webhook URL is correct in Clerk dashboard
- Check that `CLERK_WEBHOOK_SECRET` is set correctly
- Review server logs for any errors

### Emails not sending?
- Verify testmail credentials in `.env.local`
- Check testmail.app dashboard for email logs
- Ensure the email format is correct

### Authentication issues?
- Clear browser cookies and cache
- Verify Clerk keys are correct
- Check Clerk dashboard for any errors

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Update your Clerk webhook URL to production URL
5. Deploy

### Deploy to Other Platforms

Ensure:
- Node.js 18+ is supported
- Environment variables are configured
- HTTPS is enabled (required by Clerk)
- Webhook URL is updated to production

## 🔌 Public API Integration

This microservice exposes a comprehensive RESTful API for external integration with the IngreyHR portals.

### Quick API Examples

#### Register User
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

#### Login
```bash
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### Get Profile (Authenticated)
```bash
curl -X GET http://localhost:5173/api/auth/profile \
  -H "Authorization: Bearer <token_from_login>"
```

### Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `POST` | `/api/auth/verify` | Verify email/OTP | ❌ |
| `POST` | `/api/auth/refresh` | Refresh token | ✅ |
| `GET` | `/api/auth/profile` | Get user profile | ✅ |
| `GET` | `/api/health` | Health check | ❌ |

### API Documentation

Complete API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**OpenAPI Spec**: Access at `GET /api/docs/openapi.json`

### Features

- **Rate Limiting**: 5 auth attempts per 15 minutes, 100 general requests per minute
- **CORS Enabled**: Works with localhost and external origins
- **Input Validation**: Strong password requirements, email validation
- **Error Handling**: Consistent error responses with detailed codes
- **Security Headers**: XSS protection, Content-Type enforcement, HSTS

### Integration Example (JavaScript)

```javascript
// Register
const registerResponse = await fetch('http://localhost:5173/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe'
  })
});

// Login
const loginResponse = await fetch('http://localhost:5173/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});
const { data } = await loginResponse.json();
const token = data.token;

// Get Profile
const profileResponse = await fetch('http://localhost:5173/api/auth/profile', {
  headers: { Authorization: `Bearer ${token}` }
});
const profile = await profileResponse.json();
```

## License

MIT

## Support

For issues or questions:
- Clerk: [https://clerk.com/support](https://clerk.com/support)
- testmail.app: [https://testmail.app/support](https://testmail.app/support)

---

**Happy Authenticating! 🚀**
