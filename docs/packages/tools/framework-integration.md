# Framework Integration

Examples of integrating @uicp/tools with popular LLM frameworks.

## Vercel AI SDK

```typescript
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getUIComponents, createUIComponent } from '@uicp/tools';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
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

  return result.toDataStreamResponse();
}
```

## OpenAI SDK

```typescript
import OpenAI from 'openai';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const openai = new OpenAI();

const tools = [
  {
    type: 'function' as const,
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
    type: 'function' as const,
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
if (toolCall.function.name === 'get_ui_components') {
  result = await getUIComponents('./definitions.json', params);
} else if (toolCall.function.name === 'create_ui_component') {
  result = await createUIComponent('./definitions.json', params);
}
```

## Anthropic SDK

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const anthropic = new Anthropic();

const tools = [
  {
    name: 'get_ui_components',
    description: 'Discover available UI components',
    input_schema: {
      type: 'object',
      properties: {
        component_type: { type: 'string' },
        uid: { type: 'string' },
      },
    },
  },
  {
    name: 'create_ui_component',
    description: 'Create a UICP block',
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
```

## LangChain

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
```

See [Integration Guide](../../getting-started/integration-guide.md) for complete examples.

