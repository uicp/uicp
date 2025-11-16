import { defineConfig } from 'tsup';
import type { Plugin } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin to replace fs-loader imports with browser version
const browserLoaderPlugin: Plugin = {
  name: 'browser-loader',
  setup(build) {
    build.onResolve({ filter: /\.\/fs-loader\.nodejs$/ }, () => {
      const browserPath = path.resolve(__dirname, 'src/fs-loader.browser.ts');
      return { path: browserPath, external: false };
    });
  },
};

export default defineConfig([
  // Node.js build
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: true,
    external: ['fs/promises', 'path', 'fs', 'node:fs/promises', 'node:path', 'node:fs'],
    treeshake: true,
    platform: 'node',
    outDir: 'dist',
  },
  // Browser build
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: false, // Don't regenerate types for browser build
    clean: false,
    splitting: false,
    sourcemap: true,
    treeshake: true,
    platform: 'browser',
    outDir: 'dist/browser',
    esbuildPlugins: [browserLoaderPlugin],
  },
]);

