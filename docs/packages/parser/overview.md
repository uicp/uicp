# @uicp/parser Overview

The **@uicp/parser** package is the frontend component of UICP. It extracts UICP blocks from LLM output, validates them, and renders them as React components.

## What It Does

@uicp/parser handles the complete frontend flow:

1. **Detection**: Identifies UICP blocks in text content
2. **Extraction**: Separates blocks from regular text
3. **Validation**: Validates block data against component definitions
4. **Loading**: Loads React components (pre-registered or dynamic)
5. **Rendering**: Creates React elements with validated data

## Key Features

### 🎯 Simple API

Choose your preferred level of control:

**High-level** (recommended):
```tsx
<UICPContent content={message} definitions={definitions} />
```

**Mid-level**:
```tsx
const { parse } = useUICPParser({ definitions });
const parsed = await parse(message);
```

**Low-level**:
```tsx
const parsed = await parseUICPContent(message, { definitions });
```

### ⚡ Performance

- **Caching**: Definitions and components cached automatically
- **Lazy loading**: Components load on-demand
- **Pre-registration**: Optional for maximum performance
- **Memoization**: React-friendly component output

### 🔒 Type Safety

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  UICPBlock,
  ParsedContent,
  ComponentDefinition,
  Definitions,
  ValidationResult,
} from '@uicp/parser';
```

### 🛡️ Error Handling

Graceful error handling at every step:

- Invalid JSON → Shows original block
- Missing component → Shows warning with component name
- Validation errors → Lists specific failures
- Loading errors → Logs and shows fallback

### 🎨 Flexible Components

Multiple component strategies:

**Pre-registration** (production):
```typescript
registerComponent('MyComponent', MyComponent);
```

**Dynamic loading** (development):
```typescript
const parsed = await parseUICPContent(content, {
  definitions,
  componentsBasePath: '/components/uicp',
});
```

**Mixed approach**:
```typescript
// Pre-register common components
registerComponent('SimpleCard', SimpleCard);
// Others load dynamically
```

## Package Contents

### React Components

- **`<UICPContent />`**: All-in-one component for parsing and rendering
- **`<UICPProvider />`**: Context provider for shared configuration

### React Hooks

- **`useUICPParser(config)`**: Hook for programmatic parsing
- React context for provider pattern

### Core Functions

- **`parseUICPContent(content, config)`**: Main parsing function
- **`parseUICPContentSync(content, definitions)`**: Synchronous version
- **`hasUICPBlocks(content)`**: Check for blocks
- **`extractUICPBlocks(content)`**: Extract without rendering

### Component Management

- **`registerComponent(uid, component)`**: Register component
- **`loadComponent(uid, path, basePath)`**: Dynamic loading
- **`getComponent(uid)`**: Retrieve registered component
- **`getRegisteredComponents()`**: List all registered UIDs
- **`clearRegistry(uid?)`**: Clear registry

### Validation

- **`validateUICPBlock(block, definitions)`**: Validate block data

### Definitions

- **`loadDefinitions(source)`**: Load from file/URL/object
- **`loadDefinitionsWithCache(source, ttl?)`**: Load with caching
- **`clearDefinitionsCache(source?)`**: Clear cache

## Installation

```bash
npm install @uicp/parser
```

See [Installation Guide](installation.md) for details.

## Quick Start

### Simplest Setup

```tsx
'use client';

import { UICPContent } from '@uicp/parser';
import ReactMarkdown from 'react-markdown';
import definitions from '@/lib/uicp/definitions.json';
import '@/lib/uicp/registry'; // Pre-register components

export function Message({ content }: { content: string }) {
  return (
    <UICPContent
      content={content}
      definitions={definitions}
      textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
    />
  );
}
```

### With Manual Registration

```tsx
'use client';

import { parseUICPContentSync, hasUICPBlocks, registerComponent } from '@uicp/parser';
import { SimpleCard } from '@/components/uicp/simple-card';
import definitions from '@/lib/uicp/definitions.json';

registerComponent('SimpleCard', SimpleCard);

