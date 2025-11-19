# Project Structure

Understanding the example project's structure and organization.

## Directory Layout

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
│       ├── definitions.json     # Component definitions
│       └── registry.ts          # Component registration
├── env.example                  # Environment template
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## Key Files

### app/api/chat/route.ts

Backend API route that handles chat requests.

**Key features:**
- Integrates with Vercel AI SDK
- Configures UICP tools (getUIComponents, createUIComponent)
- Streams responses to frontend
- Uses OpenAI GPT-4o

**Code highlights:**
```typescript
import { getUIComponents, createUIComponent } from '@uicp/tools';

tools: {
  get_ui_components: tool({ ... }),
  create_ui_component: tool({ ... }),
}
```

### app/page.tsx

Main chat interface component.

**Key features:**
- Chat UI with message list
- Input for user messages
- Uses Vercel AI SDK's useChat hook
- Handles streaming responses

### components/message.tsx

Message rendering component with UICP parsing.

**Key features:**
- Parses UICP blocks from AI responses
- Renders components dynamically
- Handles text with ReactMarkdown
- Different styling for user/assistant messages

**Code highlights:**
```typescript
import { parseUICPContentSync, registerComponent } from '@uicp/parser';

registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);

const parsed = parseUICPContentSync(content, definitions);
```

### components/uicp/simple-card.tsx

Example card component for displaying information.

**Features:**
- Title and content props
- Optional footer
- Visual variants (default, info, success, warning, error)
- Styled with Tailwind CSS

### components/uicp/data-table.tsx

Example table component for tabular data.

**Features:**
- Headers and rows props
- Optional title
- Striped/compact variants
- Responsive design

### lib/uicp/definitions.json

Component definitions file.

**Contains:**
- Component schemas
- Input definitions
- Examples for AI
- Type information

### lib/uicp/registry.ts

Component registration file.

**Purpose:**
- Pre-register all UICP components
- Ensures components are available to parser
- Import once at app startup

## Data Flow

### 1. User Sends Message

```
User types → Input → Submit → POST /api/chat
```

### 2. Backend Processing

```
API Route
  ↓
Vercel AI SDK streamText()
  ↓
OpenAI GPT-4o
  ↓
May call UICP tools:
  - get_ui_components()
  - create_ui_component()
  ↓
Returns streaming response
```

### 3. Frontend Rendering

```
Response Stream
  ↓
useChat hook updates messages
  ↓
Message component renders
  ↓
Checks for UICP blocks
  ↓
Parses & renders components
```

## Configuration Files

### tsconfig.json

TypeScript configuration.

**Key settings:**
- `resolveJsonModule: true` - Import JSON files
- `paths` - Path aliases (@/*)
- Strict type checking

### tailwind.config.ts

Tailwind CSS configuration.

**Customizations:**
- Color scheme
- Typography
- Component styles

### next.config.mjs

Next.js configuration.

**Settings:**
- No special UICP configuration needed
- Standard Next.js setup

## Dependencies

### Production Dependencies

- `next` - Next.js framework
- `react` & `react-dom` - React library
- `ai` - Vercel AI SDK
- `@ai-sdk/openai` - OpenAI provider
- `@uicp/parser` - UICP frontend parsing
- `@uicp/tools` - UICP backend tools
- `react-markdown` - Markdown rendering

### Development Dependencies

- `typescript` - Type checking
- `tailwindcss` - Styling
- `eslint` - Linting

## Environment Variables

### Required

```env
OPENAI_API_KEY=sk-...  # Your OpenAI API key
```

### Optional

```env
OPENAI_MODEL=gpt-4o    # Model to use (default: gpt-4o)
```

## Build Output

When built for production:

```
.next/
├── static/             # Static assets
├── server/             # Server-side code
└── standalone/         # Standalone deployment (optional)
```

## Next Steps

- [Component Examples](component-examples.md) - Study the components
- [Adding Components](adding-components.md) - Add your own
- [Deployment](deployment.md) - Deploy to production

