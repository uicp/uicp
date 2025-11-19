# Best Practices

Production-ready patterns and recommendations for UICP.

## Component Design

### 1. Keep Components Simple

Each component should have one clear purpose.

```tsx
// ✅ Good - focused purpose
export function ProductCard({ title, price, image }) {
  return <div>{/* ... */}</div>;
}

// ❌ Bad - too many responsibilities
export function SuperCard({ type, data, config, handlers }) {
  // Complex branching logic...
}
```

### 2. Use TypeScript

Type your component props:

```tsx
interface ProductCardProps {
  title: string;
  price: number;
  image?: string;
  onBuy?: () => void;
}

export function ProductCard({ title, price, image, onBuy }: ProductCardProps) {
  return <div>{/* ... */}</div>;
}
```

### 3. Provide Defaults

Set sensible defaults for optional props:

```tsx
export function Card({ 
  title, 
  variant = 'default',
  showFooter = true 
}: CardProps) {
  return <div>{/* ... */}</div>;
}
```

### 4. Validate Props

Add runtime validation:

```tsx
export function MetricCard({ value, max = 100 }: MetricCardProps) {
  if (value < 0 || value > max) {
    return <ErrorDisplay message="Invalid value range" />;
  }
  
  return <div>{/* ... */}</div>;
}
```

## Definition Writing

### 1. Clear Descriptions

Help AI understand when to use components:

```json
{
  "description": "Display product information with image, price, and title. Use for e-commerce product displays, shopping carts, and product recommendations."
}
```

### 2. Comprehensive Examples

Provide realistic examples:

```json
{
  "example": {
    "uid": "ProductCard",
    "data": {
      "title": "Wireless Mouse",
      "price": 29.99,
      "image": "https://example.com/mouse.jpg",
      "inStock": true,
      "rating": 4.5
    }
  }
}
```

### 3. Document All Fields

Explain every input field:

```json
{
  "inputs": {
    "status": {
      "type": "string",
      "description": "Order status: 'pending' for new, 'shipped' for in-transit, 'delivered' for completed",
      "enum": ["pending", "shipped", "delivered"]
    }
  }
}
```

## Performance

### 1. Pre-register Components

In production, pre-register all components:

```typescript
// lib/uicp/registry.ts
import { registerComponent } from '@uicp/parser';
import * as components from '@/components/uicp';

Object.entries(components).forEach(([name, component]) => {
  registerComponent(name, component);
});
```

### 2. Use Caching

Cache definitions with appropriate TTL:

```typescript
// Development: 5 minutes
const devTTL = 5 * 60 * 1000;

// Production: 1 hour
const prodTTL = 60 * 60 * 1000;

const ttl = process.env.NODE_ENV === 'production' ? prodTTL : devTTL;
await getUIComponents(definitionsPath, {}, ttl);
```

### 3. Memoize Components

Use React.memo for expensive components:

```tsx
export const DataTable = React.memo(function DataTable({ headers, rows }) {
  return <table>{/* ... */}</table>;
});
```

### 4. Code Splitting

Split large component libraries:

```tsx
// Lazy load heavy components
const HeavyChart = lazy(() => import('@/components/uicp/heavy-chart'));

registerComponent('HeavyChart', HeavyChart);
```

## Security

### 1. Validate Input

Always validate component data:

```typescript
// In API route
if (data.url && !isValidUrl(data.url)) {
  return { success: false, error: 'Invalid URL' };
}
```

### 2. Sanitize Content

Sanitize user-provided content:

```tsx
import DOMPurify from 'isomorphic-dompurify';

export function RichTextCard({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### 3. Rate Limiting

Add rate limiting to API endpoints:

```typescript
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    await rateLimit(req);
  } catch {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  // Handle request...
}
```

## Error Handling

### 1. Graceful Degradation

Always provide fallbacks:

```tsx
<UICPContent
  content={content}
  definitions={definitions}
  fallback={<div>Unable to render component</div>}
