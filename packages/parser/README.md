# @uicp/parser

Core parsing library for extracting and rendering UICP (User Interface Context Protocol) blocks from LLM output.

## Installation

```bash
npm install @uicp/parser
```

## Features

- **Extract UICP blocks** from markdown text
- **Validate blocks** against component definitions
- **Dynamic component loading** with configurable base path
- **React component rendering** with error handling
- **TypeScript support** with full type definitions
- **Caching** for definitions and components

## Quick Start

```typescript
import {
  parseUICPContent,
  registerComponent,
  loadDefinitionsWithCache,
} from '@uicp/parser';
import { MyComponent } from './components/my-component';

// Register your component
registerComponent('MyComponent', MyComponent);

// Parse content
const parsed = await parseUICPContent(content, {
  definitions: './definitions.json',
  componentsBasePath: '/components/uicp',
});

// Render parsed content
parsed.forEach((item) => {
  if (item.type === 'component') {
    // Render React component
    return item.content;
  } else {
    // Render text
    return <Markdown>{item.content}</Markdown>;
  }
});
```

## API Reference

### Core Functions

#### `parseUICPContent(content, config)`

Parse content and return mixed text/component array.

```typescript
const parsed = await parseUICPContent(content, {
  definitions: './definitions.json',
  componentsBasePath: '/components/uicp',
});
```

**Parameters:**
- `content: string` - Content with UICP blocks
- `config: ParserConfig` - Configuration object
  - `definitions: string | Definitions` - Path/URL to definitions or object
  - `componentsBasePath?: string` - Base path for component imports (default: `/components/uicp`)

**Returns:** `Promise<ParsedContent[]>`

#### `parseUICPContentSync(content, definitions)`

Synchronous version for pre-registered components.

```typescript
const parsed = parseUICPContentSync(content, definitions);
```

#### `hasUICPBlocks(content)`

Check if content contains UICP blocks.

```typescript
if (hasUICPBlocks(content)) {
  // Parse the content
}
```

#### `extractUICPBlocks(content)`

Extract UICP blocks without rendering.

```typescript
const { blocks, contentWithPlaceholders } = extractUICPBlocks(content);
```

### Component Management

#### `registerComponent(uid, component)`

Register a component in the registry.

```typescript
import { SimpleCard } from './components/simple-card';
registerComponent('SimpleCard', SimpleCard);
```

#### `loadComponent(uid, componentPath, basePath)`

Dynamically load a component.

```typescript
const component = await loadComponent(
  'SimpleCard',
  'components/uicp/simple-card',
  '/components/uicp'
);
```

#### `getComponent(uid)`

Get a registered component.

```typescript
const component = getComponent('SimpleCard');
```

#### `getRegisteredComponents()`

Get all registered component UIDs.

```typescript
const uids = getRegisteredComponents();
// ['SimpleCard', 'DataTable']
```

#### `clearRegistry(uid?)`

Clear registry (all or specific component).

```typescript
clearRegistry('SimpleCard'); // Clear specific
clearRegistry(); // Clear all
```

### Validation

#### `validateUICPBlock(block, definitions)`

Validate a block against definitions.

```typescript
const { valid, errors } = validateUICPBlock(block, definitions);
if (!valid) {
  console.error('Validation errors:', errors);
}
```

### Definitions Loading

#### `loadDefinitions(source)`

Load definitions from URL, file path, or object.

```typescript
// From file
const defs = await loadDefinitions('./definitions.json');

// From URL
const defs = await loadDefinitions('https://api.example.com/definitions.json');

// From object
const defs = await loadDefinitions(definitionsObject);
```

#### `loadDefinitionsWithCache(source, ttl?)`

Load definitions with caching.

```typescript
const defs = await loadDefinitionsWithCache('./definitions.json', 5 * 60 * 1000);
```

**Parameters:**
- `source: string | Definitions` - Source to load from
- `ttl?: number` - Cache TTL in milliseconds (default: 5 minutes)

#### `clearDefinitionsCache(source?)`

Clear definitions cache.

```typescript
clearDefinitionsCache('./definitions.json'); // Clear specific
clearDefinitionsCache(); // Clear all
```

## TypeScript Types

```typescript
import type {
  UICPBlock,
  ParsedContent,
  ComponentDefinition,
  Definitions,
  ParserConfig,
  ValidationResult,
} from '@uicp/parser';
```

### Key Types

```typescript
interface UICPBlock {
  uid: string;
  data: Record<string, any>;
}

interface ParsedContent {
  type: 'text' | 'component';
  content: string | React.ReactElement;
  key: string;
}

interface ParserConfig {
  componentsBasePath?: string;
  definitions: string | Definitions;
}
```

## Usage Patterns

### With Next.js

```typescript
// components/message.tsx
'use client';

import { parseUICPContentSync, registerComponent } from '@uicp/parser';
import { SimpleCard } from './uicp/simple-card';
import definitions from '@/lib/definitions.json';

registerComponent('SimpleCard', SimpleCard);

export function Message({ content }) {
  const parsed = parseUICPContentSync(content, definitions);
  
  return (
    <div>
      {parsed.map((item) =>
        item.type === 'component' ? (
          <div key={item.key}>{item.content}</div>
        ) : (
          <Markdown key={item.key}>{item.content}</Markdown>
        )
      )}
    </div>
  );
}
```

### With Dynamic Imports

```typescript
// Let parser handle dynamic loading
const parsed = await parseUICPContent(content, {
  definitions: './definitions.json',
  componentsBasePath: '/components/uicp',
});
```

### Pre-registration for Performance

```typescript
// Register all components at startup
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from './components/simple-card';
import { DataTable } from './components/data-table';

registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);

// Now use sync parsing
const parsed = parseUICPContentSync(content, definitions);
```

## Configuration

### Component Base Path

The default base path is `/components/uicp`. Override it:

```typescript
const parsed = await parseUICPContent(content, {
  definitions: './definitions.json',
  componentsBasePath: '/my-custom-path',
});
```

### Definitions Source

Support for multiple sources:

```typescript
// Local file
definitions: './definitions.json'

// URL
definitions: 'https://api.example.com/definitions.json'

// Object
definitions: definitionsObject
```

## Error Handling

The parser handles errors gracefully:

- **Invalid JSON**: Shows original block
- **Missing component**: Shows warning with component name
- **Validation errors**: Shows detailed error list
- **Loading errors**: Logs to console and shows warning

## Best Practices

1. **Pre-register components** in production for better performance
2. **Use caching** for definitions to reduce file reads/fetches
3. **Validate early** using `validateUICPBlock` before rendering
4. **Handle errors** by checking `hasUICPBlocks` first
5. **Type everything** using provided TypeScript types

## License

MIT - see [LICENSE](../../LICENSE) for details.

