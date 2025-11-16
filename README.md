# UICP Monorepo

**UICP (User Interface Context Protocol)** enables LLM-based agents to describe and render UI components dynamically. This monorepo contains framework-agnostic packages for parsing and creating UICP components, plus a Next.js example application.

## Packages

### [@uicp/parser](./packages/parser)

Core parsing library for extracting and rendering UICP blocks from LLM output.

```bash
npm install @uicp/parser
```

**Features:**
- Extract UICP blocks from markdown
- Validate blocks against component definitions
- Dynamic component loading with configurable base path
- React component rendering
- TypeScript support

### [@uicp/tools](./packages/tools)

Framework-agnostic AI tools for component discovery and creation.

```bash
npm install @uicp/tools
```

**Features:**
- Discover available UI components
- Create UICP blocks with validation
- Load definitions from URLs or file paths
- Built-in caching for performance
- Works with any LLM framework

## Example Application

### [nextjs-chat](./examples/nextjs-chat)

A full-featured Next.js chat application demonstrating UICP with Vercel AI SDK.

**Features:**
- Real-time chat with streaming responses
- Dynamic UI component rendering
- Two example components (SimpleCard, DataTable)
- Vercel AI SDK integration

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/uicp/uicp.git
cd uicp
npm install
```

### 2. Build Packages

```bash
npm run build
```

### 3. Run Example

```bash
cd examples/nextjs-chat
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npm run dev
```

Visit http://localhost:3000 and try asking:
- "Create a card with a welcome message"
- "Show me sales data in a table"

## Development

### Workspace Structure

```
uicp/
├── packages/
│   ├── parser/          # @uicp/parser
│   └── tools/           # @uicp/tools
└── examples/
    └── nextjs-chat/     # Example Next.js app
```

### Commands

```bash
# Build all packages
npm run build

# Build specific package
npm run build:parser
npm run build:tools

# Run example in dev mode
npm run dev:example

# Clean all builds
npm run clean

# Lint all packages
npm run lint
```

## How It Works

### 1. Define Components

Create a `definitions.json` with your UI components:

```json
{
  "version": "1.0.0",
  "components": [
    {
      "uid": "SimpleCard",
      "type": "card",
      "description": "A card component",
      "componentPath": "components/uicp/simple-card",
      "inputs": {
        "title": {
          "type": "string",
          "required": true
        }
      }
    }
  ]
}
```

### 2. Use Tools in Your Agent

```typescript
import { getUIComponents, createUIComponent } from '@uicp/tools';

// Discover components
const components = await getUIComponents('./definitions.json');

// Create a UICP block
const result = await createUIComponent('./definitions.json', {
  uid: 'SimpleCard',
  data: { title: 'Hello World' }
});
```

### 3. Parse and Render

```typescript
import { parseUICPContent, registerComponent } from '@uicp/parser';
import { SimpleCard } from './components/simple-card';

// Register your component
registerComponent('SimpleCard', SimpleCard);

// Parse content from LLM
const parsed = await parseUICPContent(content, {
  definitions: './definitions.json',
  componentsBasePath: '/components/uicp'
});
```

## Key Principles

1. **Dynamic Definitions**: Components are defined in JSON, allowing updates without code changes
2. **Framework Agnostic**: Core tools work with any LLM framework (OpenAI, Anthropic, LangChain, etc.)
3. **Type Safe**: Full TypeScript support with generated types
4. **Flexible Loading**: Load components dynamically or pre-register for performance
5. **Validation**: Built-in schema validation for component data

## Documentation

- [Parser Package](./packages/parser/README.md)
- [Tools Package](./packages/tools/README.md)
- [Example App](./examples/nextjs-chat/README.md)
- [Local Development & Testing Guide](./LOCAL_DEVELOPMENT.md)

## Local Testing

Want to test the packages locally before publishing? We've got you covered!

### Quick Link (Recommended)

```bash
# Build and link packages
./scripts/link-local.sh         # Unix/Mac
.\scripts\link-local.ps1        # Windows

# In your test project
cd /path/to/your/test-project
npm link @uicp/parser @uicp/tools
```

### Development Mode

```bash
# Terminal 1: Auto-rebuild parser
cd packages/parser && npm run dev

# Terminal 2: Auto-rebuild tools
cd packages/tools && npm run dev

# Terminal 3: Run your test project
cd /path/to/your/test-project
npm run dev
```

For detailed testing strategies, troubleshooting, and alternative methods (npm pack, file protocol), see the [Local Development Guide](./LOCAL_DEVELOPMENT.md).

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all packages build successfully
6. Submit a pull request

### Development Setup

```bash
npm install
npm run build
```

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Links

- [GitHub Repository](https://github.com/uicp/uicp)
- [Issue Tracker](https://github.com/uicp/uicp/issues)
- [NPM Organization](https://www.npmjs.com/org/uicp)

---

Built with ❤️ by the UICP community

