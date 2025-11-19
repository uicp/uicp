# Integration Guide

This comprehensive guide covers integrating UICP into existing applications with different frameworks and AI providers.

## Overview

UICP integration involves three main parts:

1. **Backend**: Add AI tools for component discovery and creation
2. **Frontend**: Parse and render UICP blocks
3. **Configuration**: Define components and manage registration

## Architecture Patterns

### Pattern 1: Full-Stack Next.js

Recommended for Next.js applications with both frontend and backend.

```
Next.js App
├── Backend (API Routes)
│   └── @uicp/tools
├── Frontend (React Components)
│   └── @uicp/parser
└── Shared
    └── definitions.json
```

### Pattern 2: Separate Frontend/Backend

For microservices or separate repositories.

```
Backend API          Frontend App
├── @uicp/tools     ├── @uicp/parser
└── definitions.json └── fetch definitions.json
```

### Pattern 3: Monorepo

For Nx, Turborepo, or pnpm workspaces.

```
Monorepo
├── apps/
│   ├── api/ (@uicp/tools)
│   └── web/ (@uicp/parser)
└── packages/
    └── uicp-config/ (definitions.json)
```

## Backend Integration

### Vercel AI SDK

Most common integration for Next.js applications.

#### Setup

```bash
npm install ai @ai-sdk/openai @uicp/tools
```

#### Implementation

```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getUIComponents, createUIComponent } from '@uicp/tools';
import { resolve } from 'path';

const definitionsPath = resolve(process.cwd(), 'lib/uicp/definitions.json');

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful assistant with access to UI components.
    
    When appropriate, use UI components to make your responses more engaging and easier to understand.
    
    Available tools:
    - get_ui_components: Discover available UI components
    - create_ui_component: Create a UI component to display in the chat
    
    Use components for:
    - Displaying structured data (tables, lists)
    - Showing status updates (alerts, cards)
    - Presenting information (cards, panels)
    - Visual emphasis (highlighted information)`,
    messages,
    tools: {
      get_ui_components: tool({
        description: 'Discover available UI components and their input schemas. Use this to find out what components are available and how to use them.',
        parameters: z.object({
          component_type: z.string().optional().describe('Filter by component type (e.g., "card", "table", "chart")'),
          uid: z.string().optional().describe('Get details for a specific component by UID'),
        }),
        execute: async ({ component_type, uid }) => {
          return await getUIComponents(definitionsPath, {
            component_type,
            uid,
          });
        },
      }),
      create_ui_component: tool({
        description: 'Create a UICP block to render a UI component in the chat interface. Returns the formatted block to include in your response.',
        parameters: z.object({
          uid: z.string().describe('The UID of the component to create'),
          data: z.record(z.any()).describe('The data object containing all required and optional inputs for the component'),
        }),
        execute: async ({ uid, data }) => {
          return await createUIComponent(definitionsPath, { uid, data });
        },
      }),
    },
    maxToolRoundtrips: 5, // Allow multiple tool calls
  });

  return result.toDataStreamResponse();
}
```

#### Error Handling

```typescript
tools: {
  create_ui_component: tool({
    description: '...',
    parameters: z.object({ /* ... */ }),
    execute: async ({ uid, data }) => {
      try {
        const result = await createUIComponent(definitionsPath, { uid, data });
        
        if (!result.success) {
          // Return error to AI for retry
          return {
            success: false,
            error: result.error,
            message: 'Component creation failed. Please check the input data.',
            available_components: result.available_components,
          };
        }
        
        return result;
      } catch (error) {
        console.error('Tool execution error:', error);
        return {
          success: false,
          error: 'Internal error creating component',
        };
      }
    },
  }),
}
```

### OpenAI SDK

Direct integration with OpenAI's function calling.

#### Setup

```bash
npm install openai @uicp/tools
```

#### Implementation

```typescript
// api/chat.ts
import OpenAI from 'openai';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const definitionsPath = './lib/uicp/definitions.json';

export async function chat(messages: any[]) {
  const tools = [
    {
      type: 'function' as const,
      function: {
        name: 'get_ui_components',
        description: 'Discover available UI components',
        parameters: {
          type: 'object',
          properties: {
            component_type: {
              type: 'string',
              description: 'Filter by component type',
            },
            uid: {
              type: 'string',
              description: 'Get specific component',
            },
          },
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'create_ui_component',
        description: 'Create a UICP block',
        parameters: {
          type: 'object',
          properties: {
            uid: {
              type: 'string',
              description: 'Component UID',
            },
            data: {
              type: 'object',
              description: 'Component data',
            },
          },
          required: ['uid', 'data'],
        },
      },
    },
  ];

  let response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    tools,
  });

  // Handle tool calls
  while (response.choices[0].message.tool_calls) {
    const toolCalls = response.choices[0].message.tool_calls;
    
    // Add assistant message with tool calls
    messages.push(response.choices[0].message);

    // Execute tools and add results
    for (const toolCall of toolCalls) {
      const { name, arguments: args } = toolCall.function;
      const params = JSON.parse(args);

      let result;
      if (name === 'get_ui_components') {
        result = await getUIComponents(definitionsPath, params);
      } else if (name === 'create_ui_component') {
        result = await createUIComponent(definitionsPath, params);
      }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    // Get next response
    response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools,
    });
  }

  return response;
}
```

### Anthropic SDK

Integration with Claude.

#### Setup

```bash
npm install @anthropic-ai/sdk @uicp/tools
```

#### Implementation

```typescript
// api/chat.ts
import Anthropic from '@anthropic-ai/sdk';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const definitionsPath = './lib/uicp/definitions.json';

