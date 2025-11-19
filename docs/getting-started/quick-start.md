# Quick Start

Get UICP running in your project in under 10 minutes. This guide walks you through a complete end-to-end setup.

## Overview

By the end of this guide, you'll have:

1. ✅ A simple UI component defined
2. ✅ Backend tools integrated with your AI agent
3. ✅ Frontend parser rendering components
4. ✅ A working chat interface with rich UI

## Step 1: Create a Component

First, create a simple card component.

```tsx
// components/uicp/simple-card.tsx

interface SimpleCardProps {
  title: string;
  content: string;
}

export function SimpleCard({ title, content }: SimpleCardProps) {
  return (
    <div className="border rounded-lg p-4 my-2">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{content}</p>
    </div>
  );
}
```

## Step 2: Define the Component

Create a definitions file that describes your component to the AI.

```json
// lib/uicp/definitions.json
{
  "version": "1.0.0",
  "components": [
    {
      "uid": "SimpleCard",
      "type": "card",
      "description": "A simple card for displaying information with a title and content",
      "componentPath": "simple-card",
      "inputs": {
        "title": {
          "type": "string",
          "description": "Card title",
          "required": true
        },
        "content": {
          "type": "string",
          "description": "Card content text",
          "required": true
        }
      },
      "example": {
        "uid": "SimpleCard",
        "data": {
          "title": "Welcome",
          "content": "This is an example card"
        }
      }
    }
  ]
}
```

## Step 3: Add Backend Tools

Integrate UICP tools with your chat API endpoint.

### For Vercel AI SDK

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
    Use the get_ui_components tool to discover available components, 
    and create_ui_component to create them when appropriate.`,
    messages,
    tools: {
      get_ui_components: tool({
        description: 'Discover available UI components and their schemas',
        parameters: z.object({
          component_type: z.string().optional().describe('Filter by component type'),
          uid: z.string().optional().describe('Get specific component by UID'),
        }),
        execute: async ({ component_type, uid }) => {
          return await getUIComponents(definitionsPath, {
            component_type,
            uid,
          });
        },
      }),
      create_ui_component: tool({
        description: 'Create a UICP block for rendering a UI component',
        parameters: z.object({
          uid: z.string().describe('Component UID to create'),
          data: z.record(z.any()).describe('Component data (props)'),
        }),
        execute: async ({ uid, data }) => {
          return await createUIComponent(definitionsPath, { uid, data });
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
```

### For OpenAI SDK

```typescript
// api/chat.ts
import OpenAI from 'openai';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const definitionsPath = './lib/uicp/definitions.json';

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

export async function chat(messages) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    tools,
  });

  // Handle tool calls
  const toolCalls = response.choices[0].message.tool_calls;
  
  if (toolCalls) {
    for (const toolCall of toolCalls) {
      const { name, arguments: args } = toolCall.function;
      const params = JSON.parse(args);

      let result;
      if (name === 'get_ui_components') {
        result = await getUIComponents(definitionsPath, params);
      } else if (name === 'create_ui_component') {
        result = await createUIComponent(definitionsPath, params);
      }

      // Add result back to messages
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  return response;
}
```

## Step 4: Add Frontend Parser

Update your message component to parse and render UICP blocks.

```tsx
// components/message.tsx
'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { parseUICPContentSync, hasUICPBlocks, registerComponent } from '@uicp/parser';
import definitions from '@/lib/uicp/definitions.json';

// Import and register your components
import { SimpleCard } from '@/components/uicp/simple-card';

registerComponent('SimpleCard', SimpleCard);

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export function Message({ content, role }: MessageProps) {
  const [parsedContent, setParsedContent] = useState<any[]>([]);

  useEffect(() => {
    if (role === 'assistant' && hasUICPBlocks(content)) {
      const parsed = parseUICPContentSync(content, definitions as any);
      setParsedContent(parsed);
    }
  }, [content, role]);

  // User messages - simple text
  if (role === 'user') {
    return (
      <div className="message user-message">
        <p>{content}</p>
      </div>
    );
  }

  // Assistant messages - parse UICP blocks
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

  // Regular text
  return (
    <div className="message assistant-message">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
```