/>
```

### 2. Error Boundaries

Wrap UICP components:

```tsx
<ErrorBoundary fallback={<ErrorDisplay />}>
  <UICPContent content={content} definitions={definitions} />
</ErrorBoundary>
```

### 3. Logging

Log errors for debugging:

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  const parsed = await parseUICPContent(content, config);
} catch (error) {
  Sentry.captureException(error);
  console.error('Parse error:', error);
}
```

## Testing

### 1. Unit Tests

Test component rendering:

```typescript
import { render } from '@testing-library/react';
import { SimpleCard } from '@/components/uicp/simple-card';

test('renders card with title', () => {
  const { getByText } = render(
    <SimpleCard title="Test" content="Content" />
  );
  expect(getByText('Test')).toBeInTheDocument();
});
```

### 2. Integration Tests

Test UICP parsing:

```typescript
import { parseUICPContentSync, registerComponent } from '@uicp/parser';
import { SimpleCard } from '@/components/uicp/simple-card';

test('parses UICP block', () => {
  registerComponent('SimpleCard', SimpleCard);
  
  const content = '```uicp\n{"uid":"SimpleCard","data":{"title":"Test"}}\n```';
  const parsed = parseUICPContentSync(content, definitions);
  
  expect(parsed[0].type).toBe('component');
});
```

### 3. E2E Tests

Test complete flow:

```typescript
test('AI creates and renders component', async () => {
  // Send message
  await page.type('#input', 'Create a welcome card');
  await page.click('#send');
  
  // Wait for component
  await page.waitForSelector('.uicp-component');
  
  // Verify rendering
  const card = await page.$('.uicp-component');
  expect(card).toBeTruthy();
});
```

## Monitoring

### 1. Track Usage

Monitor which components are used:

```typescript
export function trackComponentUsage(uid: string) {
  // Analytics
  analytics.track('component_rendered', { uid });
}
```

### 2. Performance Monitoring

Track parsing performance:

```typescript
const start = performance.now();
const parsed = await parseUICPContent(content, config);
const duration = performance.now() - start;

if (duration > 100) {
  console.warn('Slow parsing:', duration, 'ms');
}
```

### 3. Error Tracking

Monitor errors in production:

```typescript
window.addEventListener('error', (event) => {
  if (event.error.stack?.includes('uicp')) {
    // Log UICP-related errors
    logError(event.error);
  }
});
```

## Documentation

### 1. Component Documentation

Document your components:

```tsx
/**
 * ProductCard component displays product information.
 * 
 * @param title - Product name
 * @param price - Price in USD
 * @param image - Product image URL
 * @returns React component
 */
export function ProductCard({ title, price, image }: ProductCardProps) {
  return <div>{/* ... */}</div>;
}
```

### 2. Definition Comments

Add comments in definitions:

```json
{
  "// Note": "This component is used for e-commerce displays",
  "uid": "ProductCard",
  "description": "..."
}
```

### 3. README Files

Create README for your components:

```markdown
# UICP Components

## Available Components

- **SimpleCard**: Basic information card
- **DataTable**: Tabular data display
- **ProductCard**: E-commerce product display

## Adding Components

1. Create component file
2. Add definition
3. Register component
4. Test with AI
```

## Deployment

### 1. Environment Variables

Use environment variables for configuration:

```env
DEFINITIONS_URL=https://cdn.example.com/definitions.json
COMPONENTS_BASE_PATH=/components/uicp
CACHE_TTL=3600000
```

### 2. CDN for Definitions

Host definitions on CDN for updates without deployment:

```typescript
const definitionsUrl = process.env.DEFINITIONS_URL || './definitions.json';
```

### 3. Versioning

Version your definitions:

```json
{
  "version": "2.1.0",
  "components": [...]
}
```

## Next Steps

- [Troubleshooting](troubleshooting.md) - Common issues
- [Component Definitions](component-definitions.md) - Definition guide
- [Validation](validation.md) - Validation details

