/**
 * Dynamic component loader for UICP
 */

import { ComponentType } from 'react';
import { ComponentRegistry } from './types';

/**
 * Global component registry
 */
const componentRegistry: ComponentRegistry = new Map();

/**
 * Register a component in the registry
 */
export function registerComponent(
  uid: string,
  component: ComponentType<any>
): void {
  componentRegistry.set(uid, component);
}

/**
 * Get a component from the registry
 */
export function getComponent(uid: string): ComponentType<any> | undefined {
  return componentRegistry.get(uid);
}

/**
 * Get all registered component UIDs
 */
export function getRegisteredComponents(): string[] {
  return Array.from(componentRegistry.keys());
}

/**
 * Clear a specific component or all components from the registry
 */
export function clearRegistry(uid?: string): void {
  if (uid) {
    componentRegistry.delete(uid);
  } else {
    componentRegistry.clear();
  }
}

/**
 * Load a component dynamically based on its path
 * This uses dynamic import to lazy-load components
 */
export async function loadComponent(
  uid: string,
  componentPath: string,
  basePath: string = '/components/uicp'
): Promise<ComponentType<any> | null> {
  // Check if already loaded
  const cached = getComponent(uid);
  if (cached) {
    return cached;
  }

  try {
    // Construct the full import path
    // If componentPath is absolute, use it; otherwise prepend basePath
    const fullPath = componentPath.startsWith('/')
      ? componentPath
      : `${basePath}/${componentPath}`;

    // Dynamic import - this works differently in different environments
    // In Next.js/React, this will use the bundler's dynamic import
    const module = await import(/* webpackIgnore: true */ /* @vite-ignore */ fullPath);

    // The component could be a default export or named export
    // Try to find it by common patterns
    const component =
      module.default ||
      module[uid] ||
      module[componentPath.split('/').pop()?.replace(/\.\w+$/, '') || ''] ||
      Object.values(module).find(
        (exp) => typeof exp === 'function' || typeof exp === 'object'
      );

    if (!component) {
      console.error(
        `[UICP] No valid component export found in ${fullPath}`
      );
      return null;
    }

    // Register for future use
    registerComponent(uid, component as ComponentType<any>);

    return component as ComponentType<any>;
  } catch (error) {
    console.error(
      `[UICP] Failed to load component ${uid} from ${componentPath}:`,
      error
    );
    return null;
  }
}

