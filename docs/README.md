# Welcome to UICP

**UICP (User Interface Context Protocol)** enables LLM-based agents to describe and render UI components dynamically in chat interfaces. Instead of only returning text, AI agents can discover, create, and render rich UI components like cards, tables, charts, and custom interfaces.

## What is UICP?

UICP is a protocol and set of tools that bridges the gap between AI text generation and rich user interfaces. It allows AI agents to:

- 🔍 **Discover** available UI components and their schemas
- 🎨 **Create** structured component blocks that render as rich UI
- ⚡ **Render** these components inline with text responses
- 🔧 **Validate** component data against defined schemas

## Why UICP?

Traditional AI chat interfaces are limited to text and markdown. UICP unlocks:

- **Richer User Experiences**: Display data in cards, tables, charts, forms, and custom UI
- **Better Information Presentation**: Structure complex information in appropriate UI components
- **Interactive Elements**: Enable user interactions beyond simple text input
- **Consistent Design**: Components follow your design system automatically
- **Type Safety**: Full TypeScript support with runtime validation

## Architecture

UICP consists of two core packages:

### @uicp/parser (Frontend)
Parses LLM output, extracts UICP blocks, and renders React components dynamically.

### @uicp/tools (Backend)
Provides AI tools for component discovery and UICP block creation. Works with any LLM framework.

```
┌─────────────────┐
│   AI Agent      │
│  (OpenAI, etc)  │
└────────┬────────┘
         │
         │ Uses Tools
         ▼
┌─────────────────┐     ┌──────────────────┐
│  @uicp/tools    │────▶│  definitions.json│
│  (Backend)      │     │  Component Specs │
└────────┬────────┘     └──────────────────┘
         │
         │ Returns UICP Blocks
         ▼
┌─────────────────┐
│  Chat Response  │
│  (Text + UICP)  │
└────────┬────────┘
         │
         │ Parse & Render
         ▼
┌─────────────────┐     ┌──────────────────┐
│  @uicp/parser   │────▶│ React Components │
│  (Frontend)     │     │  Your UI Library │
└─────────────────┘     └──────────────────┘
```

## Key Features

- **Framework Agnostic**: Works with OpenAI, Anthropic, LangChain, Vercel AI SDK, and more
- **React Integration**: First-class React support with hooks and components
- **Dynamic Loading**: Components load on-demand or can be pre-registered
- **Type Safe**: Full TypeScript support throughout
- **Caching**: Built-in caching for performance
- **Validation**: Automatic schema validation for component data
- **Flexible Definitions**: Load component definitions from files, URLs, or objects

## Quick Example

**Define a component:**
```json
{
  "uid": "SimpleCard",
  "type": "card",
  "description": "A card component for displaying information",
  "componentPath": "simple-card",
  "inputs": {
    "title": { "type": "string", "required": true },
    "content": { "type": "string", "required": true }
  }
}
```

**AI agent uses tools to create UICP block:**
````markdown
Here's the information you requested:

```uicp
{
  "uid": "SimpleCard",
  "data": {
    "title": "Welcome to UICP",
    "content": "Dynamic UI components in your chat interface!"
  }
}
```
````

**Frontend parses and renders:**
```tsx
import { UICPContent } from '@uicp/parser';

function Message({ content }) {
  return (
    <UICPContent
      content={content}
      definitions="/lib/uicp/definitions.json"
      textRenderer={(text) => <Markdown>{text}</Markdown>}
    />
  );
}
```

Result: A beautiful card component rendered inline with the text!

## Getting Started

Ready to add UICP to your project? Check out the [Getting Started](getting-started/installation.md) guide.

## Use Cases

- **Data Visualization**: Tables, charts, and graphs for data analysis
- **E-commerce**: Product cards, pricing tables, shopping carts
- **Documentation**: Code examples, API references, interactive tutorials
- **Dashboards**: Metrics, KPIs, status indicators
- **Forms**: Dynamic form generation and validation
- **Notifications**: Alerts, warnings, success messages
- **Content Cards**: News articles, blog posts, media galleries

## Community & Support

- **GitHub**: [github.com/uicp/uicp](https://github.com/uicp/uicp)
- **Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas

---

Built with ❤️ by the UICP community