## Step 5: Test It!

Start your development server and test the integration:

```bash
npm run dev
```

### Test Prompts

Try these prompts in your chat:

1. **"Create a welcome card"**
   - AI should discover SimpleCard and create one

2. **"Show me an info card about UICP"**
   - AI should create a card with UICP information

3. **"What components are available?"**
   - AI should use get_ui_components tool

### Expected Flow

```
User: "Create a welcome card"
  ↓
AI calls get_ui_components() → Discovers SimpleCard
  ↓
AI calls create_ui_component() → Creates UICP block
  ↓
AI returns: "Here's your welcome card:
```uicp
{"uid":"SimpleCard","data":{"title":"Welcome","content":"..."}}
```"
  ↓
Frontend parses and renders SimpleCard component
  ↓
User sees a beautiful card in the chat!
```

## Alternative: Simplified API

For an even quicker setup, use the `UICPContent` component:

```tsx
// components/message.tsx
'use client';

import { UICPContent } from '@uicp/parser';
import ReactMarkdown from 'react-markdown';
import definitions from '@/lib/uicp/definitions.json';
import '@/lib/uicp/registry'; // Import to register components

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export function Message({ content, role }: MessageProps) {
  if (role === 'user') {
    return <div>{content}</div>;
  }

  return (
    <UICPContent
      content={content}
      definitions={definitions}
      textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
    />
  );
}
```

Create a registry file:

```tsx
// lib/uicp/registry.ts
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from '@/components/uicp/simple-card';

registerComponent('SimpleCard', SimpleCard);
```

That's it! The `UICPContent` component handles everything automatically.

## Project Structure

After setup, your project should look like:

```
your-app/
├── app/
│   └── api/
│       └── chat/
│           └── route.ts          # Backend tools
├── components/
│   ├── uicp/
│   │   └── simple-card.tsx      # UI component
│   └── message.tsx              # Parser integration
├── lib/
│   └── uicp/
│       ├── definitions.json     # Component definitions
│       └── registry.ts          # Component registration
└── package.json
```

## What You've Accomplished

✅ Created a UI component
✅ Defined it for AI consumption
✅ Integrated backend tools
✅ Set up frontend parsing
✅ Tested end-to-end flow

## Next Steps

### Add More Components

Now that you have the basics working, add more components:

- [Your First Component](first-component.md) - Deep dive into component creation
- [Component Examples](../example-project/component-examples.md) - See more examples

### Customize

- Style components with your design system
- Add validation and error handling
- Optimize with caching and pre-registration

### Deploy

- Build for production: `npm run build`
- Deploy to Vercel, Netlify, or your platform
- Ensure environment variables are set

## Common Issues

### Components Not Rendering

**Check:**
1. Component is registered: `registerComponent('SimpleCard', SimpleCard)`
2. UID matches between registration and definitions.json
3. Component is properly exported

### AI Not Using Tools

**Check:**
1. Tools are configured in your API endpoint
2. System prompt mentions components
3. Definitions file path is correct
4. Environment variables (API keys) are set

### TypeScript Errors

**Add to imports:**
```typescript
import definitions from '@/lib/uicp/definitions.json';

// Use with type assertion
parseUICPContentSync(content, definitions as any);
```

## Getting Help

- Review the [Integration Guide](integration-guide.md) for detailed setup
- Check [Troubleshooting](../advanced/troubleshooting.md) for common issues
- Open an issue on [GitHub](https://github.com/uicp/uicp/issues)

## Resources

- [Example Project](../example-project/overview.md) - Complete reference implementation
- [@uicp/parser Docs](../packages/parser/overview.md) - Frontend package details
- [@uicp/tools Docs](../packages/tools/overview.md) - Backend package details

---

**Congratulations!** You now have UICP working in your project. Start creating amazing UI experiences! 🎉