const tools = [
  {
    name: 'get_ui_components',
    description: 'Discover available UI components and their schemas',
    input_schema: {
      type: 'object',
      properties: {
        component_type: {
          type: 'string',
          description: 'Filter by component type',
        },
        uid: {
          type: 'string',
          description: 'Get specific component',
        },
      },
    },
  },
  {
    name: 'create_ui_component',
    description: 'Create a UICP block for a UI component',
    input_schema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
        data: { type: 'object' },
      },
      required: ['uid', 'data'],
    },
  },
];

export async function chat(messages: any[]) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages,
    tools,
  });

  // Handle tool use
  if (response.stop_reason === 'tool_use') {
    for (const content of response.content) {
      if (content.type === 'tool_use') {
        const { name, input } = content;

        let result;
        if (name === 'get_ui_components') {
          result = await getUIComponents(definitionsPath, input);
        } else if (name === 'create_ui_component') {
          result = await createUIComponent(definitionsPath, input);
        }

        // Continue conversation with tool result
        messages.push({
          role: 'assistant',
          content: response.content,
        });
        messages.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: content.id,
            content: JSON.stringify(result),
          }],
        });
      }
    }
  }

  return response;
}
```

### LangChain

For more complex AI workflows.

#### Setup

```bash
npm install langchain @langchain/openai @uicp/tools
```

#### Implementation

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const definitionsPath = './lib/uicp/definitions.json';

const getComponentsTool = new DynamicStructuredTool({
  name: 'get_ui_components',
  description: 'Discover available UI components',
  schema: z.object({
    component_type: z.string().optional(),
    uid: z.string().optional(),
  }),
  func: async ({ component_type, uid }) => {
    const result = await getUIComponents(definitionsPath, {
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
    const result = await createUIComponent(definitionsPath, { uid, data });
    return result.uicp_block || JSON.stringify(result);
  },
});

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
});

const modelWithTools = model.bindTools([
  getComponentsTool,
  createComponentTool,
]);

export async function chat(messages: any[]) {
  const response = await modelWithTools.invoke(messages);
  return response;
}
```

## Frontend Integration

### React with Hooks

Most flexible approach for custom implementations.

```tsx
// components/message.tsx
'use client';

import { useEffect, useState } from 'react';
import { parseUICPContentSync, hasUICPBlocks, registerComponent } from '@uicp/parser';
import ReactMarkdown from 'react-markdown';
import definitions from '@/lib/uicp/definitions.json';

// Import and register all components
import { SimpleCard } from '@/components/uicp/simple-card';
import { DataTable } from '@/components/uicp/data-table';

registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export function Message({ content, role }: MessageProps) {
  const [parsedContent, setParsedContent] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role === 'assistant' && hasUICPBlocks(content)) {
      try {
        const parsed = parseUICPContentSync(content, definitions as any);
        setParsedContent(parsed);
        setError(null);
      } catch (err) {
        console.error('Parse error:', err);
        setError('Failed to render UI components');
      }
    }
  }, [content, role]);

  if (role === 'user') {
    return (
      <div className="message user-message">
        {content}
      </div>
    );
  }

  if (error) {
    return (
      <div className="message assistant-message">
        <div className="error">{error}</div>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  if (hasUICPBlocks(content) && parsedContent.length > 0) {
    return (
      <div className="message assistant-message">
        {parsedContent.map((item) =>
          item.type === 'component' ? (
            <div key={item.key} className="uicp-component">
              {item.content}
            </div>
          ) : (
            <div key={item.key} className="markdown-content">
              <ReactMarkdown>{item.content as string}</ReactMarkdown>
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <div className="message assistant-message">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
```

### Simplified with UICPContent

Easiest integration with automatic handling.

```tsx
// components/message.tsx
'use client';

import { UICPContent } from '@uicp/parser';
import ReactMarkdown from 'react-markdown';
import definitions from '@/lib/uicp/definitions.json';
import '@/lib/uicp/registry';

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export function Message({ content, role }: MessageProps) {
  if (role === 'user') {
    return <div className="user-message">{content}</div>;
  }

  return (
    <UICPContent
      content={content}
      definitions={definitions}
      textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
      componentWrapper={(component) => (
        <div className="my-4">{component}</div>
      )}
      loading={<div className="loading">Loading component...</div>}
      fallback={<div className="error">Failed to render component</div>}
    />
  );
}
```

