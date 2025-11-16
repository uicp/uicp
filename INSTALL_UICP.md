# UICP Installation Guide for AI Coding Assistants

This guide helps you install and configure UICP (User Interface Context Protocol) in an existing chat application.

## What is UICP?

UICP (User Interface Context Protocol) enables LLM-based agents to dynamically describe and render UI components in chat interfaces. Instead of only returning text, AI agents can:

- **Discover** available UI components and their schemas
- **Create** structured component blocks that render as rich UI
- **Render** these components inline with text responses

### Key Benefits

- 🎨 **Richer responses**: Display cards, tables, charts, and custom UI
- 🔧 **Framework agnostic**: Works with any LLM provider (OpenAI, Anthropic, etc.)
- 📦 **Type safe**: Full TypeScript support
- 🚀 **Easy integration**: Two packages, minimal setup

## Architecture Overview

UICP has two main packages:

1. **@uicp/parser** - Frontend parsing and rendering
   - Extracts UICP blocks from AI responses
   - Dynamically loads and renders React components
   - Validates component data

2. **@uicp/tools** - Backend AI tools
   - Provides tools for LLM to discover components
   - Creates validated UICP blocks
   - Framework agnostic (works with any LLM SDK)

## Installation Steps

### Step 1: Install Packages

```bash
npm install @uicp/parser @uicp/tools
```

### Step 2: Choose Your Scenario

**Scenario A**: You have NO existing custom chat UI components
→ Follow [Creating New Components](#scenario-a-creating-new-components-from-scratch)

**Scenario B**: You HAVE existing custom chat UI components
→ Follow [Migrating Existing Components](#scenario-b-migrating-existing-components)

---

## Scenario A: Creating New Components from Scratch

### 1. Create Component Directory

Create a directory for your UICP components. Default recommended path:

```
your-app/
├── components/
│   └── uicp/
│       └── (your components go here)
```

You can use a different path - we'll configure it later.

### 2. Create Your First Component

Example: A simple card component

```typescript
// components/uicp/info-card.tsx
interface InfoCardProps {
  title: string;
  content: string;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
}

export function InfoCard({ title, content, variant = 'default' }: InfoCardProps) {
  const variantStyles = {
    default: 'border-gray-700 bg-gray-800',
    info: 'border-blue-600 bg-blue-950',
    success: 'border-green-600 bg-green-950',
    warning: 'border-yellow-600 bg-yellow-950',
    error: 'border-red-600 bg-red-950',
  };

  return (
    <div className={`border rounded-lg p-4 my-2 ${variantStyles[variant]}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{content}</p>
    </div>
  );
}
```

**Important**: Export your component as a named export or default export.

### 3. Create definitions.json

Create a definitions file that describes your components. Recommended location:

```
your-app/
├── lib/
│   └── uicp/
│       └── definitions.json
```

**Template:**

```json
{
  "version": "1.0.0",
  "components": [
    {
      "uid": "InfoCard",
      "type": "card",
      "description": "Display information in a styled card format",
      "componentPath": "info-card",
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
        },
        "variant": {
          "type": "string",
          "description": "Visual style variant",
          "required": false,
          "default": "default",
          "enum": ["default", "info", "success", "warning", "error"]
        }
      },
      "example": {
        "uid": "InfoCard",
        "data": {
          "title": "Welcome",
          "content": "This is an example card",
          "variant": "info"
        }
      }
    }
  ]
}
```

**Key fields:**
- `uid`: Unique identifier (must match component export name)
- `componentPath`: Relative path from `/components/uicp/` (without extension)
- `inputs`: Schema defining component props
- `example`: Example data for the LLM to reference

### 4. Integrate Backend Tools

Add UICP tools to your chat API endpoint. The implementation varies by framework:

#### For Vercel AI SDK:

```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getUIComponents, createUIComponent } from '@uicp/tools';
import { resolve } from 'path';

// Path to your definitions.json
const definitionsPath = resolve(process.cwd(), 'lib/uicp/definitions.json');

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful assistant that can create rich UI components using UICP.
    
