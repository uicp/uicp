/**
 * Streaming-aware UICP parser
 * 
 * This module provides utilities for parsing UICP blocks during streaming,
 * detecting potential blocks early and buffering content to prevent showing
 * raw UICP code to users.
 */

import { UICPBlock } from './types';

/**
 * State of the streaming parser
 */
export interface StreamingParserState {
  /**
   * Content that is safe to display (no incomplete UICP blocks)
   */
  displayContent: string;
  
  /**
   * Whether there's a potential UICP block being buffered
   */
  hasPendingBlock: boolean;
  
  /**
   * Whether we're currently inside a confirmed UICP block
   */
  isInUICPBlock: boolean;
  
  /**
   * Complete UICP blocks that have been parsed
   */
  completedBlocks: UICPBlock[];
  
  /**
   * Internal buffer for potential block content
   */
  buffer: string;
}

/**
 * Pattern stages for detecting UICP blocks:
 * - 'none': No potential block detected
 * - 'backtick1': Seen ` 
 * - 'backtick2': Seen ``
 * - 'backtick3': Seen ```
 * - 'u': Seen ```u
 * - 'ui': Seen ```ui
 * - 'uic': Seen ```uic
 * - 'uicp': Seen ```uicp - confirmed UICP block start
 * - 'in_block': Inside a UICP block, waiting for closing ```
 */
type PatternStage = 
  | 'none' 
  | 'backtick1' 
  | 'backtick2' 
  | 'backtick3' 
  | 'u' 
  | 'ui' 
  | 'uic' 
  | 'uicp'
  | 'in_block'
  | 'closing1'
  | 'closing2'
  | 'closing3';

/**
 * Internal state for the streaming parser
 */
interface InternalState {
  stage: PatternStage;
  buffer: string;
  displayContent: string;
  completedBlocks: UICPBlock[];
  blockContent: string;
}

/**
 * Create initial streaming parser state
 */
export function createStreamingParserState(): StreamingParserState {
  return {
    displayContent: '',
    hasPendingBlock: false,
    isInUICPBlock: false,
    completedBlocks: [],
    buffer: '',
  };
}

/**
 * Process new streaming content and return updated state
 * 
 * This function handles the detection of UICP blocks during streaming:
 * 1. Detects potential UICP block starts (even at first backtick)
 * 2. Buffers content that might be a UICP block
 * 3. Only releases content once we know it's NOT a UICP block
 * 4. Returns completed UICP blocks once they're fully received
 * 
 * @param currentState - Current parser state
 * @param newContent - New content chunk received from streaming
 * @returns Updated parser state
 */
