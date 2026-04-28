# Clerk Auth Microservice

A modern authentication microservice built with Next.js and Clerk, featuring email notifications through testmail.app.

## Features

- ✅ **Clerk Authentication** - Secure user authentication with Clerk
- ✅ **Email Notifications** - Automatic welcome emails via testmail.app
- ✅ **Webhook Integration** - Real-time events from Clerk
- ✅ **User Dashboard** - Protected dashboard for authenticated users
- ✅ **Sign In & Sign Up** - Beautiful authentication pages
- ✅ **API Endpoints** - Health checks and auth status endpoints

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

The application will be available at `http://localhost:5173`

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

### Clerk Webhooks
```
POST /api/webhooks/clerk
```
Receives events from Clerk and triggers email notifications.

## User Flow

1. **User Signs Up**: Navigates to `/sign-up`
2. **Account Created**: Clerk creates the user account
3. **Webhook Event**: Clerk sends a `user.created` event
4. **Email Sent**: Welcome email is sent via testmail.app
5. **User Signs In**: User can sign in at `/sign-in`
6. **Dashboard Access**: Authenticated users can access `/dashboard`

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
│   ├── sign-in/
│   │   └── [[...sign-in]]/page.tsx   # Sign in page
│   ├── sign-up/
│   │   └── [[...sign-up]]/page.tsx   # Sign up page
│   ├── dashboard/
│   │   └── page.tsx                  # Protected dashboard
│   ├── page.tsx                      # Home page
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── lib/
│   └── email.ts                      # Email notification service
└── middleware/
    └── auth.ts                       # Auth middleware

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

## License

MIT

## Support

For issues or questions:
- Clerk: [https://clerk.com/support](https://clerk.com/support)
- testmail.app: [https://testmail.app/support](https://testmail.app/support)

---

**Happy Authenticating! 🚀**