Use UI components when they make responses clearer or more engaging. Available components can be discovered with get_ui_components tool.`,
    messages,
    tools: {
      get_ui_components: tool({
        description: 'Discover available UI components and their schemas',
        parameters: z.object({
          component_type: z.string().optional(),
          uid: z.string().optional(),
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
          uid: z.string(),
          data: z.record(z.any()),
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

#### For LangChain:

```typescript
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
```

#### For OpenAI SDK (Function Calling):

```typescript
import OpenAI from 'openai';
import { getUIComponents, createUIComponent } from '@uicp/tools';

const openai = new OpenAI();
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

// In your message handling:
if (choice.message.function_call) {
  const { name, arguments: args } = choice.message.function_call;
  const params = JSON.parse(args);

  let result;
  if (name === 'get_ui_components') {
    result = await getUIComponents(definitionsPath, params);
  } else if (name === 'create_ui_component') {
    result = await createUIComponent(definitionsPath, params);
  }
  // Add result as function message
}
```

### 5. Integrate Frontend Parser

Update your message rendering component to parse and render UICP blocks:

```typescript
// components/message.tsx
'use client';

import { Message as MessageType } from 'ai'; // Or your message type
import ReactMarkdown from 'react-markdown';
import { parseUICPContentSync, hasUICPBlocks, registerComponent } from '@uicp/parser';
import { useEffect, useState } from 'react';
import definitions from '@/lib/uicp/definitions.json';

// Import and register your components
import { InfoCard } from '@/components/uicp/info-card';

