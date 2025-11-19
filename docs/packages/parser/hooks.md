# React Hooks

@uicp/parser provides React hooks for programmatic control over parsing.

## useUICPParser

Hook for parsing UICP content with automatic definitions loading and component management.

### Basic Usage

```tsx
import { useUICPParser } from '@uicp/parser';

function Message({ content }) {
  const { parse, hasBlocks, isLoading, error } = useUICPParser({
    definitions: '/lib/uicp/definitions.json',
    componentsBasePath: '/components/uicp',
  });

  const [parsed, setParsed] = useState([]);

  useEffect(() => {
    if (hasBlocks(content)) {
      parse(content).then(setParsed);
    }
  }, [content, hasBlocks, parse]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {parsed.map((item) => (
        item.type === 'component' ? (
          <div key={item.key}>{item.content}</div>
        ) : (
          <div key={item.key}>{item.content}</div>
        )
      ))}
    </div>
  );
}
```

### Hook Signature

```typescript
function useUICPParser(
  config: UseUICPParserConfig
): UseUICPParserResult
```

### Configuration

```typescript
interface UseUICPParserConfig {
  definitions: string | Definitions;
  componentsBasePath?: string;
}
```

**definitions** (required): Definitions object or path/URL

**componentsBasePath** (optional): Base path for component imports (default: `/components/uicp`)

### Return Value

```typescript
interface UseUICPParserResult {
  parse: (content: string) => Promise<ParsedContent[]>;
  hasBlocks: (content: string) => boolean;
  definitions: Definitions | null;
  isLoading: boolean;
  error: Error | null;
}
```

#### parse()

Async function to parse content.

```typescript
const parsed = await parse(content);
```

**Parameters:**
- `content`: String to parse

**Returns:** `Promise<ParsedContent[]>` - Parsed content

#### hasBlocks()

Check if content contains UICP blocks.

```typescript
if (hasBlocks(content)) {
  // Content has blocks
}
```

**Parameters:**
- `content`: String to check

**Returns:** `boolean` - True if blocks found

#### definitions

Currently loaded definitions.

```typescript
if (definitions) {
  console.log('Loaded definitions:', definitions.version);
}
```

**Type:** `Definitions | null`

#### isLoading

Loading state for definitions.

```typescript
if (isLoading) {
  return <div>Loading definitions...</div>;
}
```

**Type:** `boolean`

#### error

Error if definitions failed to load.

```typescript
if (error) {
  return <div>Failed to load: {error.message}</div>;
}
```

**Type:** `Error | null`

## Complete Example

```tsx
import { useUICPParser } from '@uicp/parser';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export function Message({ content, role }) {
  const { parse, hasBlocks, isLoading, error } = useUICPParser({
    definitions: '/lib/uicp/definitions.json',
    componentsBasePath: '/components/uicp',
  });

  const [parsed, setParsed] = useState([]);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    if (role === 'assistant' && hasBlocks(content)) {
      setParsing(true);
      parse(content)
        .then(setParsed)
        .catch((err) => console.error('Parse error:', err))
        .finally(() => setParsing(false));
    }
  }, [content, role, hasBlocks, parse]);

  // Loading states
  if (isLoading) {
    return <div className="loading">Loading parser...</div>;
  }

  if (error) {
    return <div className="error">Parser error: {error.message}</div>;
  }

  // User messages
  if (role === 'user') {
    return <div className="user-message">{content}</div>;
  }

  // Parsing message
  if (parsing) {
    return <div className="loading">Parsing components...</div>;
  }

  // Assistant messages with UICP blocks
  if (hasBlocks(content) && parsed.length > 0) {
    return (
      <div className="assistant-message">
        {parsed.map((item) =>
          item.type === 'component' ? (
            <div key={item.key} className="component-wrapper">
              {item.content}
            </div>
          ) : (
            <div key={item.key} className="text-content">
              <ReactMarkdown>{item.content as string}</ReactMarkdown>
            </div>
          )
        )}
      </div>
    );
  }

  // Regular text
  return (
    <div className="assistant-message">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
```

## Use Cases

### Conditional Parsing

Only parse when needed:

```tsx
const { parse, hasBlocks } = useUICPParser({ definitions });

if (hasBlocks(content)) {
  const parsed = await parse(content);
  // Render parsed content
} else {
  // Render plain text
}
```

### Custom Loading States

Handle loading granularly:

```tsx
const { parse, isLoading } = useUICPParser({ definitions });
const [parsing, setParsing] = useState(false);

useEffect(() => {
  setParsing(true);
  parse(content).finally(() => setParsing(false));
}, [content, parse]);

if (isLoading || parsing) {
  return <Spinner />;
}
```

### Error Handling

Custom error handling:

```tsx
const { parse, error } = useUICPParser({ definitions });

useEffect(() => {
  parse(content).catch((err) => {
    logError(err);
    showNotification('Failed to parse content');
  });
}, [content, parse]);
```

### With Context

Use with UICPProvider:

```tsx
import { useUICPParser } from '@uicp/parser';

// Provider sets defaults
<UICPProvider definitions={definitions}>
  <MessageComponent />
</UICPProvider>

// Hook uses provider config
function MessageComponent() {
  const { parse } = useUICPParser({
    // Inherits from provider
  });
}
```

## Best Practices

### 1. Memoize parse callback

The `parse` function is stable and safe to use in dependencies:

```tsx
useEffect(() => {
  parse(content).then(setParsed);
}, [content, parse]); // ✅ Safe
```

### 2. Handle all states

Check loading, error, and success:

```tsx
if (isLoading) return <Loading />;
if (error) return <Error error={error} />;
// Render content
```

### 3. Pre-register components

For predictable behavior:

```tsx
// Before using hook
import '@/lib/uicp/registry';

// Then use hook
const { parse } = useUICPParser({ definitions });
```

### 4. Avoid unnecessary parsing

Check for blocks first:

```tsx
if (hasBlocks(content)) {
  await parse(content);
}
```

## Next Steps

- [React Components](react-components.md) - High-level components
- [API Reference](api-reference.md) - Low-level API
- [Configuration](configuration.md) - Advanced setup

