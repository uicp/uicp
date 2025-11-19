# Component Examples

Detailed look at the example components included in the project.

## SimpleCard Component

A versatile card component for displaying information.

### Features

- Title and content display
- Optional footer text
- Five visual variants
- Icon indicators
- Responsive design

### Component Code

```tsx
// components/uicp/simple-card.tsx

interface SimpleCardProps {
  title: string;
  content: string;
  footer?: string;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
}

export function SimpleCard({
  title,
  content,
  footer,
  variant = 'default',
}: SimpleCardProps) {
  const variantStyles = {
    default: 'border-gray-700 bg-gray-800/50',
    info: 'border-blue-600 bg-blue-950/50',
    success: 'border-green-600 bg-green-950/50',
    warning: 'border-yellow-600 bg-yellow-950/50',
    error: 'border-red-600 bg-red-950/50',
  };

  return (
    <div className={`border rounded-lg p-6 my-4 ${variantStyles[variant]}`}>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <div className="text-gray-300 leading-relaxed mb-4">
        {content}
      </div>
      {footer && (
        <div className="text-sm text-gray-400 pt-3 border-t border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
}
```

### Definition

```json
{
  "uid": "SimpleCard",
  "type": "card",
  "description": "A simple card component for displaying information",
  "componentPath": "simple-card",
  "inputs": {
    "title": {
      "type": "string",
      "description": "The card title or heading",
      "required": true
    },
    "content": {
      "type": "string",
      "description": "The main content or body text",
      "required": true
    },
    "footer": {
      "type": "string",
      "description": "Optional footer text",
      "required": false
    },
    "variant": {
      "type": "string",
      "description": "Visual style variant",
      "required": false,
      "default": "default",
      "enum": ["default", "info", "success", "warning", "error"]
    }
  }
}
```

### Usage Examples

**Welcome Card:**
```
User: "Create a welcome card"
AI creates:
```uicp
{
  "uid": "SimpleCard",
  "data": {
    "title": "Welcome to UICP",
    "content": "Dynamic UI components in your chat!",
    "variant": "info"
  }
}
```
```

**Success Message:**
```
User: "Show a success message that my profile was updated"
AI creates:
```uicp
{
  "uid": "SimpleCard",
  "data": {
    "title": "Profile Updated",
    "content": "Your profile changes have been saved successfully.",
    "footer": "Updated just now",
    "variant": "success"
  }
}
```
```

## DataTable Component

A table component for displaying structured data.

### Features

- Dynamic headers and rows
- Optional title
- Striped rows option
- Compact mode
- Responsive scrolling

### Component Code

```tsx
// components/uicp/data-table.tsx

interface DataTableProps {
  title?: string;
  headers: string[];
  rows: string[][];
  striped?: boolean;
  compact?: boolean;
}

export function DataTable({
  title,
  headers,
  rows,
  striped = true,
  compact = false,
}: DataTableProps) {
  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className="my-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-100 mb-3">
          {title}
        </h3>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`${cellPadding} text-left text-sm font-semibold text-gray-200`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={
                  striped && rowIndex % 2 === 1
                    ? 'bg-gray-800/50'
                    : 'bg-gray-900/50'
                }
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`${cellPadding} text-sm text-gray-300`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Definition

```json
{
  "uid": "DataTable",
  "type": "table",
  "description": "Display tabular data with headers and rows",
  "componentPath": "data-table",
  "inputs": {
    "title": {
      "type": "string",
      "description": "Table title or caption",
      "required": false
    },
    "headers": {
      "type": "array",
      "description": "Array of column header labels",
      "required": true
    },
    "rows": {
      "type": "array",
      "description": "Array of row data",
      "required": true
    },
    "striped": {
      "type": "boolean",
      "description": "Whether to use alternating row colors",
      "required": false,
      "default": true
    },
    "compact": {
      "type": "boolean",
      "description": "Whether to use compact spacing",
      "required": false,
      "default": false
    }
  }
}
```

### Usage Examples

**Sales Report:**
```
User: "Show me Q4 sales data"
AI creates:
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
    ],
    "striped": true
  }
}
```
```

**User List:**
```
User: "Show me the team members"
AI creates:
```uicp
{
  "uid": "DataTable",
  "data": {
    "title": "Team Members",
    "headers": ["Name", "Role", "Status"],
    "rows": [
      ["Alice Smith", "Developer", "Active"],
      ["Bob Jones", "Designer", "Active"],
      ["Carol White", "Manager", "Active"]
    ]
  }
}
```
```

## Design Patterns

### Consistent Styling

Both components use:
- Dark theme colors
- Consistent spacing
- Tailwind CSS utility classes
- Responsive design

### TypeScript Props

All components:
- Define TypeScript interfaces
- Use optional props with defaults
- Export as named functions

### Accessibility

Components include:
- Semantic HTML
- Readable text colors
- Proper heading hierarchy
- Keyboard navigation support

## Next Steps

- [Adding Components](adding-components.md) - Create your own
- [Project Structure](project-structure.md) - Understand the codebase
- [Deployment](deployment.md) - Deploy to production