registerComponent('InfoCard', InfoCard);

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const [parsedContent, setParsedContent] = useState<any[]>([]);
  const isUser = message.role === 'user';

  useEffect(() => {
    if (!isUser && hasUICPBlocks(message.content)) {
      const parsed = parseUICPContentSync(message.content, definitions as any);
      setParsedContent(parsed);
    }
  }, [message.content, isUser]);

  if (isUser) {
    return <div>{message.content}</div>;
  }

  if (hasUICPBlocks(message.content) && parsedContent.length > 0) {
    return (
      <div>
        {parsedContent.map((item) =>
          item.type === 'component' ? (
            <div key={item.key}>{item.content}</div>
          ) : (
            <div key={item.key}>
              <ReactMarkdown>{item.content as string}</ReactMarkdown>
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <div>
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  );
}
```

**Key points:**
- Import and register ALL your UICP components
- Use `hasUICPBlocks()` to check if parsing is needed
- Use `parseUICPContentSync()` with registered components
- Render both text and component items

### 6. Test the Integration

1. Start your dev server
2. In chat, ask: "Create an info card welcoming me to the app"
3. The AI should use the tools to discover InfoCard and create a UICP block
4. The frontend should parse and render the card component

---

## Scenario B: Migrating Existing Components

If you already have custom UI components in your chat, follow these steps:

### 1. Inventory Your Components

List all custom UI components currently used in chat responses. For each:
- Component name
- Current file location
- Props interface
- Purpose/description

Example inventory:
```
- ProductCard (components/chat/product-card.tsx)
- DataTable (components/chat/data-table.tsx)
- PriceChart (components/chat/price-chart.tsx)
```

### 2. Choose Migration Strategy

**Option A**: Move components to `/components/uicp/`
- Cleaner separation
- Follows UICP conventions
- Requires moving files

**Option B**: Keep components in current location
- Less disruptive
- Configure custom path in parser
- Components stay where they are

### 3. For Option A (Recommended): Move Components

```bash
# Create UICP directory
mkdir -p components/uicp

# Move your components
mv components/chat/product-card.tsx components/uicp/
mv components/chat/data-table.tsx components/uicp/
mv components/chat/price-chart.tsx components/uicp/
```

Update imports throughout your app if needed.

### 4. For Option B: Keep Components in Place

Note the path for configuration (e.g., `/components/chat`)

### 5. Create definitions.json for Existing Components

For each component, create a definition entry:

```json
{
  "version": "1.0.0",
  "components": [
    {
      "uid": "ProductCard",
      "type": "card",
      "description": "Display product information with image, title, price, and description",
      "componentPath": "product-card",
      "inputs": {
        "title": {
          "type": "string",
          "description": "Product name",
          "required": true
        },
        "price": {
          "type": "number",
          "description": "Product price in dollars",
          "required": true
        },
        "description": {
          "type": "string",
          "description": "Product description",
          "required": true
        },
        "imageUrl": {
          "type": "string",
          "description": "URL to product image",
          "required": false
        }
      },
      "example": {
        "uid": "ProductCard",
        "data": {
          "title": "Wireless Headphones",
          "price": 99.99,
          "description": "High-quality wireless headphones with noise cancellation",
          "imageUrl": "https://example.com/headphones.jpg"
        }
      }
    }
  ]
}
```

**Tips for creating definitions:**
1. Look at component's TypeScript interface/props
2. Convert each prop to an input field
3. Mark required vs optional
4. Add clear descriptions for the LLM
5. Provide a realistic example

### 6. Update Component Exports (If Needed)

Ensure components are exported properly:

```typescript
// ✅ Good - named export
export function ProductCard(props: ProductCardProps) { ... }

// ✅ Good - default export
export default function ProductCard(props: ProductCardProps) { ... }

// ❌ Bad - not exported
function ProductCard(props: ProductCardProps) { ... }
```

### 7. Register Components

In your message component, register all UICP components:

```typescript
import { registerComponent } from '@uicp/parser';
import { ProductCard } from '@/components/uicp/product-card';
import { DataTable } from '@/components/uicp/data-table';
import { PriceChart } from '@/components/uicp/price-chart';

// Register all components
registerComponent('ProductCard', ProductCard);
registerComponent('DataTable', DataTable);
registerComponent('PriceChart', PriceChart);
```

**Important**: The UID in `registerComponent()` must match the `uid` in definitions.json

### 8. Configure Custom Path (Option B only)

If you kept components in a custom location, configure the parser:

```typescript
import { parseUICPContent } from '@uicp/parser';

const parsed = await parseUICPContent(content, {
  definitions: './lib/uicp/definitions.json',
  componentsBasePath: '/components/chat', // Your custom path
});
```

### 9. Gradually Remove Old Rendering Logic

If you had manual component insertion logic:

**Before:**
```typescript
if (message.type === 'product') {
  return <ProductCard {...message.data} />;
}
```

**After:**
Now the parser handles this automatically via UICP blocks, so you can remove custom logic.

---

## Configuration Options

### Custom Component Path

Default: `/components/uicp`

To use a different path:

```typescript
const parsed = await parseUICPContent(content, {
  definitions: './lib/uicp/definitions.json',
  componentsBasePath: '/your/custom/path',
});
```

### Definitions from URL

Host definitions.json on a CDN or API:

```typescript
const result = await getUIComponents('https://api.example.com/definitions.json');
```

This allows updating component schemas without code changes.

### Caching

Control cache TTL for definitions:

```typescript
import { getUIComponents } from '@uicp/tools';

// 10 minute cache
await getUIComponents(definitionsPath, {}, 10 * 60 * 1000);

// Disable caching
await getUIComponents(definitionsPath, {}, 0);
```

---

## Common Patterns

### Multiple Component Types

Group components by type in definitions:

```json
{
  "components": [
    { "uid": "InfoCard", "type": "card", ... },
    { "uid": "WarningCard", "type": "card", ... },
    { "uid": "DataTable", "type": "table", ... },
    { "uid": "LineChart", "type": "chart", ... }
  ]
}
```

The LLM can filter by type using `component_type` parameter.

### Dynamic Component Loading

For large apps with many components, use dynamic imports:

```typescript
import { loadComponent } from '@uicp/parser';

// Components load on-demand
const component = await loadComponent('ProductCard', 'product-card', '/components/uicp');
```

This is handled automatically by `parseUICPContent()`.

### Component Variants

Use enum fields for variants:

```json
{
  "inputs": {
    "variant": {
      "type": "string",
      "required": false,
      "default": "default",
      "enum": ["default", "primary", "success", "warning", "danger"]
    }
  }
}
```

---

## Troubleshooting

### Components Not Rendering

**Check:**
1. Component is registered: `registerComponent('ComponentName', Component)`
2. UID in `registerComponent()` matches definitions.json `uid`
3. Component is exported from its file
4. `componentPath` in definitions.json is correct
5. Base path configuration matches your structure

### LLM Not Using Components

**Check:**
1. Tools are properly configured in your chat API
2. System prompt mentions UI components
3. Definitions path is correct and file exists
4. Tools are returning success (check logs)

### Type Errors

**Solution:**
Cast definitions to `any` when using with parser:

```typescript
import definitions from '@/lib/uicp/definitions.json';

parseUICPContentSync(content, definitions as any);
```

### Build Errors with Dynamic Imports

Next.js may warn about dynamic imports. This is expected and safe - it's how UICP loads components on demand.

---

## Framework-Specific Notes

### Next.js

- Use `'use client'` directive in message component
- Definitions import works with `resolveJsonModule: true` in tsconfig
- No special configuration needed

### Create React App

- Ensure `resolveJsonModule: true` in tsconfig.json
- Place definitions.json in `src/` directory
- Import works the same way

### Vite

- JSON imports work by default
- No special configuration needed

### Remix

- Place definitions in `app/` directory
- Use server-side tools in loaders/actions
- Client components same as React

---

## Best Practices

### 1. Start Small

Begin with 2-3 simple components:
- A card component
- A list/table component
- A status/alert component

### 2. Write Clear Descriptions

The LLM uses descriptions to understand when to use components:

```json
{
  "description": "Display product information with image, title, price, and description. Use for e-commerce product displays.",
  "inputs": {
    "price": {
      "description": "Product price in dollars (numeric, e.g. 99.99)",
      ...
    }
  }
}
```

### 3. Provide Good Examples

Examples help the LLM understand data format:

```json
{
  "example": {
    "uid": "DataTable",
    "data": {
      "headers": ["Name", "Age", "City"],
      "rows": [
        ["Alice", "28", "New York"],
        ["Bob", "35", "San Francisco"]
      ]
    }
  }
}
```

### 4. Test Incrementally

1. Add one component
2. Test LLM can discover it
3. Test LLM can create UICP block
4. Test frontend renders it
5. Add next component

### 5. Version Your Definitions

Keep version in definitions.json and update when schema changes:

```json
{
  "version": "1.1.0",
  "components": [...]
}
```

---

## Quick Reference

### Installation
```bash
npm install @uicp/parser @uicp/tools
```

### Backend (Vercel AI SDK)
```typescript
import { getUIComponents, createUIComponent } from '@uicp/tools';
// Add tools to streamText()
```

### Frontend
```typescript
import { parseUICPContentSync, registerComponent } from '@uicp/parser';
// Register components, parse content
```

### definitions.json
```json
{
  "version": "1.0.0",
  "components": [
    {
      "uid": "ComponentName",
      "type": "category",
      "description": "What it does",
      "componentPath": "file-name",
      "inputs": { /* props schema */ },
      "example": { /* example data */ }
    }
  ]
}
```

---

## Next Steps

After successful installation:

1. **Test thoroughly**: Try various prompts that should trigger components
2. **Add more components**: Gradually expand your component library
3. **Monitor usage**: See which components LLM uses most
4. **Iterate on descriptions**: Refine descriptions based on LLM behavior
5. **Share feedback**: Report issues at https://github.com/indigoai-us/uicp

---

## Additional Resources

- [Parser API Documentation](https://github.com/indigoai-us/uicp/tree/main/packages/parser#readme)
- [Tools API Documentation](https://github.com/indigoai-us/uicp/tree/main/packages/tools#readme)
- [Example Application](https://github.com/indigoai-us/uicp/tree/main/examples/nextjs-chat#readme)
- [GitHub Repository](https://github.com/indigoai-us/uicp)

---

## Support

If you encounter issues during installation:

1. Check this guide's troubleshooting section
2. Review example application in the repository
3. Open an issue on GitHub with:
   - Framework/library versions
   - Error messages
   - Steps to reproduce

Good luck with your UICP installation! 🚀

