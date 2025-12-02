/**
 * UICP Parser - Extract and render UI components from LLM output
 * @module @uicp/parser
 */

// Export types
export type {
  UICPBlock,
  ParsedContent,
  ComponentDefinition,
  InputSchema,
  Definitions,
  ParserConfig,
  ValidationResult,
  ComponentRegistry,
} from './types';

// Export parser functions
export {
  extractUICPBlocks,
  renderUICPBlock,
  parseUICPContent,
  parseUICPContentSync,
  hasUICPBlocks,
} from './parser';

// Export validation functions
export { validateUICPBlock } from './validator';

// Export loader functions
export {
  registerComponent,
  getComponent,
  getRegisteredComponents,
  clearRegistry,
  loadComponent,
} from './loader';

// Export definitions loader
export {
  loadDefinitions,
  loadDefinitionsWithCache,
  clearDefinitionsCache,
} from './definitions-loader';

// ========================================
// SIMPLIFIED API (Recommended)
// ========================================

// Export React hook
export {
  useUICPParser,
  type UseUICPParserConfig,
  type UseUICPParserResult,
} from './react-hook';

// Export React components
export {
  UICPContent,
  UICPProvider,
  useUICPContext,
  type UICPContentProps,
  type UICPProviderProps,
} from './react-components';

// Export streaming parser utilities
export {
  parseStreamingContent,
  processStreamingContent,
  createStreamingParserState,
  mightContainUICPBlock,
  type StreamingParserState,
} from './streaming-parser';

