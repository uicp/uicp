# Caching

@uicp/tools includes built-in caching for definitions to improve performance.

## Default Behavior

Definitions are cached automatically with a 5-minute TTL:

```typescript
const result = await getUIComponents('./definitions.json');
// First call: loads from file
// Subsequent calls within 5 minutes: returns from cache
```

## Custom TTL

Set a custom cache TTL:

```typescript
// 10 minutes
await getUIComponents('./definitions.json', {}, 10 * 60 * 1000);

// 1 hour
await getUIComponents('./definitions.json', {}, 60 * 60 * 1000);
```

## Disable Caching

Set TTL to 0 to disable caching:

```typescript
await getUIComponents('./definitions.json', {}, 0);
```

## Clear Cache

```typescript
import { clearCache } from '@uicp/tools';

// Clear specific
clearCache('./definitions.json');

// Clear all
clearCache();
```

## Cache Statistics

```typescript
import { getCacheStats } from '@uicp/tools';

const stats = getCacheStats();
console.log('Cached entries:', stats.size);
console.log('URIs:', stats.entries);
```

## Best Practices

- Use default caching in development
- Increase TTL in production (30-60 minutes)
- Clear cache when definitions change
- Monitor cache size in long-running processes

