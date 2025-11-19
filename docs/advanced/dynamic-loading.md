# Dynamic Loading

UICP supports both pre-registered and dynamically loaded components.

## Loading Strategies

### Pre-registration (Recommended for Production)

Register all components at app startup.

**Advantages:**
- Faster initial render
- No async loading delays
- Works with SSR
- Predictable bundle size

**Implementation:**
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

### Dynamic Loading (Development)

Load components on-demand when needed.

**Advantages:**
- Smaller initial bundle
- Lazy loading benefits
- Good for large component libraries

**Implementation:**
```typescript
const parsed = await parseUICPContent(content, {
  definitions: './definitions.json',
  componentsBasePath: '/components/uicp',
});
```

### Mixed Approach

Pre-register common components, lazy load rare ones.

```typescript
// Pre-register common
registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);

// Others load dynamically via parseUICPContent
```

## Component Loading Process

### 1. Check Registry

```typescript
const component = getComponent(uid);
if (component) {
  // Use registered component
  return component;
}
```

### 2. Dynamic Import

```typescript
try {
  const module = await import(`${basePath}/${componentPath}`);
  const component = module.default || module[uid];
  
  // Cache for future use
  registerComponent(uid, component);
  
  return component;
} catch (error) {
  console.error('Failed to load component:', error);
  return ErrorComponent;
}
```

## Best Practices

1. **Production:** Pre-register all components
2. **Development:** Use dynamic loading for flexibility
3. **Large apps:** Mix both strategies
4. **SSR:** Always pre-register

## Next Steps

- [Validation](validation.md) - Component validation
- [Error Handling](error-handling.md) - Handle failures
- [Best Practices](best-practices.md) - Production tips

