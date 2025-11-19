# Component Definitions

Deep dive into creating effective component definitions for UICP.

## Definition Structure

```json
{
  "version": "1.0.0",
  "components": [
    {
      "uid": "ComponentName",
      "type": "category",
      "description": "What the component does and when to use it",
      "componentPath": "relative/path/to/component",
      "inputs": {
        "propName": {
          "type": "string",
          "description": "What this prop does",
          "required": true,
          "default": "default value",
          "enum": ["option1", "option2"]
        }
      },
      "example": {
        "uid": "ComponentName",
        "data": {
          "propName": "example value"
        }
      }
    }
  ]
}
```

## Fields Explained

### uid (required)

Unique identifier for the component. Must match the component export name and registration.

**Best practices:**
- Use PascalCase
- Be descriptive
- Keep it concise
- Make it unique across all components

```json
{
  "uid": "ProductCard"  // ✅ Good
  "uid": "product-card" // ❌ Bad - use PascalCase
  "uid": "PC"           // ❌ Bad - not descriptive
}
```

### type (required)

Component category. Used for filtering and organization.

**Common types:**
- `card` - Information cards
- `table` - Tabular data
- `chart` - Data visualization
- `form` - User input
- `alert` - Notifications
- `badge` - Status indicators
- `list` - Item lists

```json
{
  "type": "card"  // ✅ Good - clear category
}
```

### description (required)

Clear explanation of what the component does and when to use it. This is crucial for AI understanding.

**Best practices:**
- Start with what it does
- Explain when to use it
- Mention key features
- Use natural language

```json
{
  "description": "Display product information with image, title, price, and description. Use for e-commerce product displays and shopping interfaces."
}
```

### componentPath (required)

Path to component file relative to `componentsBasePath`.

**Examples:**
```json
{
  "componentPath": "simple-card"           // /components/uicp/simple-card.tsx
  "componentPath": "cards/product-card"    // /components/uicp/cards/product-card.tsx
  "componentPath": "data/table"            // /components/uicp/data/table.tsx
}
```

### inputs (required)

Schema defining component props.

#### Input Field Structure

```json
{
  "propName": {
    "type": "string",              // Data type
    "description": "Description",  // What it does
    "required": true,              // Whether required
    "default": "value",            // Default value (optional)
    "enum": ["a", "b"],           // Valid values (optional)
    "properties": {}              // For object types (optional)
  }
}
```

#### Supported Types

- **string**: Text values
- **number**: Numeric values
- **boolean**: true/false
- **array**: Lists of values
- **object**: Complex nested data

#### String Inputs

```json
{
  "title": {
    "type": "string",
    "description": "Product title or name",
    "required": true
  },
  "variant": {
    "type": "string",
    "description": "Visual style variant",
    "required": false,
    "default": "default",
    "enum": ["default", "primary", "success", "warning", "error"]
  }
}
```

#### Number Inputs

```json
{
  "price": {
    "type": "number",
    "description": "Product price in USD",
    "required": true
  },
  "rating": {
    "type": "number",
    "description": "Rating from 0 to 5",
    "required": false,
    "default": 0
  }
}
```

#### Boolean Inputs

```json
{
  "showFooter": {
    "type": "boolean",
    "description": "Whether to display the footer section",
    "required": false,
    "default": true
  }
}
```

#### Array Inputs

```json
{
  "tags": {
    "type": "array",
    "description": "Array of tag strings",
    "required": false
  },
  "headers": {
    "type": "array",
    "description": "Array of table column headers",
    "required": true
  }
}
```

#### Object Inputs

```json
{
  "user": {
    "type": "object",
    "description": "User information object",
    "required": true,
    "properties": {
      "name": {
        "type": "string",
        "description": "User's full name",
        "required": true
      },
      "avatar": {
        "type": "string",
        "description": "URL to user avatar image",
        "required": false
      }
    }
  }
}
```

### example (optional but recommended)

