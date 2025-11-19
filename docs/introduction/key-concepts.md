# Key Concepts

Understanding the core concepts of UICP will help you integrate it effectively into your applications.

## Component Definitions

Component definitions are JSON specifications that describe UI components to AI agents. They include:

- **uid**: Unique identifier for the component
- **type**: Category (card, table, chart, etc.)
- **description**: What the component does (for AI understanding)
- **componentPath**: Location of the React component
- **inputs**: Schema defining the component's props
- **example**: Sample data for AI reference

### Example Definition

```json
{
  "uid": "SimpleCard",
  "type": "card",
  "description": "A card component for displaying information",
  "componentPath": "simple-card",
  "inputs": {
    "title": {
      "type": "string",
      "description": "Card title",
      "required": true
    },
    "content": {
      "type": "string",
      "description": "Card content",
      "required": true
    }
  },
  "example": {
    "uid": "SimpleCard",
    "data": {
      "title": "Example",
      "content": "This is an example card"
    }
  }
}
```

## UICP Blocks

UICP blocks are structured markdown code blocks that the AI agent creates. They contain component data in JSON format:

````markdown
```uicp
{
  "uid": "SimpleCard",
  "data": {
    "title": "Welcome",
    "content": "Hello, UICP!"
  }
}
```
````

These blocks are:
- **Embedded in responses**: Mixed with regular text
- **Parsed by frontend**: Extracted and converted to React components
- **Validated**: Checked against component definitions
- **Rendered**: Displayed as rich UI components

## Component Registry

The component registry is a mapping between component UIDs and their React implementations. Components can be:

- **Pre-registered**: Imported and registered at app startup
- **Dynamically loaded**: Loaded on-demand when needed

### Pre-registration (Recommended for Production)

```typescript
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from './components/simple-card';

registerComponent('SimpleCard', SimpleCard);
```

### Dynamic Loading

```typescript
import { loadComponent } from '@uicp/parser';

const component = await loadComponent(
  'SimpleCard',
  'simple-card',
  '/components/uicp'
);
```

## Tools

UICP provides two AI tools that agents use:

### 1. get_ui_components

Allows the AI to discover available components and their schemas.

**Purpose**: Component discovery
**Parameters**: 
- `component_type` (optional): Filter by type
- `uid` (optional): Get specific component

**Returns**: List of available components with their schemas

### 2. create_ui_component

Creates a UICP block for a specific component.

**Purpose**: Component instantiation
**Parameters**:
- `uid`: Component to create
- `data`: Component data (props)

**Returns**: Formatted UICP block or validation errors

## Parser Flow

The parser processes content in several steps:

1. **Detection**: Checks if content contains UICP blocks
2. **Extraction**: Extracts blocks and separates text content
3. **Validation**: Validates block data against definitions
4. **Loading**: Loads or retrieves component from registry
5. **Rendering**: Renders React component with validated data

```
Content → Detect → Extract → Validate → Load → Render
```

## Component Path Resolution

Component paths are resolved relative to a base path:

```
componentsBasePath: /components/uicp
componentPath: simple-card
↓
Final path: /components/uicp/simple-card
```

The parser automatically:
- Handles both `.tsx` and `.jsx` extensions
- Supports default and named exports
- Manages dynamic imports

## Validation

UICP validates component data at multiple stages:

### Schema Validation
Checks data against the component's input schema:
- Required fields are present
- Types match (string, number, boolean, array, object)
- Enum values are valid

### Runtime Validation
Additional validation during rendering:
- Component exists in registry or can be loaded
- Component definition exists
- Data structure matches expectations

## Caching

UICP uses caching for performance:

### Definitions Cache
- **TTL**: Configurable (default: 5 minutes)
- **Invalidation**: Automatic on expiry or manual
- **Scope**: Per definitions file/URL

### Component Cache
- **Lifetime**: Application lifetime
- **Invalidation**: Manual via `clearRegistry()`
- **Scope**: Global registry

## Type Safety

UICP provides TypeScript types throughout:

```typescript
import type {
  UICPBlock,
  ParsedContent,
  ComponentDefinition,
  Definitions,
  ParserConfig,
  ValidationResult,
} from '@uicp/parser';
```

All types are exported and fully documented for IDE support.

## Error Handling

UICP handles errors gracefully:

- **Invalid JSON**: Shows original block with error message
- **Missing component**: Shows warning with component name
- **Validation errors**: Lists specific validation failures
- **Loading errors**: Falls back to error display component

Errors are logged to console for debugging while maintaining UI stability.

## Next Steps

- Learn [How It Works](how-it-works.md) to see the complete flow
- Explore [Use Cases](use-cases.md) for implementation ideas
- Start building with the [Getting Started](../getting-started/installation.md) guide