### With Provider Pattern

For shared configuration across multiple components.

```tsx
// app/layout.tsx or chat wrapper
import { UICPProvider } from '@uicp/parser';
import definitions from '@/lib/uicp/definitions.json';
import '@/lib/uicp/registry';

export function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <UICPProvider
      definitions={definitions}
      componentsBasePath="/components/uicp"
    >
      {children}
    </UICPProvider>
  );
}

// components/message.tsx - simpler!
import { UICPContent } from '@uicp/parser';

export function Message({ content }: { content: string }) {
  return <UICPContent content={content} />;
}
```

## Configuration Management

### Local Definitions File

Simple and straightforward for most projects.

```
project/
└── lib/
    └── uicp/
        └── definitions.json
```

```typescript
// Backend
const definitionsPath = resolve(process.cwd(), 'lib/uicp/definitions.json');

// Frontend
import definitions from '@/lib/uicp/definitions.json';
```

### Remote Definitions (URL)

For dynamic updates without redeployment.

```typescript
// Backend
const definitionsUrl = 'https://api.example.com/uicp/definitions.json';
await getUIComponents(definitionsUrl);

// Frontend (with caching)
const definitions = await loadDefinitionsWithCache(definitionsUrl, 5 * 60 * 1000);
```

### Environment-Based

Different definitions for different environments.

```typescript
const definitionsPath = process.env.NODE_ENV === 'production'
  ? 'https://cdn.example.com/definitions.json'
  : './lib/uicp/definitions.json';
```

### Monorepo Shared Package

Share definitions across multiple apps.

```typescript
// packages/uicp-config/definitions.json
export { default as definitions } from './definitions.json';

// apps/api
import { definitions } from '@my-org/uicp-config';
await getUIComponents(definitions);

// apps/web
import { definitions } from '@my-org/uicp-config';
<UICPContent definitions={definitions} />
```

## Best Practices

### Component Registration

**Pre-register in production:**
```typescript
// lib/uicp/registry.ts
import { registerComponent } from '@uicp/parser';
import * as components from '@/components/uicp';

Object.entries(components).forEach(([name, component]) => {
  registerComponent(name, component);
});
```

### Error Handling

**Always handle errors gracefully:**
```typescript
try {
  const result = await createUIComponent(path, { uid, data });
  if (!result.success) {
    console.error('Component creation failed:', result.error);
    // Return error to AI for retry
  }
} catch (error) {
  console.error('Unexpected error:', error);
  // Log to error tracking service
}
```

### Caching Strategy

**Use appropriate cache TTLs:**
```typescript
// Definitions cache - 5 minutes in dev, 1 hour in prod
const cacheTTL = process.env.NODE_ENV === 'production'
  ? 60 * 60 * 1000
  : 5 * 60 * 1000;

await getUIComponents(definitionsPath, {}, cacheTTL);
```

### Security

**Validate component data:**
```typescript
// In your component
export function MyComponent(props: MyProps) {
  if (!isValidData(props)) {
    console.error('Invalid props received');
    return <ErrorComponent />;
  }
  // ...
}
```

## Testing

### Unit Tests

```typescript
import { hasUICPBlocks, extractUICPBlocks } from '@uicp/parser';

describe('UICP Parser', () => {
  it('should detect UICP blocks', () => {
    const content = '```uicp\n{"uid":"Test","data":{}}\n```';
    expect(hasUICPBlocks(content)).toBe(true);
  });

  it('should extract blocks correctly', () => {
    const content = 'Text ```uicp\n{"uid":"Test","data":{}}\n``` More text';
    const { blocks } = extractUICPBlocks(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].uid).toBe('Test');
  });
});
```

### Integration Tests

```typescript
import { getUIComponents, createUIComponent } from '@uicp/tools';

describe('UICP Tools', () => {
  const testDefinitions = {
    version: '1.0.0',
    components: [{ uid: 'Test', /* ... */ }],
  };

  it('should discover components', async () => {
    const result = await getUIComponents(testDefinitions);
    expect(result.success).toBe(true);
    expect(result.components).toHaveLength(1);
  });

  it('should create valid UICP block', async () => {
    const result = await createUIComponent(testDefinitions, {
      uid: 'Test',
      data: { title: 'Test' },
    });
    expect(result.success).toBe(true);
    expect(result.uicp_block).toContain('```uicp');
  });
});
```

## Next Steps

- Review [Component Examples](../example-project/component-examples.md)
- Explore [@uicp/parser API](../packages/parser/api-reference.md)
- Explore [@uicp/tools API](../packages/tools/api-reference.md)
- See [Best Practices](../advanced/best-practices.md)

## Troubleshooting

See the [Troubleshooting Guide](../advanced/troubleshooting.md) for common integration issues and solutions.

