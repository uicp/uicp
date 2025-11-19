# @uicp/parser API Reference

Complete API documentation for @uicp/parser.

## Core Functions

### parseUICPContent()

Parse content and return mixed text/component array with dynamic component loading.

```typescript
async function parseUICPContent(
  content: string,
  config: ParserConfig
): Promise<ParsedContent[]>
```

**Parameters:**
- `content`: String containing text and UICP blocks
- `config`: Configuration object
  - `definitions`: Definitions object or path/URL to definitions file
  - `componentsBasePath`: Base path for component imports (default: `/components/uicp`)

**Returns:** `Promise<ParsedContent[]>` - Array of parsed content items

**Example:**
```typescript
const parsed = await parseUICPContent(content, {
  definitions: './definitions.json',
  componentsBasePath: '/components/uicp',
});
```

### parseUICPContentSync()

Synchronous version using pre-registered components only.

```typescript
function parseUICPContentSync(
  content: string,
  definitions: Definitions
): ParsedContent[]
```

**Parameters:**
- `content`: String containing text and UICP blocks
- `definitions`: Definitions object

**Returns:** `ParsedContent[]` - Array of parsed content items

**Example:**
```typescript
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from './components/simple-card';

registerComponent('SimpleCard', SimpleCard);

const parsed = parseUICPContentSync(content, definitions);
```

### hasUICPBlocks()

Check if content contains UICP blocks.

```typescript
function hasUICPBlocks(content: string): boolean
```

**Parameters:**
- `content`: String to check

**Returns:** `boolean` - True if UICP blocks found

**Example:**
```typescript
if (hasUICPBlocks(content)) {
  // Parse the content
  const parsed = await parseUICPContent(content, config);
}
```

### extractUICPBlocks()

Extract UICP blocks without rendering components.

```typescript
function extractUICPBlocks(content: string): {
  blocks: UICPBlock[];
  contentWithPlaceholders: string;
}
```

**Parameters:**
- `content`: String containing UICP blocks

**Returns:** Object with:
- `blocks`: Array of extracted blocks
- `contentWithPlaceholders`: Content with blocks replaced by placeholders

**Example:**
```typescript
const { blocks, contentWithPlaceholders } = extractUICPBlocks(content);

blocks.forEach((block, index) => {
  console.log(`Block ${index}:`, block);
});
```

## Component Registry

### registerComponent()

Register a component in the global registry.

```typescript
function registerComponent(
  uid: string,
  component: React.ComponentType<any>
): void
```

**Parameters:**
- `uid`: Component UID (must match definition)
- `component`: React component

**Example:**
```typescript
import { SimpleCard } from './components/simple-card';

registerComponent('SimpleCard', SimpleCard);
```

### loadComponent()

Dynamically load a component.

```typescript
async function loadComponent(
  uid: string,
  componentPath: string,
  basePath?: string
): Promise<React.ComponentType<any>>
```

**Parameters:**
- `uid`: Component UID
- `componentPath`: Path relative to basePath
- `basePath`: Base path for imports (default: `/components/uicp`)

**Returns:** `Promise<React.ComponentType>` - Loaded component

**Example:**
```typescript
const component = await loadComponent(
  'SimpleCard',
  'simple-card',
  '/components/uicp'
);
```

### getComponent()

Get a registered component from the registry.

```typescript
function getComponent(uid: string): React.ComponentType<any> | undefined
```

**Parameters:**
- `uid`: Component UID

**Returns:** Component or undefined if not registered

**Example:**
```typescript
const component = getComponent('SimpleCard');

if (component) {
  // Component is registered
}
```

### getRegisteredComponents()

Get all registered component UIDs.

```typescript
function getRegisteredComponents(): string[]
```

**Returns:** Array of registered UIDs

**Example:**
```typescript
const uids = getRegisteredComponents();
// ['SimpleCard', 'DataTable', ...]
```

### clearRegistry()

Clear component registry.

```typescript
function clearRegistry(uid?: string): void
```

**Parameters:**
- `uid`: Optional specific component to clear. If omitted, clears all.

**Example:**
```typescript
// Clear specific component
clearRegistry('SimpleCard');

// Clear all components
clearRegistry();
```

## Validation

### validateUICPBlock()

Validate a UICP block against component definitions.

```typescript
function validateUICPBlock(
  block: UICPBlock,
  definitions: Definitions
): ValidationResult
```

**Parameters:**
- `block`: UICP block to validate
- `definitions`: Component definitions

**Returns:** `ValidationResult` object with:
- `valid`: boolean
- `errors`: string[] (if invalid)

**Example:**
```typescript
const { valid, errors } = validateUICPBlock(block, definitions);

if (!valid) {
  console.error('Validation errors:', errors);
}
```

## Definitions Loading

### loadDefinitions()

Load definitions from file, URL, or object.

```typescript
async function loadDefinitions(
  source: string | Definitions
): Promise<Definitions>
```

**Parameters:**
- `source`: File path, URL, or Definitions object

**Returns:** `Promise<Definitions>` - Loaded definitions

**Example:**
```typescript
// From file
const defs = await loadDefinitions('./definitions.json');

// From URL
const defs = await loadDefinitions('https://api.example.com/definitions.json');

// From object
const defs = await loadDefinitions(definitionsObject);
```

### loadDefinitionsWithCache()

Load definitions with caching.

```typescript
async function loadDefinitionsWithCache(
  source: string | Definitions,
  ttl?: number
): Promise<Definitions>
```

**Parameters:**
- `source`: File path, URL, or Definitions object
- `ttl`: Cache TTL in milliseconds (default: 5 minutes)

**Returns:** `Promise<Definitions>` - Loaded definitions

**Example:**
```typescript
// Default 5 minute cache
const defs = await loadDefinitionsWithCache('./definitions.json');

// Custom 10 minute cache
const defs = await loadDefinitionsWithCache('./definitions.json', 10 * 60 * 1000);
```

### clearDefinitionsCache()

Clear definitions cache.

```typescript
function clearDefinitionsCache(source?: string): void
```

**Parameters:**
- `source`: Optional specific source to clear. If omitted, clears all.

**Example:**
```typescript
// Clear specific
clearDefinitionsCache('./definitions.json');

// Clear all
clearDefinitionsCache();
```

## TypeScript Types

### UICPBlock

```typescript
interface UICPBlock {
  uid: string;
  data: Record<string, any>;
}
```

### ParsedContent

```typescript
interface ParsedContent {
  type: 'text' | 'component';
  content: string | React.ReactElement;
  key: string;
}
```

### ComponentDefinition

```typescript
interface ComponentDefinition {
  uid: string;
  type: string;
  description: string;
  componentPath: string;
  inputs: Record<string, InputSchema>;
  example?: {
    uid: string;
    data: Record<string, any>;
  };
}
```

### Definitions

```typescript
interface Definitions {
  version: string;
  components: ComponentDefinition[];
}
```

### InputSchema

```typescript
interface InputSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: any;
  enum?: any[];
  properties?: Record<string, InputSchema>; // For object types
}
```

### ParserConfig

```typescript
interface ParserConfig {
  definitions: string | Definitions;
  componentsBasePath?: string;
}
```

### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors?: string[];
}
```

## React Components

See [React Components](react-components.md) for:
- `<UICPContent />`
- `<UICPProvider />`

## React Hooks

See [Hooks](hooks.md) for:
- `useUICPParser()`

## Next Steps

- [React Components](react-components.md) - Component API
- [Hooks](hooks.md) - Hook API
- [Configuration](configuration.md) - Advanced configuration