Realistic example of the component with data. Helps AI understand usage.

```json
{
  "example": {
    "uid": "ProductCard",
    "data": {
      "title": "Wireless Headphones",
      "price": 99.99,
      "image": "https://example.com/image.jpg",
      "description": "High-quality wireless headphones",
      "inStock": true
    }
  }
}
```

## Best Practices

### 1. Write for AI Understanding

The AI reads your descriptions to decide when and how to use components.

**Good description:**
```json
{
  "description": "Display a status message with visual styling. Use 'success' for confirmations, 'error' for failures, 'warning' for cautions, and 'info' for general information."
}
```

**Bad description:**
```json
{
  "description": "A card."  // Too vague
}
```

### 2. Be Specific with Enums

Use enums for limited value sets:

```json
{
  "status": {
    "type": "string",
    "enum": ["pending", "processing", "completed", "failed"],
    "description": "Order status: 'pending' for new orders, 'processing' for in-progress, 'completed' for finished, 'failed' for errors"
  }
}
```

### 3. Provide Defaults

Set sensible defaults for optional fields:

```json
{
  "showTimestamp": {
    "type": "boolean",
    "required": false,
    "default": true,
    "description": "Whether to show timestamp (defaults to true)"
  }
}
```

### 4. Use Realistic Examples

Examples should show actual use cases:

```json
{
  "example": {
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
}
```

### 5. Document Complex Types

For nested objects, document all properties:

```json
{
  "config": {
    "type": "object",
    "description": "Chart configuration options",
    "properties": {
      "showLegend": {
        "type": "boolean",
        "description": "Display chart legend"
      },
      "colors": {
        "type": "array",
        "description": "Array of color hex codes"
      },
      "title": {
        "type": "string",
        "description": "Chart title"
      }
    }
  }
}
```

## Complete Example

```json
{
  "version": "1.0.0",
  "components": [
    {
      "uid": "OrderCard",
      "type": "card",
      "description": "Display order information including order number, status, items, and total. Use for order history, tracking, and confirmation displays.",
      "componentPath": "order-card",
      "inputs": {
        "orderNumber": {
          "type": "string",
          "description": "Unique order identifier",
          "required": true
        },
        "status": {
          "type": "string",
          "description": "Order status: 'pending' for new orders, 'shipped' for in transit, 'delivered' for completed, 'cancelled' for cancelled orders",
          "required": true,
          "enum": ["pending", "shipped", "delivered", "cancelled"]
        },
        "items": {
          "type": "array",
          "description": "Array of order items (strings with item names)",
          "required": true
        },
        "total": {
          "type": "number",
          "description": "Order total amount in USD",
          "required": true
        },
        "date": {
          "type": "string",
          "description": "Order date in readable format (e.g., 'January 15, 2024')",
          "required": false
        },
        "showDetails": {
          "type": "boolean",
          "description": "Whether to show detailed item list",
          "required": false,
          "default": true
        }
      },
      "example": {
        "uid": "OrderCard",
        "data": {
          "orderNumber": "#12345",
          "status": "shipped",
          "items": ["Wireless Mouse", "USB Cable", "Laptop Stand"],
          "total": 89.97,
          "date": "January 15, 2024",
          "showDetails": true
        }
      }
    }
  ]
}
```

## Validation

UICP validates definitions and component data. Common errors:

### Missing Required Field

```json
{
  "error": "Missing required field: title"
}
```

**Fix:** Ensure AI provides all required fields.

### Invalid Enum Value

```json
{
  "error": "Invalid value for status. Must be one of: pending, shipped, delivered, cancelled"
}
```

**Fix:** Check enum values are correct.

### Type Mismatch

```json
{
  "error": "Expected number for price, got string"
}
```

**Fix:** Ensure types match definition.

## Next Steps

- [Dynamic Loading](dynamic-loading.md) - Component loading strategies
- [Validation](validation.md) - Validation in depth
- [Best Practices](best-practices.md) - Production tips

