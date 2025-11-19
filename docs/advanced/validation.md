# Validation

UICP validates component data at multiple stages to ensure correctness.

## Validation Stages

### 1. Definition Validation

Validates the definitions file structure.

**Checks:**
- Valid JSON syntax
- Required fields present
- Correct field types
- Valid input schemas

### 2. Block Validation

Validates UICP blocks against component definitions.

```typescript
import { validateUICPBlock } from '@uicp/parser';

const { valid, errors } = validateUICPBlock(block, definitions);

if (!valid) {
  console.error('Validation errors:', errors);
}
```

**Checks:**
- Component exists
- Required fields provided
- Types match schema
- Enum values are valid

### 3. Runtime Validation

Validates during component rendering.

**Checks:**
- Component can be loaded
- Props match TypeScript interface
- No runtime errors

## Validation Examples

### Required Field Missing

```typescript
// Definition requires 'title'
{ "uid": "SimpleCard", "data": { "content": "Hello" } }
// ❌ Error: Missing required field: title
```

### Type Mismatch

```typescript
// Definition expects number for 'price'
{ "uid": "ProductCard", "data": { "price": "99.99" } }
// ❌ Error: Expected number for price, got string
```

### Invalid Enum

```typescript
// Definition enum: ["success", "error", "warning"]
{ "uid": "Alert", "data": { "type": "invalid" } }
// ❌ Error: Invalid value for type
```

## Custom Validation

Add validation in your components:

```typescript
export function MyComponent({ value }: { value: number }) {
  if (value < 0 || value > 100) {
    return <div>Error: Value must be 0-100</div>;
  }
  
  return <div>{value}%</div>;
}
```

## Error Messages

UICP provides clear error messages:

```typescript
{
  "success": false,
  "error": "Component 'UnknownCard' not found",
  "available_components": ["SimpleCard", "DataTable"]
}
```

## Best Practices

1. Define clear schemas in definitions
2. Use TypeScript for prop validation
3. Add runtime checks for business logic
4. Provide helpful error messages
5. Test validation with invalid data

## Next Steps

- [Error Handling](error-handling.md) - Handle errors gracefully
- [Component Definitions](component-definitions.md) - Define schemas
- [Best Practices](best-practices.md) - Production tips

