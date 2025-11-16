# @uicp/tools

Framework-agnostic AI tools for UICP (User Interface Context Protocol) component discovery and creation.

## Installation

```bash
npm install @uicp/tools
```

## Features

- **Framework agnostic** - Works with any LLM framework (OpenAI, Anthropic, LangChain, etc.)
- **Component discovery** - Query available components and their schemas
- **UICP block creation** - Generate validated UICP blocks
- **Dynamic definitions** - Load from URLs, file paths, or objects
- **Built-in caching** - Reduce repeated fetches with TTL-based cache
- **TypeScript support** - Full type definitions and Zod schemas

## Quick Start

```typescript
import { getUIComponents, createUIComponent } from '@uicp/tools';

// Discover available components
const components = await getUIComponents('./definitions.json', {
  component_type: 'card',
});

// Create a UICP block
const result = await createUIComponent('./definitions.json', {
  uid: 'SimpleCard',
  data: {
    title: 'Hello World',
    content: 'This is a card component',
  },
});

console.log(result.uicp_block);
// ```uicp
// {
//   "uid": "SimpleCard",
//   "data": { "title": "Hello World", ... }
// }
// ```
```

## API Reference

### Core Functions

#### `getUIComponents(definitionsUri, params?, cacheTtl?)`

Discover available UI components.

```typescript
const result = await getUIComponents('./definitions.json', {
  component_type: 'card',
  uid: 'SimpleCard',
});
```

**Parameters:**
- `definitionsUri: string` - Path or URL to definitions.json
- `params?: GetUIComponentsParams` - Filter parameters
  - `component_type?: string` - Filter by component type
  - `uid?: string` - Get specific component by UID
- `cacheTtl?: number` - Cache TTL in ms (default: 5 minutes)

**Returns:** `Promise<GetUIComponentsResult>`

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

#### `createUIComponent(definitionsUri, params, cacheTtl?)`

Create a UICP block for a component.

```typescript
const result = await createUIComponent('./definitions.json', {
  uid: 'SimpleCard',
  data: {
    title: 'My Title',
    content: 'My content',
  },
});
```

**Parameters:**
- `definitionsUri: string` - Path or URL to definitions.json
- `params: CreateUIComponentParams` - Component parameters
  - `uid: string` - Component UID
  - `data: Record<string, any>` - Component data
- `cacheTtl?: number` - Cache TTL in ms (default: 5 minutes)

**Returns:** `Promise<CreateUIComponentResult>`

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

### Cache Management

#### `getCached(uri, ttl?)`

Get cached definitions if not expired.

```typescript
const defs = getCached('./definitions.json');
```

#### `setCached(uri, data)`

Store definitions in cache.

```typescript
setCached('./definitions.json', definitions);
```

#### `clearCache(uri?)`

Clear cache for specific URI or all entries.

```typescript
clearCache('./definitions.json'); // Clear specific
clearCache(); // Clear all
```

#### `getCacheStats()`

Get cache statistics.

```typescript
const stats = getCacheStats();
// { size: 2, entries: ['./defs1.json', './defs2.json'] }
```

### Schemas

Zod schemas for validation and integration.

```typescript
import {
  getUIComponentsSchema,
  createUIComponentSchema,
} from '@uicp/tools';
```

## Integration Examples

### Vercel AI SDK

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const result = await streamText({
  model: openai('gpt-4'),
  messages,
  tools: {
    get_ui_components: tool({
      description: 'Discover available UI components',
      parameters: z.object({
        component_type: z.string().optional(),
        uid: z.string().optional(),
      }),
      execute: async ({ component_type, uid }) => {
        return await getUIComponents('./definitions.json', {
          component_type,
          uid,
        });
      },
    }),
    create_ui_component: tool({
      description: 'Create a UICP block',
      parameters: z.object({
        uid: z.string(),
        data: z.record(z.any()),
      }),
      execute: async ({ uid, data }) => {
        return await createUIComponent('./definitions.json', {
          uid,
          data,
        });
      },
    }),
  },
});
```

### LangChain

```typescript
import { DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const getComponentsTool = new DynamicStructuredTool({
  name: 'get_ui_components',
  description: 'Discover available UI components',
  schema: z.object({
    component_type: z.string().optional(),
    uid: z.string().optional(),
  }),
  func: async ({ component_type, uid }) => {
    const result = await getUIComponents('./definitions.json', {
      component_type,
      uid,
    });
    return JSON.stringify(result);
  },
});

const createComponentTool = new DynamicStructuredTool({
  name: 'create_ui_component',
  description: 'Create a UICP block',
  schema: z.object({
    uid: z.string(),
    data: z.record(z.any()),
  }),
  func: async ({ uid, data }) => {
    const result = await createUIComponent('./definitions.json', {
      uid,
      data,
    });
    return result.uicp_block || JSON.stringify(result);
  },
});
```

### OpenAI Function Calling

```typescript
import OpenAI from 'openai';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const openai = new OpenAI();

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_ui_components',
      description: 'Discover available UI components',
      parameters: {
        type: 'object',
        properties: {
          component_type: { type: 'string' },
          uid: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_ui_component',
      description: 'Create a UICP block',
      parameters: {
        type: 'object',
        properties: {
          uid: { type: 'string' },
          data: { type: 'object' },
        },
        required: ['uid', 'data'],
      },
    },
  },
];

// Handle function calls
if (choice.message.function_call) {
  const { name, arguments: args } = choice.message.function_call;
  const params = JSON.parse(args);

  let result;
  if (name === 'get_ui_components') {
    result = await getUIComponents('./definitions.json', params);
  } else if (name === 'create_ui_component') {
    result = await createUIComponent('./definitions.json', params);
  }
}
```

### Custom Framework

```typescript
import { getUIComponents, createUIComponent } from '@uicp/tools';

// Your agent function
async function handleToolCall(toolName: string, params: any) {
  switch (toolName) {
    case 'get_ui_components':
      return await getUIComponents('./definitions.json', params);
    case 'create_ui_component':
      return await createUIComponent('./definitions.json', params);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
```

## Definitions Loading

Supports multiple sources:

```typescript
// Local file path
await getUIComponents('./definitions.json');

// Absolute path
await getUIComponents('/app/config/definitions.json');

// URL
await getUIComponents('https://api.example.com/definitions.json');
```

## Caching

Built-in caching with configurable TTL:

```typescript
// Default TTL (5 minutes)
await getUIComponents('./definitions.json');

// Custom TTL (10 minutes)
await getUIComponents('./definitions.json', {}, 10 * 60 * 1000);

// Disable caching (TTL = 0)
await getUIComponents('./definitions.json', {}, 0);

// Clear cache
import { clearCache } from '@uicp/tools';
clearCache('./definitions.json');
```

## TypeScript Types

```typescript
import type {
  ComponentDefinition,
  Definitions,
  GetUIComponentsResult,
  CreateUIComponentResult,
  GetUIComponentsParams,
  CreateUIComponentParams,
} from '@uicp/tools';
```

## Error Handling

All functions return success/error in the result:

```typescript
const result = await createUIComponent('./definitions.json', {
  uid: 'Unknown',
  data: {},
});

if (!result.success) {
  console.error(result.error);
  console.log('Available:', result.available_components);
}
```

## Best Practices

1. **Cache definitions** - Use the built-in caching for repeated calls
2. **Handle errors** - Always check `success` in the result
3. **Validate data** - The tools validate against schema automatically
4. **Use TypeScript** - Leverage full type definitions
5. **Set appropriate TTL** - Balance freshness vs performance

## License

MIT - see [LICENSE](../../LICENSE) for details.

