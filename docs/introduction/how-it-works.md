# How It Works

UICP enables a complete workflow from AI decision-making to rich UI rendering. This guide walks through the entire process.

## The Complete Flow

```
1. User Message
   ↓
2. AI Agent (with UICP Tools)
   ↓
3. Tool Execution
   ↓
4. AI Response (Text + UICP Blocks)
   ↓
5. Frontend Parsing
   ↓
6. Component Rendering
   ↓
7. User sees Rich UI
```

Let's explore each step in detail.

## Step 1: User Sends Message

A user asks a question or makes a request in your chat interface:

```
User: "Show me the sales data for Q4"
```

## Step 2: AI Agent Processes Request

Your AI agent (OpenAI, Anthropic, etc.) receives the message along with UICP tools. The agent decides whether to use regular text or UI components.

### System Prompt Example

```typescript
const systemPrompt = `You are a helpful assistant with access to UI components.

Available tools:
- get_ui_components: Discover available UI components
- create_ui_component: Create rich UI components

Use components when they make responses clearer or more engaging.`;
```

## Step 3: AI Uses UICP Tools

### 3a. Component Discovery

The AI first discovers what components are available:

```typescript
// Tool call: get_ui_components
{
  component_type: "table"
}

// Tool response:
{
  success: true,
  components: [
    {
      uid: "DataTable",
      type: "table",
      description: "Display tabular data",
      inputs: {
        headers: { type: "array", required: true },
        rows: { type: "array", required: true }
      }
    }
  ]
}
```

### 3b. Component Creation

The AI decides to use DataTable and creates it:

```typescript
// Tool call: create_ui_component
{
  uid: "DataTable",
  data: {
    title: "Q4 Sales Report",
    headers: ["Month", "Revenue", "Growth"],
    rows: [
      ["October", "$45,000", "+12%"],
      ["November", "$52,000", "+15%"],
      ["December", "$68,000", "+31%"]
    ]
  }
}

// Tool response:
{
  success: true,
  uicp_block: "```uicp\n{\"uid\":\"DataTable\",\"data\":{...}}\n```"
}
```

## Step 4: AI Returns Response

The AI includes the UICP block in its response:

````markdown
Here's your Q4 sales data:

```uicp
{
  "uid": "DataTable",
  "data": {
    "title": "Q4 Sales Report",
    "headers": ["Month", "Revenue", "Growth"],
    "rows": [
      ["October", "$45,000", "+12%"],
      ["November", "$52,000", "+15%"],
      ["December", "$68,000", "+31%"]
    ]
  }
}
```

As you can see, revenue grew significantly in December, showing a strong finish to the year.
````

## Step 5: Frontend Parses Response

Your message component receives the response and parses it:

```typescript
import { UICPContent } from '@uicp/parser';

