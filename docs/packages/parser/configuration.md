# Configuration

Advanced configuration options for @uicp/parser.

## Component Base Path

Control where components are loaded from.

### Default Path

```typescript
// Default: /components/uicp
<UICPContent
  content={content}
  definitions={definitions}
/>
```

### Custom Path

```typescript
<UICPContent
  content={content}
  definitions={definitions}
  componentsBasePath="/my-components"
/>
```

### Path Resolution

Given `componentsBasePath: "/my-components"` and `componentPath: "simple-card"`:

```
/my-components/simple-card.tsx
/my-components/simple-card.jsx
/my-components/simple-card/index.tsx
/my-components/simple-card/index.jsx
```

## Definitions Source

Load definitions from multiple sources.

### Local File

```tsx
import definitions from '@/lib/uicp/definitions.json';

<UICPContent content={content} definitions={definitions} />
```

### File Path

```tsx
<UICPContent 
  content={content} 
  definitions="./lib/uicp/definitions.json" 
/>
```

### URL

```tsx
<UICPContent 
  content={content} 
  definitions="https://api.example.com/definitions.json" 
/>
```

### Environment-Based

```tsx
const definitionsSource = process.env.NODE_ENV === 'production'
  ? 'https://cdn.example.com/definitions.json'
  : './lib/uicp/definitions.json';

<UICPContent content={content} definitions={definitionsSource} />
```

## Caching

### Definitions Cache

Control how long definitions are cached.

```typescript
import { loadDefinitionsWithCache } from '@uicp/parser';

// Default: 5 minutes
const defs = await loadDefinitionsWithCache('./definitions.json');

// Custom: 10 minutes
const defs = await loadDefinitionsWithCache(
  './definitions.json',
  10 * 60 * 1000
);

// Disable caching
const defs = await loadDefinitionsWithCache('./definitions.json', 0);
```

### Clear Cache

```typescript
import { clearDefinitionsCache } from '@uicp/parser';

// Clear specific
clearDefinitionsCache('./definitions.json');

// Clear all
clearDefinitionsCache();
```

### Component Cache

Components are cached once loaded. Clear with:

```typescript
import { clearRegistry } from '@uicp/parser';

// Clear specific
clearRegistry('SimpleCard');

// Clear all
clearRegistry();
```

## Component Registration

### Pre-registration

Register all components at startup:

```typescript
// lib/uicp/registry.ts
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from '@/components/uicp/simple-card';
import { DataTable } from '@/components/uicp/data-table';

registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);

// In your app
import '@/lib/uicp/registry';
```

### Bulk Registration

```typescript
import { registerComponent } from '@uicp/parser';
import * as components from '@/components/uicp';

Object.entries(components).forEach(([name, component]) => {
  registerComponent(name, component);
});
```

### Conditional Registration

```typescript
if (process.env.FEATURE_CHARTS === 'true') {
  const { LineChart, BarChart } = await import('@/components/uicp/charts');
  registerComponent('LineChart', LineChart);
  registerComponent('BarChart', BarChart);
}
```

## Rendering Options

### Text Renderer

Custom rendering for text content:

```tsx
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

<UICPContent
  content={content}
  definitions={definitions}
  textRenderer={(text) => (
    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
      {text}
    </ReactMarkdown>
  )}
/>
```

### Component Wrapper

Wrap all components:

```tsx
<UICPContent
  content={content}
  definitions={definitions}
  componentWrapper={(component) => (
    <div className="component-container">
      <div className="component-wrapper">
        {component}
      </div>
      <div className="component-actions">
        <button>Copy</button>
        <button>Share</button>
      </div>
    </div>
  )}
/>
```

### Loading State

```tsx
<UICPContent
  content={content}
  definitions={definitions}
  loading={
    <div className="flex items-center gap-2">
      <Spinner />
      <span>Loading component...</span>
    </div>
  }
/>
```

### Error Fallback

```tsx
<UICPContent
  content={content}
  definitions={definitions}
  fallback={
    <div className="error-container">
      <AlertIcon />
      <span>Failed to render component</span>
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  }
/>
```

## TypeScript Configuration

### Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### JSON Imports

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

### Type Assertions

When importing definitions:

```typescript
import definitions from './definitions.json';

// Cast to any if TypeScript complains
parseUICPContentSync(content, definitions as any);
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const HeavyChart = lazy(() => import('@/components/uicp/heavy-chart'));

registerComponent('HeavyChart', HeavyChart);
```

### Memoization

```typescript
import { memo } from 'react';

export const SimpleCard = memo(function SimpleCard(props) {
  // Component implementation
});
```

### Pre-loading

```typescript
// Pre-load components before needed
useEffect(() => {
  import('@/components/uicp/data-table');
  import('@/components/uicp/chart');
}, []);
```

## Environment Variables

### Next.js

```env
# .env.local
NEXT_PUBLIC_DEFINITIONS_URL=https://api.example.com/definitions.json
NEXT_PUBLIC_COMPONENTS_BASE=/components/uicp
```

```tsx
<UICPContent
  content={content}
  definitions={process.env.NEXT_PUBLIC_DEFINITIONS_URL!}
  componentsBasePath={process.env.NEXT_PUBLIC_COMPONENTS_BASE}
/>
```

### Vite

```env
# .env
VITE_DEFINITIONS_URL=https://api.example.com/definitions.json
```

```tsx
<UICPContent
  content={content}
  definitions={import.meta.env.VITE_DEFINITIONS_URL}
/>
```

## Best Practices

1. **Pre-register in production** for faster initial render
2. **Use caching** with appropriate TTL for your use case
3. **Provide fallbacks** for loading and error states
4. **Custom text renderer** for consistent markdown styling
5. **Environment-based config** for different environments
6. **Type safety** with TypeScript throughout
7. **Monitor performance** with React DevTools

## Next Steps

- [API Reference](api-reference.md) - Complete API documentation
- [Best Practices](../../advanced/best-practices.md) - Production tips
- [Troubleshooting](../../advanced/troubleshooting.md) - Common issues

