# Example Project Overview

The UICP repository includes a complete Next.js chat application demonstrating UICP integration with the Vercel AI SDK.

## What's Included

The example project showcases:

- ✅ Full UICP integration (backend + frontend)
- ✅ Real-time streaming chat with OpenAI GPT-4
- ✅ Two example components (SimpleCard, DataTable)
- ✅ Component definitions and registration
- ✅ Modern Next.js 14 App Router
- ✅ TypeScript throughout
- ✅ Tailwind CSS styling

## Location

```
uicp/examples/nextjs-chat/
```

## Quick Start

### 1. Prerequisites

- Node.js 18+
- OpenAI API key

### 2. Install Dependencies

From the monorepo root:

```bash
npm install
npm run build
```

### 3. Configure Environment

```bash
cd examples/nextjs-chat
cp env.example .env.local
```

Edit `.env.local`:

```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Try It Out

### SimpleCard Examples

- "Create a welcome card"
- "Show me a card with information about UICP"
- "Make an info card explaining how this works"

### DataTable Examples

- "Show me a sales report in a table"
- "Create a table with employee data"
- "Display product information as a table"

## What You'll Learn

By exploring this example:

1. **Backend Integration**: How to add UICP tools to a chat API
2. **Frontend Parsing**: How to parse and render UICP blocks
3. **Component Creation**: How to create UICP components
4. **Definitions**: How to define components for AI
5. **Best Practices**: Production-ready patterns

## Next Steps

- [Project Structure](project-structure.md) - Understand the codebase
- [Component Examples](component-examples.md) - Study the components
- [Adding Components](adding-components.md) - Add your own
- [Deployment](deployment.md) - Deploy to production

