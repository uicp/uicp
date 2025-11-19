# @uicp/parser Installation

Install and set up the UICP parser package for your React application.

## Installation

### npm

```bash
npm install @uicp/parser
```

### yarn

```bash
yarn add @uicp/parser
```

### pnpm

```bash
pnpm add @uicp/parser
```

## Requirements

### Peer Dependencies

- **React**: 18.0.0 or higher
- **React DOM**: 18.0.0 or higher

```bash
# If not already installed
npm install react react-dom
```

### Environment

- **Node.js**: 18+ (for development)
- **Browser**: Modern browsers with ES2020 support
- **TypeScript**: 4.5+ (optional but recommended)

## Package Information

| Property | Value |
|----------|-------|
| **Package Name** | `@uicp/parser` |
| **Size** | ~10KB gzipped |
| **Dependencies** | None (peer: React) |
| **License** | MIT |

## Verification

After installation, verify the package is available:

```typescript
import { parseUICPContent, UICPContent } from '@uicp/parser';

console.log('UICP Parser installed successfully');
```

## TypeScript Setup

If using TypeScript, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM"],
    "strict": true
  }
}
```

## Framework-Specific Setup

### Next.js

Works with both App Router and Pages Router.

**App Router:**
```tsx
// app/components/message.tsx
'use client'; // Required for components using hooks/state

import { UICPContent } from '@uicp/parser';

export function Message({ content }: { content: string }) {
  return <UICPContent content={content} definitions={...} />;
}
```

**Pages Router:**
```tsx
// components/message.tsx
import { UICPContent } from '@uicp/parser';

export function Message({ content }: { content: string }) {
  return <UICPContent content={content} definitions={...} />;
}
```

No additional Next.js configuration required.

### Create React App

```bash
npx create-react-app my-app --template typescript
cd my-app
npm install @uicp/parser
```

Import and use anywhere in your components.

### Vite

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install @uicp/parser
```

Works out of the box.

### Remix

```bash
npx create-remix@latest my-app
cd my-app
npm install @uicp/parser
```

Use in route components (may need `'use client'` depending on configuration).

## Import Patterns

### Named Imports (Recommended)

```typescript
import { 
  UICPContent,
  useUICPParser,
  parseUICPContent,
  registerComponent,
} from '@uicp/parser';
```

### Type Imports

```typescript
import type {
  UICPBlock,
  ParsedContent,
  ComponentDefinition,
  Definitions,
} from '@uicp/parser';
```

### Default Import

Not supported - use named imports.

## Optional Dependencies

While @uicp/parser has no required dependencies, you may want:

### For Text Rendering

```bash
npm install react-markdown
```

```tsx
import ReactMarkdown from 'react-markdown';

<UICPContent
  content={content}
  definitions={definitions}
  textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
/>
```

### For Styling

Your choice of CSS framework:

```bash
# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Material-UI
npm install @mui/material @emotion/react @emotion/styled

# Chakra UI
npm install @chakra-ui/react @emotion/react @emotion/styled
```

## Troubleshooting Installation

### Issue: Module not found

```
Error: Cannot find module '@uicp/parser'
```

**Solution:**
1. Verify installation: `npm list @uicp/parser`
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check package.json includes the dependency

### Issue: React version mismatch

```
npm ERR! peer dep missing: react@>=18.0.0
```

**Solution:**
```bash
npm install react@18 react-dom@18
```

### Issue: TypeScript errors

```
Could not find a declaration file for module '@uicp/parser'
```

**Solution:**
The package includes TypeScript definitions. If errors persist:
1. Restart your TypeScript server
2. Delete `node_modules` and reinstall
3. Check `node_modules/@uicp/parser/dist/index.d.ts` exists

### Issue: Import errors in Next.js

```
Error: Cannot use import statement outside a module
```

**Solution:**
Add `'use client'` directive to components using @uicp/parser:

```tsx
'use client';

import { UICPContent } from '@uicp/parser';
```

### Issue: Build errors

```
Module parse failed: Unexpected token
```

**Solution:**
Ensure your bundler is configured for modern JavaScript:

**Webpack:**
```javascript
module: {
  rules: [
    {
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    },
  ],
}
```

**Vite:**
Usually works by default. Check `vite.config.ts` if issues persist.

## Updating

### Check Current Version

```bash
npm list @uicp/parser
```

### Update to Latest

```bash
npm update @uicp/parser
```

### Update to Specific Version

```bash
npm install @uicp/parser@1.2.3
```

### Check for Breaking Changes

Before updating, review:
- [CHANGELOG](https://github.com/uicp/uicp/blob/main/CHANGELOG.md)
- [Migration Guide](https://github.com/uicp/uicp/blob/main/MIGRATION.md)

## Development Setup

### Local Development

If contributing or testing locally:

```bash
# Clone repository
git clone https://github.com/uicp/uicp.git
cd uicp/packages/parser

# Install dependencies
npm install

# Build package
npm run build

# Link for local testing
npm link
```

In your test project:

```bash
npm link @uicp/parser
```

### Watch Mode

For development with auto-rebuild:

```bash
cd packages/parser
npm run dev
```

## Uninstalling

To remove the package:

```bash
npm uninstall @uicp/parser
```

Remove any imports and related code from your project.

## Next Steps

- [API Reference](api-reference.md) - Learn the API
- [React Components](react-components.md) - Use React components
- [Hooks](hooks.md) - Use React hooks
- [Overview](overview.md) - Understand the package

## Getting Help

If installation issues persist:

1. Check [Troubleshooting Guide](../../advanced/troubleshooting.md)
2. Search [GitHub Issues](https://github.com/uicp/uicp/issues)
3. Open a new issue with:
   - Node version: `node --version`
   - npm version: `npm --version`
   - React version: Check package.json
   - Error messages
   - Steps to reproduce

