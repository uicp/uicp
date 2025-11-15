# Publishing UICP Packages to npm

## ✅ Pre-Publishing Checklist

Both packages are ready to publish:
- ✅ Package names: `@uicp/parser` and `@uicp/tools`
- ✅ Version: 0.1.0
- ✅ Repository URLs configured
- ✅ Build artifacts exist in dist/ folders
- ✅ README files present
- ✅ Keywords for discoverability
- ✅ MIT License

## 📦 Publishing Steps

### 1. Login to npm

First, make sure you're logged in to npm with access to the `uicp` organization:

```bash
npm login
```

Enter your npm credentials. After logging in, verify:

```bash
npm whoami
```

### 2. Publish @uicp/parser

```bash
cd C:\repos\uicp\packages\parser
npm publish --access public
```

This will:
- Upload the package to npm
- Make it available at https://www.npmjs.com/package/@uicp/parser
- Allow anyone to install with `npm install @uicp/parser`

### 3. Publish @uicp/tools

```bash
cd C:\repos\uicp\packages\tools
npm publish --access public
```

This will:
- Upload the package to npm
- Make it available at https://www.npmjs.com/package/@uicp/tools
- Allow anyone to install with `npm install @uicp/tools`

### 4. Verify Publication

Check that packages are published:
- Visit https://www.npmjs.com/package/@uicp/parser
- Visit https://www.npmjs.com/package/@uicp/tools

Or test installation:

```bash
npm info @uicp/parser
npm info @uicp/tools
```

## 🏷️ Create GitHub Release Tag

After publishing, tag the release in git:

```bash
cd C:\repos\uicp
git tag v0.1.0
git push origin v0.1.0
```

Or create a GitHub release with notes:
- Go to https://github.com/uicp/uicp/releases/new
- Tag: `v0.1.0`
- Title: `v0.1.0 - Initial Release`
- Description: Add release notes

## 📝 Release Notes Template

```markdown
# v0.1.0 - Initial Release

## 🎉 First Release

UICP (UI Component Protocol) enables LLM-based agents to describe and render UI components dynamically.

### Packages

- **@uicp/parser** - Core parsing library for extracting and rendering UICP blocks
- **@uicp/tools** - Framework-agnostic AI tools for component discovery and creation

### Features

- ✨ Dynamic component loading with configurable paths
- 🔧 Framework-agnostic tools that work with any LLM
- 📦 TypeScript support with full type definitions
- 🚀 Ready-to-use Next.js example application
- 📚 Comprehensive documentation

### Installation

```bash
npm install @uicp/parser @uicp/tools
```

### Documentation

- [Main README](https://github.com/uicp/uicp#readme)
- [Parser Documentation](https://github.com/uicp/uicp/tree/main/packages/parser#readme)
- [Tools Documentation](https://github.com/uicp/uicp/tree/main/packages/tools#readme)
- [Example App](https://github.com/uicp/uicp/tree/main/examples/nextjs-chat#readme)
```

## 🔄 Future Updates

To publish updates:

1. Make changes
2. Update version:
   ```bash
   cd packages/parser
   npm version patch  # 0.1.0 → 0.1.1
   # or: npm version minor  # 0.1.0 → 0.2.0
   # or: npm version major  # 0.1.0 → 1.0.0
   ```
3. Build and publish:
   ```bash
   npm run build
   npm publish
   ```
4. Commit and tag:
   ```bash
   git add .
   git commit -m "Release v0.1.1"
   git tag v0.1.1
   git push origin main --tags
   ```

## ⚠️ Important Notes

- **--access public** is required for scoped packages (@uicp/*) in the free tier
- Make sure builds are complete before publishing (dist/ folders must exist)
- Test packages locally first: `npm pack` creates a tarball you can test
- You can unpublish within 72 hours if needed: `npm unpublish @uicp/parser@0.1.0`
- After 72 hours, you can only deprecate: `npm deprecate @uicp/parser@0.1.0 "reason"`

## 🧪 Test Before Publishing (Optional)

Create a test tarball:

```bash
cd packages/parser
npm pack
# This creates uicp-parser-0.1.0.tgz

# Test install in another project
npm install /path/to/uicp-parser-0.1.0.tgz
```

