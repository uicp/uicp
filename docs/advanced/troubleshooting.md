# Troubleshooting

Common issues and solutions for UICP.

## Components Not Rendering

### Issue: Component shows as plain text

**Symptoms:**
- UICP block appears as code in chat
- No component rendered

**Causes:**
1. Component not registered
2. UID mismatch
3. Component not exported

**Solutions:**

```typescript
// 1. Check registration
import { getRegisteredComponents } from '@uicp/parser';
console.log(getRegisteredComponents());

// 2. Verify UID matches
registerComponent('SimpleCard', SimpleCard); // Must match definitions.json uid

// 3. Check export
export function SimpleCard(props) { /* ... */ } // ✅ Named export
export default function SimpleCard(props) { /* ... */ } // ✅ Default export
```

### Issue: "Component not found" error

**Symptoms:**
- Warning message shown
- Component name in error

**Solutions:**

```typescript
// Check componentPath in definitions.json
{
  "componentPath": "simple-card" // Must match file name
}

// Check file exists at:
// /components/uicp/simple-card.tsx
// OR
// /components/uicp/simple-card/index.tsx
```

## AI Not Using Components

### Issue: AI doesn't create UICP blocks

**Symptoms:**
- AI responds with plain text only
- Never calls component tools

**Solutions:**

**1. Check tool configuration:**
```typescript
// Ensure tools are configured in API
tools: {
  get_ui_components: tool({ /* ... */ }),
  create_ui_component: tool({ /* ... */ }),
}
```

**2. Improve system prompt:**
```typescript
system: `You have access to UI components. 
Use them when appropriate to make responses more engaging.
Available tools: get_ui_components, create_ui_component`
```

**3. Be explicit in user messages:**
```
"Create a card showing this information" // ✅ Explicit
"Tell me about this" // ❌ Vague
```

**4. Check definitions file path:**
```typescript
const definitionsPath = resolve(process.cwd(), 'lib/uicp/definitions.json');
console.log('Definitions path:', definitionsPath);
console.log('Exists:', existsSync(definitionsPath));
```

### Issue: AI creates wrong component

**Symptoms:**
- Uses card when table is more appropriate
- Doesn't use best component for situation

**Solutions:**

**Improve descriptions:**
```json
{
  "description": "Display tabular data with rows and columns. IMPORTANT: Use this for any data that needs to be compared across multiple items or categories. Examples: sales reports, user lists, product comparisons."
}
```

**Add usage hints:**
```json
{
  "type": "table",
  "description": "...",
  "usage_hint": "Prefer this over cards when displaying 3+ items with similar attributes"
}
```

## Validation Errors

### Issue: "Missing required field"

**Symptoms:**
- Component creation fails
- Lists missing fields

**Solutions:**

```json
// Check definition requirements
{
  "inputs": {
    "title": {
      "required": true // Must be provided
    }
  }
}

// Ensure AI provides all required fields
// May need to improve tool description
```

### Issue: "Type mismatch"

**Symptoms:**
- Validation fails
- Wrong type error

**Solutions:**

```json
// Definition says number
"price": {
  "type": "number"
}

// But AI provides string
{ "price": "29.99" } // ❌

// Fix: Update definition description
"price": {
  "type": "number",
  "description": "Price as a number (e.g., 29.99, not '29.99')"
}
```

## Build & Runtime Errors

### Issue: Module not found

```
Error: Cannot find module '@uicp/parser'
```

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check package is installed
npm list @uicp/parser @uicp/tools
```

### Issue: TypeScript errors with JSON imports

```
Cannot find module './definitions.json'
```

**Solutions:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

```typescript
// Import with type assertion
import definitions from './definitions.json';
const parsed = parseUICPContentSync(content, definitions as any);
```

### Issue: Next.js build errors

```
Module parse failed: Unexpected token
```

**Solutions:**

```tsx
// Add 'use client' directive
'use client';

import { UICPContent } from '@uicp/parser';
```

### Issue: Dynamic import warnings

```
Critical dependency: the request of a dependency is an expression
```

**Solutions:**

This is expected for dynamic component loading. To suppress:

```typescript
// Pre-register components instead
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from './components/simple-card';

registerComponent('SimpleCard', SimpleCard);
```

## Performance Issues

### Issue: Slow parsing

**Symptoms:**
- Lag when rendering messages
- UI freezes

**Solutions:**

```typescript
// 1. Pre-register components
import '@/lib/uicp/registry';

