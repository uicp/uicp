# @uicp/tools Overview

The **@uicp/tools** package provides framework-agnostic AI tools for UICP component discovery and creation. It runs on the backend/server side and works with any LLM framework.

## What It Does

@uicp/tools provides two essential AI tools:

1. **get_ui_components**: Discover available UI components and their schemas
2. **create_ui_component**: Create validated UICP blocks for rendering

## Key Features

### 🔌 Framework Agnostic

Works with any LLM framework:
- Vercel AI SDK
- OpenAI SDK
- Anthropic SDK
- LangChain
- LlamaIndex
- Custom frameworks

### 📋 Component Discovery

Allow AI to discover available components:

```typescript
const result = await getUIComponents('./definitions.json', {
  component_type: 'card',
});
```

Returns component schemas, descriptions, and examples.

### ✅ Validation

Automatic validation of component data:

```typescript
const result = await createUIComponent('./definitions.json', {
  uid: 'SimpleCard',
  data: { title: 'Hello' },
});

if (!result.success) {
  console.error(result.error);
  console.log('Missing fields:', result.missing_fields);
}
```

### 💾 Caching

Built-in caching with configurable TTL:

```typescript
// Default 5 minute cache
await getUIComponents('./definitions.json');

// Custom TTL
await getUIComponents('./definitions.json', {}, 10 * 60 * 1000);

// Disable caching
await getUIComponents('./definitions.json', {}, 0);
```

### 🌐 Flexible Loading

Load definitions from multiple sources:

```typescript
// Local file
await getUIComponents('./definitions.json');

// URL
await getUIComponents('https://api.example.com/definitions.json');

// Object
await getUIComponents(definitionsObject);
```

### 🔒 Type Safe

Full TypeScript support with Zod schemas:

```typescript
import { getUIComponentsSchema, createUIComponentSchema } from '@uicp/tools';
import type {
  GetUIComponentsResult,
  CreateUIComponentResult,
  ComponentDefinition,
} from '@uicp/tools';
```

## Package Contents

### Core Functions

- **`getUIComponents(uri, params?, cacheTtl?)`**: Discover components
- **`createUIComponent(uri, params, cacheTtl?)`**: Create UICP blocks

### Cache Management

- **`getCached(uri, ttl?)`**: Get cached definitions
- **`setCached(uri, data)`**: Store in cache
- **`clearCache(uri?)`**: Clear cache
- **`getCacheStats()`**: Get cache statistics

### Schemas

- **`getUIComponentsSchema`**: Zod schema for getUIComponents
- **`createUIComponentSchema`**: Zod schema for createUIComponent

### Types

- **`ComponentDefinition`**: Component definition type
- **`Definitions`**: Definitions file type
- **`GetUIComponentsResult`**: Return type for getUIComponents
- **`CreateUIComponentResult`**: Return type for createUIComponent

## Installation

```bash
npm install @uicp/tools
```

See [Installation Guide](installation.md) for details.

## Quick Start

### Vercel AI SDK

```typescript
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const result = await streamText({
  model: openai('gpt-4o'),
  messages,
  tools: {
    get_ui_components: tool({
      description: 'Discover UI components',
      parameters: z.object({
        component_type: z.string().optional(),
        uid: z.string().optional(),
      }),
      execute: async (params) => {
        return await getUIComponents('./definitions.json', params);
      },
    }),
    create_ui_component: tool({
      description: 'Create a UICP block',
      parameters: z.object({
        uid: z.string(),
        data: z.record(z.any()),
      }),
      execute: async (params) => {
        return await createUIComponent('./definitions.json', params);
      },
    }),
  },
});
```

### OpenAI SDK

```typescript
import OpenAI from 'openai';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_ui_components',
      description: 'Discover UI components',
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
if (toolCall.name === 'get_ui_components') {
  result = await getUIComponents('./definitions.json', params);
} else if (toolCall.name === 'create_ui_component') {
  result = await createUIComponent('./definitions.json', params);
}
```

## How It Works

### Component Discovery Flow

```
AI Agent
    ↓
Calls get_ui_components({ component_type: "card" })
    ↓
@uicp/tools loads definitions.json
    ↓
Filters by component_type
    ↓
Returns:
{
  success: true,
  components: [{
    uid: "SimpleCard",
    type: "card",
    description: "...",
    inputs: { ... }
  }],
  usage: { instructions: "..." }
}
```

### Component Creation Flow

```
AI Agent
    ↓
Calls create_ui_component({
  uid: "SimpleCard",
  data: { title: "Hello", content: "World" }
})
    ↓
@uicp/tools validates data against schema
    ↓
Valid? → Generate UICP block
    ↓
Returns:
{
  success: true,
  uicp_block: "```uicp\n{...}\n```"
}
```

## Architecture

@uicp/tools is designed for backend/server use:

```
Backend API
├── Chat Endpoint
│   ├── LLM Integration
│   │   └── Tools Configuration
│   │       └── @uicp/tools
│   │           ├── getUIComponents()
│   │           └── createUIComponent()
│   └── definitions.json
└── Response to Frontend
```

Works in:
- Next.js API Routes
- Express.js servers
- Serverless functions
- Edge functions
- Any Node.js environment

## Use Cases

### Dynamic Component Discovery

Let AI discover what components are available:

```typescript
// AI asks: "What UI components can I use?"
const result = await getUIComponents('./definitions.json');
// Returns all components with descriptions
```

### Type-Filtered Discovery

Filter components by type:

```typescript
// AI needs a table
const result = await getUIComponents('./definitions.json', {
  component_type: 'table',
});
// Returns only table components
```

### Specific Component Details

Get details for a specific component:

```typescript
// AI needs to know about SimpleCard
const result = await getUIComponents('./definitions.json', {
  uid: 'SimpleCard',
});
// Returns SimpleCard schema
```

### Component Creation

Create validated components:

```typescript
const result = await createUIComponent('./definitions.json', {
  uid: 'SimpleCard',
  data: {
    title: 'Welcome',
    content: 'Hello, UICP!',
  },
});

if (result.success) {
  // result.uicp_block contains the formatted block
  // AI can include it in response
}
```

## Performance

- **Caching**: Definitions cached by default (5 minutes)
- **Validation**: Fast JSON schema validation
- **Loading**: Supports both sync and async loading
- **Memory**: Minimal footprint with efficient caching

## Next Steps

- [Installation Guide](installation.md) - Set up the package
- [API Reference](api-reference.md) - Detailed API documentation
- [Framework Integration](framework-integration.md) - Integration examples
- [Caching](caching.md) - Cache management

## Resources

- [GitHub Repository](https://github.com/uicp/uicp)
- [NPM Package](https://www.npmjs.com/package/@uicp/tools)
- [Example Project](../../example-project/overview.md)

