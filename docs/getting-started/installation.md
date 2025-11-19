# Installation

Get started with UICP by installing the necessary packages for your project.

## Prerequisites

Before installing UICP, ensure you have:

- **Node.js** 18 or higher
- **React** 18 or higher (for frontend components)
- **TypeScript** (recommended for type safety)
- An existing chat application or a new project

## Package Overview

UICP consists of two main packages:

| Package | Purpose | Where to Install |
|---------|---------|------------------|
| `@uicp/parser` | Parse and render UICP blocks | Frontend (React app) |
| `@uicp/tools` | AI tools for component discovery | Backend (API/Server) |

You'll typically install **both** packages in your project, but in different contexts.

## Installation Steps

### 1. Install Packages

#### For Full-Stack Applications (Recommended)

If your project has both frontend and backend in one repository:

```bash
npm install @uicp/parser @uicp/tools
```

#### For Separate Frontend/Backend

**Frontend (React app):**
```bash
npm install @uicp/parser
```

**Backend (API server):**
```bash
npm install @uicp/tools
```

### 2. TypeScript Configuration (Optional but Recommended)

If using TypeScript, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM"]
  }
}
```

This allows importing JSON files (for definitions) and ensures proper type resolution.

### 3. Verify Installation

Check that packages are installed correctly:

```bash
npm list @uicp/parser @uicp/tools
```

You should see both packages in the output with their versions.

## Framework-Specific Setup

### Next.js

UICP works seamlessly with Next.js App Router and Pages Router.

**Additional setup:**
```javascript
// next.config.mjs
const nextConfig = {
  // No special configuration needed
};

export default nextConfig;
```

**For App Router:**
- Use `'use client'` directive in components that use UICP parser
- Backend tools work in Route Handlers (`app/api/*/route.ts`)

**For Pages Router:**
- Backend tools work in API routes (`pages/api/*.ts`)
- Parser works in any React component

### Create React App

```bash
npx create-react-app my-app --template typescript
cd my-app
npm install @uicp/parser @uicp/tools
```

No additional configuration needed.

### Vite

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install @uicp/parser @uicp/tools
```

Vite works with UICP out of the box.

### Remix

```bash
npx create-remix@latest my-app
cd my-app
npm install @uicp/parser @uicp/tools
```

- Use tools in loaders/actions
- Parser works in route components with `'use client'` if needed

## Dependency Information

### Required Dependencies

Both packages have minimal dependencies:

**@uicp/parser:**
- React 18+
- No additional dependencies

**@uicp/tools:**
- Node.js fs module (for file loading)
- No additional dependencies

### Peer Dependencies

```json
{
  "react": ">=18.0.0"
}
```

### Optional Dependencies

For enhanced functionality, you might want:

- `react-markdown`: For rendering text content
- `zod`: For additional validation (if using custom schemas)
- Your UI library of choice (Tailwind, MUI, etc.)

## Development vs Production

### Development

In development, you can use dynamic component loading:

```typescript
const parsed = await parseUICPContent(content, {
  definitions: './lib/uicp/definitions.json',
  componentsBasePath: '/components/uicp',
});
```

### Production

For production, pre-register components for better performance:

```typescript
// Register components at app startup
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from './components/uicp/simple-card';
import { DataTable } from './components/uicp/data-table';

registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);
```

## Monorepo Setup

If using a monorepo (Nx, Turborepo, etc.):

```bash
# In workspace root
npm install @uicp/parser @uicp/tools

# Or in specific packages
cd apps/web && npm install @uicp/parser
cd apps/api && npm install @uicp/tools
```

### Workspace Configuration

**For npm workspaces:**
```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

**For pnpm:**
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## Local Development

If you want to contribute or test UICP locally:

```bash
# Clone the repository
git clone https://github.com/uicp/uicp.git
cd uicp

# Install dependencies
npm install

# Build packages
npm run build

# Link for local testing
cd packages/parser && npm link
cd packages/tools && npm link

# In your test project
npm link @uicp/parser @uicp/tools
```

## Verification

After installation, verify everything works:

### Test Backend Tools

```typescript
// test.js
import { getUIComponents } from '@uicp/tools';

const definitions = {
  version: "1.0.0",
  components: []
};

const result = await getUIComponents(definitions);
console.log('Backend tools working:', result.success);
```

Run: `node test.js`

### Test Frontend Parser

```tsx
// Test.tsx
import { hasUICPBlocks } from '@uicp/parser';

function Test() {
  const content = '```uicp\n{"uid":"Test","data":{}}\n```';
  const hasBlocks = hasUICPBlocks(content);
  
  return <div>Parser working: {hasBlocks ? 'Yes' : 'No'}</div>;
}
```

## Common Installation Issues

### Issue: Module not found

**Solution:** Ensure you're importing from the correct package:
```typescript
// Backend
import { getUIComponents } from '@uicp/tools';

// Frontend
import { parseUICPContent } from '@uicp/parser';
```

### Issue: TypeScript errors with JSON imports

**Solution:** Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

### Issue: React version mismatch

**Solution:** Ensure React 18+:
```bash
npm install react@18 react-dom@18
```

### Issue: Build errors in Next.js

**Solution:** Ensure using correct directives:
```tsx
'use client'; // For components using UICP parser

// For API routes, no directive needed
```

## Updating Packages

To update to the latest versions:

```bash
npm update @uicp/parser @uicp/tools
```

Or install specific versions:

```bash
npm install @uicp/parser@latest @uicp/tools@latest
```

Check for breaking changes in the [CHANGELOG](https://github.com/uicp/uicp/blob/main/CHANGELOG.md).

## Uninstalling

To remove UICP packages:

```bash
npm uninstall @uicp/parser @uicp/tools
```

Remove any UICP-related code and configuration files.

## Next Steps

Now that you have UICP installed:

- Follow the [Quick Start](quick-start.md) guide
- Create [Your First Component](first-component.md)
- Read the [Integration Guide](integration-guide.md)

## Getting Help

If you encounter installation issues:

- Check the [Troubleshooting Guide](../advanced/troubleshooting.md)
- Search [GitHub Issues](https://github.com/uicp/uicp/issues)
- Open a new issue with:
  - Node.js version (`node --version`)
  - Package manager version (`npm --version`)
  - Error messages
  - Steps to reproduce

