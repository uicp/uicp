# @uicp/tools API Reference

Complete API documentation for @uicp/tools.

## Core Functions

### getUIComponents()

Discover available UI components and their schemas.

```typescript
async function getUIComponents(
  definitionsUri: string | Definitions,
  params?: GetUIComponentsParams,
  cacheTtl?: number
): Promise<GetUIComponentsResult>
```

**Parameters:**
- `definitionsUri`: Path/URL to definitions.json or Definitions object
- `params` (optional): Filter parameters
  - `component_type`: Filter by component type
  - `uid`: Get specific component by UID
- `cacheTtl` (optional): Cache TTL in ms (default: 5 minutes)

**Returns:** `GetUIComponentsResult`

**Example:**
```typescript
// Get all components
const result = await getUIComponents('./definitions.json');

// Filter by type
const result = await getUIComponents('./definitions.json', {
  component_type: 'card',
});

// Get specific component
const result = await getUIComponents('./definitions.json', {
  uid: 'SimpleCard',
});
```

### createUIComponent()

Create a validated UICP block for a component.

```typescript
async function createUIComponent(
  definitionsUri: string | Definitions,
  params: CreateUIComponentParams,
  cacheTtl?: number
): Promise<CreateUIComponentResult>
```

**Parameters:**
- `definitionsUri`: Path/URL to definitions.json or Definitions object
- `params`: Component parameters
  - `uid`: Component UID to create
  - `data`: Component data (props)
- `cacheTtl` (optional): Cache TTL in ms (default: 5 minutes)

**Returns:** `CreateUIComponentResult`

**Example:**
```typescript
const result = await createUIComponent('./definitions.json', {
  uid: 'SimpleCard',
  data: {
    title: 'Welcome',
    content: 'Hello, UICP!',
  },
});

if (result.success) {
  console.log(result.uicp_block);
}
```

## Cache Management

### getCached()

Get cached definitions if not expired.

```typescript
function getCached(
  uri: string,
  ttl?: number
): Definitions | null
```

### setCached()

Store definitions in cache.

```typescript
function setCached(
  uri: string,
  data: Definitions
): void
```

### clearCache()

Clear cache for specific URI or all entries.

```typescript
function clearCache(uri?: string): void
```

### getCacheStats()

Get cache statistics.

```typescript
function getCacheStats(): {
  size: number;
  entries: string[];
}
```

## TypeScript Types

### GetUIComponentsResult

```typescript
interface GetUIComponentsResult {
  success: boolean;
  version?: string;
  components?: Array<{
    uid: string;
    type: string;
    description: string;
    inputs: Record<string, InputSchema>;
    example?: any;
  }>;
  usage?: {
    instructions: string;
    format: string;
  };
  message?: string;
  available_types?: string[];
}
```

### CreateUIComponentResult

```typescript
interface CreateUIComponentResult {
  success: boolean;
  message?: string;
  uicp_block?: string;
  error?: string;
  missing_fields?: string[];
  component_schema?: Record<string, InputSchema>;
}
```

## Next Steps

- [Framework Integration](framework-integration.md) - See examples
- [Caching](caching.md) - Cache management
- [Overview](overview.md) - Package overview

