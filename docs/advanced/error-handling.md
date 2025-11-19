# Error Handling

UICP handles errors gracefully at every stage to maintain a stable UI.

## Error Types

### 1. Parse Errors

Invalid JSON in UICP blocks.

**Handling:**
- Shows original block text
- Logs error to console
- Doesn't break UI

### 2. Missing Component

Component not found in registry or file system.

**Handling:**
- Shows warning with component name
- Suggests available components
- Logs error to console

### 3. Validation Errors

Data doesn't match schema.

**Handling:**
- Lists specific validation failures
- Shows expected vs actual
- Doesn't render component

### 4. Loading Errors

Failed to load component file.

**Handling:**
- Shows fallback component
- Logs error details
- Retries on next occurrence

## Error Handling Patterns

### Component Level

```tsx
export function MyComponent(props) {
  try {
    // Validate props
    if (!isValid(props)) {
      return <ErrorDisplay message="Invalid props" />;
    }
    
    // Render component
    return <div>{/* ... */}</div>;
  } catch (error) {
    console.error('Component error:', error);
    return <ErrorDisplay message="Rendering error" />;
  }
}
```

### Parser Level

```tsx
<UICPContent
  content={content}
  definitions={definitions}
  fallback={<div className="error">Failed to render component</div>}
  loading={<div className="loading">Loading...</div>}
/>
```

### API Level

```typescript
// app/api/chat/route.ts
try {
  const result = await createUIComponent(definitionsPath, { uid, data });
  
  if (!result.success) {
    // Return error to AI for retry
    return {
      success: false,
      error: result.error,
      message: 'Please try again with correct data',
    };
  }
  
  return result;
} catch (error) {
  console.error('Tool execution error:', error);
  
  return {
    success: false,
    error: 'Internal error',
  };
}
```

## Error Boundaries

Use React Error Boundaries for production:

```tsx
class UICPErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UICP Error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <div>Failed to render component</div>;
    }

    return this.props.children;
  }
}

// Usage
<UICPErrorBoundary>
  <UICPContent content={content} definitions={definitions} />
</UICPErrorBoundary>
```

## Logging

### Development

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('UICP Block:', block);
  console.log('Validation:', validation);
}
```

### Production

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // UICP operations
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: 'uicp-parser' },
    extra: { block, definitions },
  });
}
```

## User-Friendly Errors

Show helpful messages to users:

```tsx
function ErrorDisplay({ error }) {
  const messages = {
    'missing-component': 'This component is not available.',
    'validation-failed': 'Invalid component data.',
    'loading-failed': 'Failed to load component.',
  };

  return (
    <div className="error-container">
      <span className="error-icon">⚠️</span>
      <p>{messages[error.type] || 'An error occurred'}</p>
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}
```

## Best Practices

1. **Never crash the UI** - Always provide fallbacks
2. **Log everything** - Help debugging in production
3. **Clear messages** - Help users understand issues
4. **Graceful degradation** - Show text if components fail
5. **Error tracking** - Monitor production errors
6. **Retry logic** - Some errors are transient

## Next Steps

- [Validation](validation.md) - Validation details
- [Best Practices](best-practices.md) - Production tips
- [Troubleshooting](troubleshooting.md) - Common issues

