/**
 * Utilities for loading component definitions from various sources
 */

import { Definitions } from './types';
import { loadFromFileSystem } from './fs-loader';

/**
 * Load definitions from a URI (URL or file path) or return object directly
 */
export async function loadDefinitions(
  source: string | Definitions
): Promise<Definitions> {
  // If it's already an object, return it
  if (typeof source === 'object') {
    return source;
  }

  // If it's a URL, fetch it
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch definitions from ${source}: ${response.statusText}`
      );
    }
    return response.json();
  }

  // For file paths, use platform-specific loader
  return loadFromFileSystem(source);
}

/**
 * Simple in-memory cache for definitions
 */
const definitionsCache = new Map<string, { data: Definitions; timestamp: number }>();

/**
 * Default cache TTL (5 minutes)
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Load definitions with caching
 */
export async function loadDefinitionsWithCache(
  source: string | Definitions,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<Definitions> {
  // If it's an object, don't cache
  if (typeof source === 'object') {
    return source;
  }

  // Check cache
  const cached = definitionsCache.get(source);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  // Load fresh data
  const data = await loadDefinitions(source);

  // Store in cache
  definitionsCache.set(source, { data, timestamp: Date.now() });

  return data;
}

/**
 * Clear the definitions cache
 */
export function clearDefinitionsCache(source?: string): void {
  if (source) {
    definitionsCache.delete(source);
  } else {
    definitionsCache.clear();
  }
}

