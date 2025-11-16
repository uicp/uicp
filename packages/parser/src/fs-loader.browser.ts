/**
 * Browser-specific implementation for loading definitions
 */

import { Definitions } from './types';

export async function loadFromFileSystem(source: string): Promise<Definitions> {
  // Browser environment - try to fetch as relative URL
  try {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    throw new Error(
      `Failed to load definitions from ${source}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

