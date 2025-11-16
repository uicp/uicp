# UICP Next.js Chat Example

A full-featured chat application demonstrating UICP (UI Component Protocol) with Next.js and Vercel AI SDK.

## Features

- 💬 Real-time chat with streaming responses
- 🎨 Dynamic UI component rendering
- 🔧 Two example components (SimpleCard, DataTable)
- 🤖 OpenAI GPT-4 integration via Vercel AI SDK
- ⚡ Built with Next.js 14 App Router
- 🎯 TypeScript throughout

## Prerequisites

- Node.js 18+
- OpenAI API key

## Quick Start

### 1. Install Dependencies

From the monorepo root:

```bash
npm install
npm run build
```

Or from this directory:

```bash
npm install
```

### 2. Configure Environment

```bash
cp env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Try It Out

Ask the AI to create UI components:

### SimpleCard Examples
- "Create a welcome card"
- "Show me a card with information about UICP"
- "Make an info card explaining how this works"

### DataTable Examples
- "Show me a sales report in a table"
- "Create a table with employee data"
- "Display product information as a table"

## Project Structure

```
nextjs-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts         # Chat API with UICP tools
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main chat interface
├── components/
│   ├── uicp/
│   │   ├── simple-card.tsx      # SimpleCard component
│   │   └── data-table.tsx       # DataTable component
│   └── message.tsx              # Message renderer with UICP
├── lib/
│   └── uicp/
│       └── definitions.json     # Component definitions
├── env.example                  # Environment template
├── next.config.mjs              # Next.js config
├── tailwind.config.ts           # Tailwind config
└── package.json
```

## How It Works

### 1. Component Definitions

Components are defined in `lib/uicp/definitions.json`:

```json
{
  "version": "1.0.0",
  "components": [
    {
      "uid": "SimpleCard",
      "type": "card",
      "description": "A card component",
      "componentPath": "components/uicp/simple-card",
      "inputs": { ... }
    }
  ]
}
```

### 2. AI Tools (Backend)

The chat API route provides tools to the LLM:

```typescript
// app/api/chat/route.ts
import { getUIComponents, createUIComponent } from '@uicp/tools';

tools: {
  get_ui_components: tool({ ... }),
  create_ui_component: tool({ ... }),
}
```

### 3. Component Rendering (Frontend)

Messages are parsed and rendered with UICP:

```typescript
// components/message.tsx
import { parseUICPContentSync, registerComponent } from '@uicp/parser';

// Register components
registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);

// Parse and render
const parsed = parseUICPContentSync(content, definitions);
```

## Adding New Components

### 1. Create Component

```typescript
// components/uicp/my-component.tsx
export function MyComponent({ title }: { title: string }) {
  return <div>{title}</div>;
}
```

### 2. Add Definition

```json
// lib/uicp/definitions.json
{
  "uid": "MyComponent",
  "type": "custom",
  "description": "My custom component",
  "componentPath": "components/uicp/my-component",
  "inputs": {
    "title": {
      "type": "string",
      "required": true,
      "description": "Component title"
    }
  }
}
```

### 3. Register Component

```typescript
// components/message.tsx
import { MyComponent } from './uicp/my-component';

registerComponent('MyComponent', MyComponent);
```

That's it! The AI can now use your component.

## Customization

### Change Model

Edit `.env.local`:

```env
OPENAI_MODEL=gpt-4-turbo
```

### Adjust System Prompt

Edit `app/api/chat/route.ts`:

```typescript
system: `Your custom system prompt here...`
```

### Styling

Components use Tailwind CSS. Customize in:
- `tailwind.config.ts` - Theme configuration
- `app/globals.css` - Global styles
- Component files - Component-specific styles

### Component Base Path

If you want components in a different location:

```typescript
// components/message.tsx
const parsed = await parseUICPContent(content, {
  definitions,
  componentsBasePath: '/my-custom-path',
});
```

## Deployment

### Vercel (Recommended)

```bash
vercel
```

Add environment variables in Vercel dashboard:
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

### Other Platforms

Build and start:

```bash
npm run build
npm start
```

Ensure environment variables are set.

## Troubleshooting

### Components Not Rendering

1. Check component is registered in `message.tsx`
2. Verify `componentPath` in `definitions.json`
3. Ensure component is exported correctly

### API Errors

1. Check `.env.local` has valid `OPENAI_API_KEY`
2. Verify model name is correct
3. Check API rate limits

### Build Errors

1. Rebuild packages: `npm run build` from root
2. Clear Next.js cache: `rm -rf .next`
3. Reinstall: `rm -rf node_modules && npm install`

## Learn More

- [UICP Parser Documentation](../../packages/parser/README.md)
- [UICP Tools Documentation](../../packages/tools/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai)

## License

MIT - see [LICENSE](../../LICENSE) for details.