function Message({ content }) {
  return (
    <UICPContent
      content={content}
      definitions="/lib/uicp/definitions.json"
      componentsBasePath="/components/uicp"
      textRenderer={(text) => <Markdown>{text}</Markdown>}
    />
  );
}
```

### What Happens During Parsing

1. **Detection**: Parser checks for UICP blocks using regex
2. **Extraction**: Blocks are extracted, text is separated
3. **Validation**: Each block is validated against definitions
4. **Loading**: Components are loaded from registry or dynamically imported
5. **Rendering**: React elements are created

### Behind the Scenes

```typescript
// 1. Check for blocks
if (hasUICPBlocks(content)) {
  // 2. Extract blocks
  const { blocks, contentWithPlaceholders } = extractUICPBlocks(content);
  
  // 3. Validate each block
  for (const block of blocks) {
    const { valid, errors } = validateUICPBlock(block, definitions);
    
    if (valid) {
      // 4. Load component
      const component = await loadComponent(
        block.uid,
        componentDef.componentPath,
        basePath
      );
      
      // 5. Render
      return <Component {...block.data} />;
    }
  }
}
```

## Step 6: Component Rendering

The DataTable component renders with the provided data:

```tsx
// components/uicp/data-table.tsx
export function DataTable({ title, headers, rows }) {
  return (
    <div>
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            {headers.map(h => <th>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr>
              {row.map(cell => <td>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Step 7: User Sees Rich UI

The user sees a beautifully formatted table embedded in the chat response, along with the explanatory text.

## Backend Implementation Details

### Tool Integration (Vercel AI SDK)

```typescript
import { streamText, tool } from 'ai';
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
        return await getUIComponents(definitionsPath, params);
      },
    }),
    create_ui_component: tool({
      description: 'Create a UICP block',
      parameters: z.object({
        uid: z.string(),
        data: z.record(z.any()),
      }),
      execute: async (params) => {
        return await createUIComponent(definitionsPath, params);
      },
    }),
  },
});
```

### Definitions Loading

```typescript
// @uicp/tools loads definitions from various sources:

// File path
await getUIComponents('./definitions.json');

// URL
await getUIComponents('https://api.example.com/definitions.json');

// Object
await getUIComponents(definitionsObject);
```

### Caching

```typescript
// Definitions are cached by default (5 minutes TTL)
const result1 = await getUIComponents('./definitions.json');
// ↑ Loads from file

const result2 = await getUIComponents('./definitions.json');
// ↑ Returns from cache

// Custom TTL
await getUIComponents('./definitions.json', {}, 10 * 60 * 1000);

// Clear cache
import { clearCache } from '@uicp/tools';
clearCache('./definitions.json');
```

## Frontend Implementation Details

### Component Registration

```typescript
// Pre-register components at app startup
import { registerComponent } from '@uicp/parser';
import { DataTable } from './components/uicp/data-table';
import { SimpleCard } from './components/uicp/simple-card';

registerComponent('DataTable', DataTable);
registerComponent('SimpleCard', SimpleCard);
```

### Dynamic Loading

```typescript
// Or let components load dynamically
const parsed = await parseUICPContent(content, {
  definitions: './definitions.json',
  componentsBasePath: '/components/uicp',
});
```

### Error Handling

```tsx
<UICPContent
  content={content}
  definitions={definitions}
  fallback={
    <div className="error">
      Failed to render component
    </div>
  }
  loading={
    <div className="loading">
      Loading component...
    </div>
  }
/>
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│                      User Browser                        │
│                                                          │
│  ┌─────────────────┐         ┌─────────────────┐       │
│  │  Chat Input     │────────▶│  Send Message   │       │
│  └─────────────────┘         └────────┬────────┘       │
│                                        │                 │
└────────────────────────────────────────┼─────────────────┘
                                         │ POST
                                         ▼
┌──────────────────────────────────────────────────────────┐
│                    Backend Server                        │
│                                                          │
│  ┌─────────────────┐         ┌─────────────────┐       │
│  │  Chat Endpoint  │────────▶│  LLM Provider   │       │
│  └────────┬────────┘         └────────┬────────┘       │
│           │                            │                 │
│           │ Load                       │ Tool Calls     │
│           ▼                            ▼                 │
│  ┌─────────────────┐         ┌─────────────────┐       │
│  │ definitions.json│         │  @uicp/tools    │       │
│  └─────────────────┘         └────────┬────────┘       │
│                                        │                 │
│                                        │ Return UICP    │
│                                        ▼                 │
│                              ┌─────────────────┐        │
│                              │ Response Stream │        │
│                              └────────┬────────┘        │
└──────────────────────────────────────┼──────────────────┘
                                       │ Stream
                                       ▼
┌──────────────────────────────────────────────────────────┐
│                      User Browser                        │
│                                                          │
│  ┌─────────────────┐         ┌─────────────────┐       │
│  │  Message List   │◀────────│  @uicp/parser   │       │
│  └────────┬────────┘         └────────▲────────┘       │
│           │                            │                 │
│           │ Render                     │ Parse          │
│           ▼                            │                 │
│  ┌─────────────────┐         ┌─────────────────┐       │
│  │  Text + UI      │         │  UICP Blocks    │       │
│  │  Components     │         └─────────────────┘       │
│  └─────────────────┘                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Caching Strategy

1. **Definitions**: Cached for 5 minutes (configurable)
2. **Components**: Cached for app lifetime once loaded
3. **Validation**: Results not cached (fast enough)

### Loading Strategy

- **Pre-register** frequently used components
- **Dynamic load** rarely used components
- Use **code splitting** for large component libraries

### Rendering Optimization

- Components are React elements (memoization works)
- Use React.memo for expensive components
- Leverage key props for stable identity

## Next Steps

- Explore real-world [Use Cases](use-cases.md)
- Start implementing with [Getting Started](../getting-started/installation.md)
- Deep dive into [@uicp/parser](../packages/parser/overview.md) and [@uicp/tools](../packages/tools/overview.md)