export function Message({ content }: { content: string }) {
  if (!hasUICPBlocks(content)) {
    return <div>{content}</div>;
  }

  const parsed = parseUICPContentSync(content, definitions);
  
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

## Usage Patterns

### Pattern 1: Simplified Component (Recommended)

Best for most applications.

```tsx
<UICPContent
  content={message.content}
  definitions={definitions}
  textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
/>
```

**Pros:**
- Simplest API
- Automatic handling
- Error boundaries included
- Loading states built-in

**Cons:**
- Less control over rendering

### Pattern 2: Hook-Based

More control while staying declarative.

```tsx
const { parse, hasBlocks, isLoading } = useUICPParser({
  definitions,
  componentsBasePath: '/components/uicp',
});

useEffect(() => {
  if (hasBlocks(content)) {
    parse(content).then(setParsed);
  }
}, [content, hasBlocks, parse]);
```

**Pros:**
- More control
- Custom loading states
- Programmatic usage

**Cons:**
- More code
- Manual state management

### Pattern 3: Manual Parsing

Maximum control for complex scenarios.

```tsx
const parsed = await parseUICPContent(content, {
  definitions,
  componentsBasePath: '/components/uicp',
});
```

**Pros:**
- Full control
- Custom error handling
- Integration flexibility

**Cons:**
- Most code
- Manual everything

## Architecture

### Parsing Flow

```
Input Content
    ↓
hasUICPBlocks() → false → Return original content
    ↓ true
extractUICPBlocks()
    ↓
Split into blocks and text
    ↓
For each block:
    ↓
validateUICPBlock() → invalid → Show error
    ↓ valid
loadComponent() → missing → Show warning
    ↓ loaded
Render React element
    ↓
Return ParsedContent[]
```

### Component Loading

```
Component Request
    ↓
Check Registry
    ↓
In Registry? → Yes → Return component
    ↓ No
Dynamic Import
    ↓
Success? → Yes → Cache & return
    ↓ No
Error → Show fallback
```

## Browser Compatibility

@uicp/parser works in all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- React Native (via Metro bundler)

Requires:
- ES2020 features
- Dynamic imports (for dynamic loading)
- React 18+

## Server-Side Rendering

Works with SSR frameworks:

**Next.js**: Use `'use client'` directive
**Remix**: Works in client components
**Gatsby**: Works with client-side rendering

Pre-registration recommended for SSR to avoid dynamic imports during server rendering.

## Performance Considerations

### Bundle Size

Base package is small (~10KB gzipped), but:

- Dynamic imports add overhead per component
- Pre-registration includes all components upfront
- Choose based on your needs

### Runtime Performance

- Parsing is fast (< 1ms for typical content)
- Component loading is async (first load only)
- Caching eliminates repeated loads
- React memoization works naturally

### Optimization Tips

1. **Pre-register** frequently used components
2. **Use caching** for definitions
3. **Lazy load** rare components
4. **Memoize** expensive components with `React.memo`
5. **Code split** large component libraries

## TypeScript Support

Full TypeScript support with:

- Exported types for all APIs
- Strict type checking
- JSDoc comments
- IDE autocomplete

```typescript
import type {
  UICPBlock,
  ParsedContent,
  ComponentDefinition,
  Definitions,
  ParserConfig,
  ValidationResult,
  UICPContentProps,
  UseUICPParserConfig,
} from '@uicp/parser';
```

## Next Steps

- [Installation Guide](installation.md) - Set up the package
- [API Reference](api-reference.md) - Detailed API documentation
- [React Components](react-components.md) - Component usage
- [Hooks](hooks.md) - Hook-based usage
- [Configuration](configuration.md) - Advanced configuration

## Resources

- [GitHub Repository](https://github.com/uicp/uicp)
- [NPM Package](https://www.npmjs.com/package/@uicp/parser)
- [Example Project](../../example-project/overview.md)
- [TypeScript Definitions](https://github.com/uicp/uicp/blob/main/packages/parser/src/types.ts)