export function processStreamingContent(
  currentState: StreamingParserState,
  fullContent: string
): StreamingParserState {
  // Work with the full content to properly track state
  const state: InternalState = {
    stage: 'none',
    buffer: '',
    displayContent: '',
    completedBlocks: [],
    blockContent: '',
  };
  
  let i = 0;
  while (i < fullContent.length) {
    const char = fullContent[i];
    
    switch (state.stage) {
      case 'none':
        if (char === '`') {
          state.stage = 'backtick1';
          state.buffer = '`';
        } else {
          state.displayContent += char;
        }
        break;
        
      case 'backtick1':
        if (char === '`') {
          state.stage = 'backtick2';
          state.buffer += char;
        } else {
          // Not a code block, release buffer
          state.displayContent += state.buffer + char;
          state.buffer = '';
          state.stage = 'none';
        }
        break;
        
      case 'backtick2':
        if (char === '`') {
          state.stage = 'backtick3';
          state.buffer += char;
        } else {
          // Inline code (``), release buffer
          state.displayContent += state.buffer + char;
          state.buffer = '';
          state.stage = 'none';
        }
        break;
        
      case 'backtick3':
        if (char === 'u') {
          state.stage = 'u';
          state.buffer += char;
        } else if (char === '`') {
          // Four backticks, keep waiting
          state.buffer += char;
        } else {
          // Some other code block (not uicp), release buffer and continue
          state.displayContent += state.buffer + char;
          state.buffer = '';
          state.stage = 'none';
        }
        break;
        
      case 'u':
        if (char === 'i') {
          state.stage = 'ui';
          state.buffer += char;
        } else {
          // Not uicp, release buffer
          state.displayContent += state.buffer + char;
          state.buffer = '';
          state.stage = 'none';
        }
        break;
        
      case 'ui':
        if (char === 'c') {
          state.stage = 'uic';
          state.buffer += char;
        } else {
          // Not uicp, release buffer
          state.displayContent += state.buffer + char;
          state.buffer = '';
          state.stage = 'none';
        }
        break;
        
      case 'uic':
        if (char === 'p') {
          state.stage = 'uicp';
          state.buffer += char;
        } else {
          // Not uicp, release buffer
          state.displayContent += state.buffer + char;
          state.buffer = '';
          state.stage = 'none';
        }
        break;
        
      case 'uicp':
        // We've confirmed it's a UICP block, now wait for newline or whitespace
        // to enter the block content
        if (char === '\n' || char === ' ' || char === '\t' || char === '\r') {
          state.stage = 'in_block';
          state.buffer = '';
          state.blockContent = '';
        } else {
          // Something like ```uicpx - not actually uicp
          state.displayContent += state.buffer + char;
          state.buffer = '';
          state.stage = 'none';
        }
        break;
        
      case 'in_block':
        if (char === '`') {
          state.stage = 'closing1';
        } else {
          state.blockContent += char;
        }
        break;
        
      case 'closing1':
        if (char === '`') {
          state.stage = 'closing2';
        } else {
          // Not closing, add backtick and char to content
          state.blockContent += '`' + char;
          state.stage = 'in_block';
        }
        break;
        
      case 'closing2':
        if (char === '`') {
          state.stage = 'closing3';
        } else {
          // Not closing, add backticks and char to content
          state.blockContent += '``' + char;
          state.stage = 'in_block';
        }
        break;
        
      case 'closing3':
        // We've found the closing ```, the block is complete
        // Try to parse the JSON content
        try {
          const trimmedContent = state.blockContent.trim();
          const parsed = JSON.parse(trimmedContent);
          
          if (parsed.uid && parsed.data) {
            state.completedBlocks.push(parsed);
            // Add a placeholder for this block
            state.displayContent += `__UICP_BLOCK_${state.completedBlocks.length - 1}__`;
          } else {
            // Invalid UICP block structure, just skip it
            console.warn('[UICP] Invalid block structure:', parsed);
          }
        } catch (error) {
          // JSON parse failed, skip this block
          console.error('[UICP] Failed to parse UICP block:', error);
        }
        
        state.blockContent = '';
        state.buffer = '';
        state.stage = 'none';
        
        // Handle the current character if it's not part of the closing
        if (char !== '`') {
          if (char === '`') {
            state.stage = 'backtick1';
            state.buffer = '`';
          } else {
            state.displayContent += char;
          }
        }
        break;
    }
    
    i++;
  }
  
  // Determine the current state for the return value
  const hasPendingBlock = state.stage !== 'none';
  const isInUICPBlock = state.stage === 'in_block' || 
                        state.stage === 'closing1' || 
                        state.stage === 'closing2' ||
                        state.stage === 'closing3';
  
  return {
    displayContent: state.displayContent,
    hasPendingBlock,
    isInUICPBlock,
    completedBlocks: state.completedBlocks,
    buffer: state.buffer + state.blockContent,
  };
}

/**
 * Check if content might contain the start of a UICP block
 * This is a quick check without full parsing
 */
export function mightContainUICPBlock(content: string): boolean {
  // Check for any backticks that could be the start of a code block
  return content.includes('`');
}

/**
 * Parse streaming content and return display-ready result
 * This is a convenience function that combines state creation and processing
 */
export function parseStreamingContent(fullContent: string): StreamingParserState {
  const initialState = createStreamingParserState();
  return processStreamingContent(initialState, fullContent);
}

