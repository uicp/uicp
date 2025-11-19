# Deployment

Deploy the example project to production.

## Vercel (Recommended)

Easiest deployment for Next.js applications.

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2. Import to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework: Next.js
   - Root Directory: `examples/nextjs-chat` (if deploying from monorepo)
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Add Environment Variables

In Vercel dashboard:

```
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o
```

### 4. Deploy

Click "Deploy" - Vercel will build and deploy your app.

## Netlify

### 1. Build Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 2. Deploy

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Add environment variables in Netlify dashboard.

## Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### Build and Run

```bash
docker build -t uicp-chat .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e OPENAI_MODEL=gpt-4o \
  uicp-chat
```

## Self-Hosted

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### With PM2

```bash
npm install -g pm2
pm2 start npm --name "uicp-chat" -- start
pm2 save
pm2 startup
```

## Environment Variables

Ensure these are set in production:

```env
OPENAI_API_KEY=sk-your-key-here      # Required
OPENAI_MODEL=gpt-4o                  # Optional (defaults to gpt-4o)
NODE_ENV=production                  # Auto-set by most platforms
```

## Performance Optimization

### 1. Enable Caching

Update definitions loading to use longer cache:

```typescript
// app/api/chat/route.ts
await getUIComponents(definitionsPath, {}, 60 * 60 * 1000); // 1 hour
```

### 2. Pre-register Components

Ensure components are pre-registered for fast initial render:

```typescript
// lib/uicp/registry.ts
import { registerComponent } from '@uicp/parser';
// Import and register all components
```

### 3. Enable Next.js Optimizations

```javascript
// next.config.mjs
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [], // Add image domains if needed
  },
};
```

## Security

### 1. Secure API Keys

- Never commit `.env.local` to git
- Use environment variables in production
- Rotate keys regularly

### 2. Rate Limiting

Consider adding rate limiting:

```typescript
// app/api/chat/route.ts
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
  });

  try {
    await limiter.check(req, 10, 'CACHE_TOKEN');
  } catch {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Handle request...
}
```

### 3. Validate Input

Add input validation:

```typescript
const MAX_MESSAGE_LENGTH = 1000;

if (messages.length === 0) {
  return new Response('No messages provided', { status: 400 });
}

const lastMessage = messages[messages.length - 1];
if (lastMessage.content.length > MAX_MESSAGE_LENGTH) {
  return new Response('Message too long', { status: 400 });
}
```

## Monitoring

### Error Tracking

Add error tracking with Sentry:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Analytics

Add analytics with Vercel Analytics:

```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Troubleshooting

### Build Errors

**Issue:** `Module not found`

**Solution:** Ensure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Runtime Errors

**Issue:** Components not rendering

**Solution:**
- Check component registration
- Verify definitions.json is accessible
- Check browser console for errors

### Performance Issues

**Issue:** Slow response times

**Solution:**
- Enable caching
- Pre-register components
- Check OpenAI API limits
- Monitor server resources

## Next Steps

- Monitor application performance
- Set up error tracking
- Configure CI/CD pipeline
- Add tests
- Scale as needed