// 2. Use sync parsing with registered components
const parsed = parseUICPContentSync(content, definitions);

// 3. Check for blocks first
if (hasUICPBlocks(content)) {
  const parsed = parseUICPContentSync(content, definitions);
}

// 4. Memoize components
export const DataTable = React.memo(DataTable);
```

### Issue: Large bundle size

**Symptoms:**
- Slow initial page load
- Large JavaScript bundle

**Solutions:**

```typescript
// 1. Code splitting
const HeavyChart = lazy(() => import('./heavy-chart'));

// 2. Dynamic imports
await parseUICPContent(content, {
  definitions,
  componentsBasePath: '/components/uicp',
});

// 3. Analyze bundle
npm run build -- --analyze
```

## API & Network Issues

### Issue: Definitions not loading

**Symptoms:**
- "Failed to load definitions" error
- Components don't work

**Solutions:**

```typescript
// 1. Check path
const path = resolve(process.cwd(), 'lib/uicp/definitions.json');
console.log('Path:', path, 'Exists:', existsSync(path));

// 2. Check permissions
// Ensure file is readable

// 3. Handle async errors
try {
  const defs = await loadDefinitions(path);
} catch (error) {
  console.error('Load error:', error);
}

// 4. Use fallback
const defs = await loadDefinitions(path).catch(() => defaultDefinitions);
```

### Issue: CORS errors with remote definitions

**Symptoms:**
- CORS error in browser
- Can't load from URL

**Solutions:**

```typescript
// 1. Add CORS headers on your server
res.setHeader('Access-Control-Allow-Origin', '*');

// 2. Use proxy in Next.js
// next.config.mjs
{
  async rewrites() {
    return [
      {
        source: '/api/definitions',
        destination: 'https://external.com/definitions.json',
      },
    ];
  },
}

// 3. Load server-side
// Load definitions in API route, not client
```

## Production Issues

### Issue: Components work in dev, not production

**Symptoms:**
- Works with `npm run dev`
- Fails with `npm run build && npm start`

**Solutions:**

```typescript
// 1. Ensure components are pre-registered
import '@/lib/uicp/registry';

// 2. Check environment variables
console.log('Env:', process.env.NODE_ENV);
console.log('Definitions:', process.env.DEFINITIONS_PATH);

// 3. Check build output
// Verify components are included in build

// 4. Test production build locally
npm run build
npm start
```

### Issue: Cache not clearing

**Symptoms:**
- Old definitions used
- Updates not applied

**Solutions:**

```typescript
// 1. Clear cache manually
import { clearDefinitionsCache, clearRegistry } from '@uicp/parser';

clearDefinitionsCache();
clearRegistry();

// 2. Reduce cache TTL in dev
const ttl = process.env.NODE_ENV === 'development' ? 0 : 3600000;

// 3. Restart server
// Cache persists during runtime
```

## Getting More Help

### Enable Debug Logging

```typescript
// Add debug logging
if (process.env.DEBUG === 'uicp') {
  console.log('UICP Debug:', {
    content,
    definitions,
    registered: getRegisteredComponents(),
  });
}
```

```bash
# Run with debug
DEBUG=uicp npm run dev
```

### Check Issues

Search GitHub issues:
- [UICP Issues](https://github.com/uicp/uicp/issues)

### Ask for Help

Open a new issue with:
- Node.js version
- Package versions
- Error messages
- Minimal reproduction
- Steps to reproduce

### Community

- GitHub Discussions
- Discord (if available)
- Stack Overflow (tag: uicp)

## Checklist

Before asking for help, verify:

- [ ] Latest package versions installed
- [ ] Components registered correctly
- [ ] Definitions.json is valid JSON
- [ ] UIDs match between definition and registration
- [ ] Component files exist at specified paths
- [ ] Tools configured in API endpoint
- [ ] Environment variables set
- [ ] No TypeScript errors
- [ ] Tried in both dev and production builds
- [ ] Checked browser console for errors
- [ ] Checked server logs for errors

## Next Steps

- [Best Practices](best-practices.md) - Avoid common issues
- [Validation](validation.md) - Understand validation
- [Error Handling](error-handling.md) - Handle errors gracefully

