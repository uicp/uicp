/**
 * Node.js-specific implementation for loading definitions from file system
 */

import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { Definitions } from './types';

export async function loadFromFileSystem(source: string): Promise<Definitions> {
  try {
    const fullPath = resolve(source);
    const content = await readFile(fullPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to read definitions from file ${source}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

