# React Components

@uicp/parser provides ready-to-use React components for easy integration.

## UICPContent

All-in-one component that handles parsing and rendering automatically.

### Basic Usage

```tsx
import { UICPContent } from '@uicp/parser';
import definitions from '@/lib/uicp/definitions.json';

function Message({ content }) {
  return (
    <UICPContent
      content={content}
      definitions={definitions}
    />
  );
}
```

### Props

```typescript
interface UICPContentProps {
  content: string;
  definitions: string | Definitions;
  componentsBasePath?: string;
  textRenderer?: (text: string) => ReactNode;
  componentWrapper?: (component: ReactElement) => ReactNode;
  loading?: ReactNode;
  fallback?: ReactNode;
}
```

#### content (required)

String containing text and UICP blocks to parse.

```tsx
<UICPContent content={message.content} definitions={definitions} />
```

#### definitions (required)

Component definitions as object or path/URL.

```tsx
// Object
import definitions from './definitions.json';
<UICPContent content={content} definitions={definitions} />

// Path
<UICPContent content={content} definitions="./definitions.json" />

// URL
<UICPContent content={content} definitions="https://api.example.com/definitions.json" />
```

#### componentsBasePath (optional)

Base path for dynamic component imports. Default: `/components/uicp`

```tsx
<UICPContent
  content={content}
  definitions={definitions}
  componentsBasePath="/my-components"
/>
```

#### textRenderer (optional)

Custom renderer for text content. Default renders plain text.

```tsx
import ReactMarkdown from 'react-markdown';

<UICPContent
  content={content}
  definitions={definitions}
  textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
/>
```

#### componentWrapper (optional)

Wrapper for rendered components. Useful for spacing/styling.

```tsx
<UICPContent
  content={content}
  definitions={definitions}
  componentWrapper={(component) => (
    <div className="my-4 p-2 border rounded">
      {component}
    </div>
  )}
/>
```

#### loading (optional)

Content to show while parsing.

```tsx
<UICPContent
  content={content}
  definitions={definitions}
  loading={<div className="spinner">Loading...</div>}
/>
```

#### fallback (optional)

Content to show on error.

```tsx
<UICPContent
  content={content}
  definitions={definitions}
  fallback={<div className="error">Failed to render</div>}
/>
```

### Complete Example

```tsx
import { UICPContent } from '@uicp/parser';
import ReactMarkdown from 'react-markdown';
import definitions from '@/lib/uicp/definitions.json';
import '@/lib/uicp/registry';

export function Message({ content, isLoading }) {
  if (isLoading) {
    return <div className="loading">Generating response...</div>;
  }

  return (
    <UICPContent
      content={content}
      definitions={definitions}
      componentsBasePath="/components/uicp"
      textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
      componentWrapper={(component) => (
        <div className="my-4">{component}</div>
      )}
      loading={<div className="spinner" />}
      fallback={<div className="error">Error rendering component</div>}
    />
  );
}
```

## UICPProvider

Context provider for shared configuration across multiple components.

### Basic Usage

```tsx
import { UICPProvider } from '@uicp/parser';
import definitions from '@/lib/uicp/definitions.json';

export function App({ children }) {
  return (
    <UICPProvider 
      definitions={definitions}
      componentsBasePath="/components/uicp"
    >
      {children}
    </UICPProvider>
  );
}
```

### Props

```typescript
interface UICPProviderProps {
  children: ReactNode;
  definitions: string | Definitions;
  componentsBasePath?: string;
}
```

### With UICPContent

When using `UICPProvider`, `UICPContent` inherits the configuration:

```tsx
// In layout/wrapper
<UICPProvider definitions={definitions} componentsBasePath="/components">
  <ChatInterface />
</UICPProvider>

// In child components - no need to pass definitions/basePath
<UICPContent content={content} />
```

### Complete Example

```tsx
// app/layout.tsx
import { UICPProvider } from '@uicp/parser';
import definitions from '@/lib/uicp/definitions.json';
import '@/lib/uicp/registry';

export default function Layout({ children }) {
  return (
    <UICPProvider
      definitions={definitions}
      componentsBasePath="/components/uicp"
    >
      <div className="app">
        {children}
      </div>
    </UICPProvider>
  );
}

// components/message.tsx - simplified!
import { UICPContent } from '@uicp/parser';
import ReactMarkdown from 'react-markdown';

export function Message({ content }) {
  return (
    <UICPContent
      content={content}
      textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
    />
  );
}
```

## Best Practices

### 1. Pre-register Components

For production, pre-register all components:

```tsx
// lib/uicp/registry.ts
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from '@/components/uicp/simple-card';
import { DataTable } from '@/components/uicp/data-table';

registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);

// In your component
import '@/lib/uicp/registry';
```

### 2. Use Provider Pattern

For multiple message components, use provider:

```tsx
<UICPProvider definitions={definitions}>
  <MessageList messages={messages} />
</UICPProvider>
```

### 3. Custom Text Rendering

Always provide a text renderer for markdown support:

```tsx
<UICPContent
  textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
/>
```

### 4. Error Boundaries

Wrap in error boundary for production:

```tsx
<ErrorBoundary fallback={<div>Error</div>}>
  <UICPContent content={content} definitions={definitions} />
</ErrorBoundary>
```

## Next Steps

- [Hooks](hooks.md) - Use hooks for more control
- [API Reference](api-reference.md) - Full API documentation
- [Configuration](configuration.md) - Advanced configuration

