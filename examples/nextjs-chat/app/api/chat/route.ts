import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getUIComponents, createUIComponent } from '@uicp/tools';
import { resolve } from 'path';

// Get the path to definitions.json
const definitionsPath = resolve(
  process.cwd(),
  'lib/uicp/definitions.json'
);

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL || 'gpt-4o'),
    system: `You are a helpful AI assistant that can create rich UI components using UICP (User Interface Context Protocol).

CRITICAL INSTRUCTION:
After using ANY tools, you MUST provide a natural language response to the user.
NEVER finish without writing a text response.

Tool Usage Pattern:
1. FIRST: Always call get_ui_components to check what visual components are available
2. Use other tools to gather information if needed
3. If a component fits, call create_ui_component
4. ALWAYS write your final text response to the user

UICP (User Interface Context Protocol) - MANDATORY WORKFLOW:

RULE: Before preparing ANY response, you MUST call get_ui_components to check for visual components.

Full workflow:

STEP 1 (MANDATORY): Call get_ui_components
        - You can filter by type (e.g. "card", "table") or leave empty to see all
        - This shows you what visual components are available

STEP 2 (IF COMPONENT AVAILABLE): If you found a matching component in step 1:
        - Call create_ui_component with:
          * uid: the component identifier (e.g. "SimpleCard", "DataTable")
          * data: object with all required fields from the schema
        - This returns a "uicp_block" string

STEP 3 (MANDATORY): Write your final text response:
        - Include friendly text
        - If you created a component, paste the ENTIRE uicp_block in your response
        - You MUST respond with text - tool calls alone are not enough!

Available component types:
- SimpleCard: For displaying information in a card format
- DataTable: For showing tabular data

Example: User asks "Show me a card with my info"
1. Call get_ui_components → find "SimpleCard"
2. Call create_ui_component with data → get uicp_block
3. Write: "Here's your card: [paste uicp_block] Let me know if you need changes!"

REMEMBER: Always check for components first, always respond with text!`,
    messages,
    maxSteps: 10,
    tools: {
      get_ui_components: tool({
        description: `Discover available UI components. Use this to find out what components you can use and their schemas.`,
        parameters: z.object({
          component_type: z
            .string()
            .optional()
            .describe('Filter by type (e.g., "card", "table")'),
          uid: z
            .string()
            .optional()
            .describe('Get specific component by UID'),
        }),
        execute: async ({ component_type, uid }) => {
          return await getUIComponents(definitionsPath, {
            component_type,
            uid,
          });
        },
      }),
      create_ui_component: tool({
        description: `Create a UICP block for rendering a UI component. First use get_ui_components to discover available components and their schemas.`,
        parameters: z.object({
          uid: z.string().describe('Component UID (e.g., "SimpleCard")'),
          data: z
            .record(z.any())
            .describe('Component data with all required fields'),
        }),
        execute: async ({ uid, data }) => {
          return await createUIComponent(definitionsPath, { uid, data });
        },
      }),
    },
    experimental_continueSteps: true,
  });

  return result.toDataStreamResponse();
}

