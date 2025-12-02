/**
 * Ready-to-use React components for UICP rendering
 */

import React, { ReactNode, useEffect, useState, useMemo, useRef } from 'react';
import { Definitions } from './types';
import { renderUICPBlock } from './parser';
import { loadDefinitionsWithCache } from './definitions-loader';
import { parseStreamingContent } from './streaming-parser';

/**
 * CSS keyframes for spinner animation (injected once)
 */
let spinnerStylesInjected = false;

function injectSpinnerStyles() {
  if (spinnerStylesInjected || typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes uicp-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  spinnerStylesInjected = true;
}

/**
 * Simple loading spinner - just a spinner, left-justified
 */
function DefaultLoadingSpinner() {
  return React.createElement('div', {
    className: 'uicp-spinner',
    style: {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(156, 163, 175, 0.3)',
      borderTopColor: 'rgb(156, 163, 175)',
      borderRadius: '50%',
      animation: 'uicp-spin 0.8s linear infinite',
      marginTop: '4px',
    },
  });
}

/**
 * Props for UICPContent component
 */
export interface UICPContentProps {
  /**
   * Content to parse and render (may contain UICP blocks)
   */
  content: string;
  
  /**
   * Component definitions
   */
  definitions: string | Definitions;
  
  /**
   * Base path for component imports
   * @default '/components/uicp'
   */
  componentsBasePath?: string;
  
  /**
   * Custom renderer for text content
   * @default renders as plain div
   */
  textRenderer?: (text: string) => ReactNode;
  
  /**
   * Custom wrapper for component items
   * @default renders components directly
   */
  componentWrapper?: (component: React.ReactElement) => ReactNode;
  
  /**
   * Custom loading spinner to show while UICP block is streaming
   * @default shows a simple spinner
   */
  loadingSpinner?: ReactNode;
}

/**
 * Component for rendering UICP content with streaming support
 * 
 * Automatically handles:
 * - Parsing UICP blocks (detecting them early during streaming)
 * - Loading components dynamically
 * - Rendering mixed text/component content
 * - Showing a spinner while UICP blocks stream in (never shows raw code)
 * - Auto-detecting when streaming stops (no need to pass isStreaming prop)
 * 
 * @example
 * ```tsx
 * import { UICPContent } from '@uicp/parser';
 * 
 * function Message({ content }) {
 *   return (
 *     <UICPContent
 *       content={content}
 *       definitions={definitions}
 *       textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
 *     />
 *   );
 * }
 * ```
 */
export function UICPContent({
  content,
  definitions,
  componentsBasePath = '/components/uicp',
  textRenderer,
  componentWrapper,
  loadingSpinner,
}: UICPContentProps) {
  const [loadedDefinitions, setLoadedDefinitions] = useState<Definitions | null>(
    typeof definitions === 'object' ? definitions : null
  );
  
  // Track whether content is actively streaming
  // We consider it "streaming" if content changed within the last 150ms
  const [isStreaming, setIsStreaming] = useState(false);
  const lastContentRef = useRef(content);
  const streamingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Inject spinner styles on mount
  useEffect(() => {
    injectSpinnerStyles();
  }, []);
  
  // Auto-detect streaming by tracking content changes
  useEffect(() => {
    if (content !== lastContentRef.current) {
      // Content changed - we're streaming
      lastContentRef.current = content;
      setIsStreaming(true);
      
      // Clear any existing timeout
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
      
      // Set a timeout to mark streaming as complete
      // If no new content arrives within 150ms, assume streaming stopped
      streamingTimeoutRef.current = setTimeout(() => {
        setIsStreaming(false);
      }, 150);
    }
    
    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, [content]);
  
  // Load definitions if provided as string
  useEffect(() => {
    let mounted = true;
    
    if (typeof definitions === 'string') {
      loadDefinitionsWithCache(definitions).then((defs) => {
        if (mounted) {
          setLoadedDefinitions(defs);
        }
      });
    } else {
      setLoadedDefinitions(definitions);
    }
    
    return () => {
      mounted = false;
    };
  }, [definitions]);
  
  // Parse the streaming content
  const parserState = useMemo(() => {
    return parseStreamingContent(content);
  }, [content]);
  
  // Build the rendered content
  const renderedContent = useMemo(() => {
    const result: ReactNode[] = [];
    const defaultTextRenderer = (text: string) => React.createElement('div', null, text);
    const textRenderFn = textRenderer || defaultTextRenderer;
    const defaultComponentWrapper = (comp: React.ReactElement) => comp;
    const componentWrapperFn = componentWrapper || defaultComponentWrapper;
    
    // Split display content by placeholders
    const parts = parserState.displayContent.split(/(__UICP_BLOCK_\d+__)/);
    
    parts.forEach((part, index) => {
      const placeholderMatch = part.match(/__UICP_BLOCK_(\d+)__/);
      
      if (placeholderMatch) {
        const blockIndex = parseInt(placeholderMatch[1], 10);
        const block = parserState.completedBlocks[blockIndex];
        
        if (block && loadedDefinitions) {
          const component = renderUICPBlock(
            block,
            loadedDefinitions,
            `component-${blockIndex}`
          );
          if (component) {
            result.push(
              React.createElement(
                React.Fragment,
                { key: `component-${blockIndex}` },
                componentWrapperFn(component)
              )
            );
          }
        }
      } else if (part.trim()) {
        result.push(
          React.createElement(
            React.Fragment,
            { key: `text-${index}` },
            textRenderFn(part)
          )
        );
      }
    });
    
    // Show loading spinner if we're in a UICP block and content is actively streaming
    if (isStreaming && (parserState.isInUICPBlock || parserState.hasPendingBlock)) {
      const spinner = loadingSpinner || React.createElement(DefaultLoadingSpinner, null);
      result.push(
        React.createElement(
          React.Fragment,
          { key: 'loading-spinner' },
          spinner
        )
      );
    }
    
    return result;
  }, [
    parserState,
    loadedDefinitions,
    textRenderer,
    componentWrapper,
    loadingSpinner,
    isStreaming,
  ]);
  
  return React.createElement(React.Fragment, null, ...renderedContent);
}

/**
 * Props for UICPProvider
 */
export interface UICPProviderProps {
  /**
   * Component definitions
   */
  definitions: string | Definitions;
  
  /**
   * Base path for component imports
   * @default '/components/uicp'
   */
  componentsBasePath?: string;
  
  /**
   * Child components
   */
  children: ReactNode;
}

const UICPContext = React.createContext<{
  definitions: string | Definitions;
  componentsBasePath: string;
} | null>(null);

/**
 * Provider component for UICP configuration
 * 
 * Wrap your app or chat section with this to provide config to all UICPContent components
 * 
 * @example
 * ```tsx
 * <UICPProvider 
 *   definitions="/lib/uicp/definitions.json"
 *   componentsBasePath="/components/uicp"
 * >
 *   <ChatInterface />
 * </UICPProvider>
 * ```
 */
export function UICPProvider({ 
  definitions, 
  componentsBasePath = '/components/uicp', 
  children 
}: UICPProviderProps) {
  const value = React.useMemo(
    () => ({ definitions, componentsBasePath }),
    [definitions, componentsBasePath]
  );
  
  return (
    <UICPContext.Provider value={value}>
      {children}
    </UICPContext.Provider>
  );
}

/**
 * Hook to access UICP context
 */
export function useUICPContext() {
  const context = React.useContext(UICPContext);
  if (!context) {
    throw new Error('useUICPContext must be used within a UICPProvider');
  }
  return context;
}
