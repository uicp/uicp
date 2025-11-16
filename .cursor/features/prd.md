The following is a PRD for UICP packages monorepo. We will be publishing under @uicp npm org and hosting the repo in the UICP GitHub organization.

Please refer to the uicp-ai-sdk-chat application that we've added to this Cursor workspace for reference on how the code works. Check the lib/uicp folder for main files and README that explains the core principles and code patterns for UICP. Use those and the PRD below to construct the uicp monorepo project.

UICP Node Packages PRD
Overview

The UICP (UI Context Protocol) project aims to enable LLM-based agents to describe and render UI components dynamically. We will create a monorepo (GitHub org: uicp) containing multiple Node.js packages under the @uicp NPM scope. The focus is on Node/TypeScript packages (no Python in this phase), providing the core parsing logic and integration tools for UICP. We will also include a minimal Next.js example application to demonstrate usage. The design will prioritize flexibility (allowing applications to supply their own component definitions), concise implementation, and adherence to patterns from popular open-source Node packages.

Monorepo Structure

We will organize the repository as a monorepo using npm/yarn workspaces (or similar) with the following structure:

uicp/               (root of the monorepo)
├── packages/
│   ├── parser/     (UICP core parsing library)
│   └── agent/      (UICP agent integration tools)
└── examples/
    └── nextjs-chat/ (Example Next.js app demonstrating UICP)


packages/: Contains the two publishable packages (@uicp/parser and @uicp/agent). Each will have its own package.json, source in src/, and a minimal README.

examples/: Contains a sample project (not published to NPM) illustrating how to use the UICP packages in a real scenario. Including example apps in the repo is a common practice in popular projects (e.g., Material-UI's GitHub has an /examples folder with integration demos
mui.com
). We will ensure the example code is excluded from the NPM packages to avoid unnecessary bulk, as is standard (packages often exclude example directories from distribution
stackoverflow.com
).

We will use a workspace tool (npm/Yarn Workspaces or Turborepo) to link packages for local development. This allows developing the packages and example app in one repo, ensuring consistency.

Packages
1. @uicp/parser (UICP Core Parser)

Description: The core library responsible for parsing an LLM's output (which describes UI components) into a structured format. It uses a component definitions data source (a JSON describing available UI components and their props) as the schema for parsing. This package does not include any specific UI component implementations — it is framework-agnostic. Its job is purely to interpret and validate the agent's UI instructions against the definitions.

Key Responsibilities and Features:

Parse UI Instructions: Provide a function (e.g. parseComponents(text: string)) that takes a string or data from the LLM and returns a structured representation (e.g. a JSON object or AST) of UI components. The parser will:

Identify component names and props in the LLM output (exact format of the output to be decided – could be JSON, XML-like, or a custom syntax – but the parser should be designed to be flexible or easily adjustable to the chosen format).

Validate that each component name and its properties match the entries in the provided definitions. No unknown component or prop should pass through.

Return a data structure (likely a JavaScript object) representing the UI layout, which can later be used to render the actual UI.

Definitions Data Handling: The parser should not hard-code any component definitions internally. Instead, it will be configured with an external definitions JSON (the "single source of truth" for components):

Provide a way to load or set the definitions. For example, an initialization function or option to specify the source of definitions (e.g. Parser.loadDefinitions(uriOrPath) or passing the definitions object into parseComponents). This source could be a URL (for projects that host the JSON via an API) or a file path (for local projects). We want flexibility here, since different architectures will handle the definitions differently (Next.js can serve it via API, an Electron app might load from disk, etc.).

The package should handle fetching or reading the definitions from the given URI/path, or accept a definitions object directly. (For example, if a URL is provided, use fetch or Node's http to retrieve JSON; if a file path, read the file from disk; if an object is passed, use it as-is.)

Ensure that both this parser and other packages can use the same definitions configuration easily (to avoid duplication, perhaps expose a helper or just require the user to pass the same config to each).

No Built-in Components: We will not ship a library of UI components inside the parser. The parser only knows about what’s in the definitions. This keeps it generic. (We may include one very simple component definition as an example or for testing, but it will be purely for demo and likely located in the example project rather than the package code.)

Minimal Dependencies & Implementation: Keep the parser implementation lightweight. Use well-known packages if needed (for example, a parsing library or JSON schema validator, etc.), but avoid heavy or unnecessary dependencies. Favor straightforward code for maintainability.

TypeScript Implementation: Write in TypeScript to provide type definitions for component structures and parsed results. This will help developers using the package to know the shape of the output and the expected input types.

Testing: Include unit tests for the parser (e.g., given a sample definitions set and a sample input string, does it produce the correct structured output or errors). Focus on the critical parsing logic.

Documentation (minimal): The package README should briefly describe what it does and show a very simple usage example. For instance:

How to import and initialize the parser with a definitions source.

How to parse a string into a component JSON.

Keep this concise – just enough for someone to get started. (Avoid overly verbose descriptions; assume the user has basic context.)

Release: Prepare @uicp/parser for publishing to NPM. Use semantic versioning (start with 0.1.0 or 1.0.0 depending on maturity). Ensure the package.json has proper fields (name, description, repository, author, license, files include/exclude where necessary – e.g., exclude tests and types of dev-only files, include dist if bundling). We will likely publish as public (unscoped or scoped as @uicp/parser if the org is set up).

2. @uicp/agent (UICP Agent Integration Tools)

Description: A library to facilitate integration of UICP into an LLM-driven agent or application backend. This package will provide utilities and patterns to use the parser in an interactive setting (like a chat agent), and to prepare the LLM with the necessary context about available UI components. It acts as a bridge between the raw LLM and the UI parser, making it easier for developers to incorporate UICP.

Key Responsibilities and Features:

Definitions Loading: Similar to the parser package, this should allow configuration of the component definitions data. In fact, both packages should share a consistent way to specify the definitions source (to ensure they're using the same data). For example, if the parser has a loadDefinitions function, the agent package might either reuse it or have its own that ultimately calls the same logic. The goal is to make it easy to initialize the whole system with a single reference to the definitions JSON (whether a path or URL).

Prompt Generation for LLM: Provide a utility to generate a prompt or system message for the LLM that describes the UI component definitions. For instance, a function like createSystemPrompt(definitions) that returns a string explaining what components the LLM can use and the format to use them. This will help guide the model to output valid UICP instructions. We will likely summarize each component from the definitions (name, description, props) in a compact format, because large definitions could be too verbose for the prompt. Keep it concise but informative.

Agent Orchestration Helper: Possibly provide a function or class to handle a single interaction cycle:

Send the prompt and user query to the LLM (this might involve calling an LLM API; we can integrate with OpenAI or others – though for the scope of this library, maybe we just prepare the inputs and leave the actual API call to the developer or a callback).

Receive the LLM's answer (which should contain UI instructions in the agreed format).

Parse the answer using @uicp/parser and return the structured UI component data.

Handle errors: if parsing fails (e.g., the LLM output something not matching definitions), possibly provide an error object or an attempt to correct (initially, probably just throw or return an error indicating invalid component output).

Essentially, this could be a convenience wrapper so developers don't have to manually call parser every time; they can use a single call like const uiResponse = await agent.askWithUI(userInput) (just an illustrative name) which under the hood does prompt composition, API call, and parsing.

Streaming Compatibility: Many modern LLM apps (especially with Vercel's AI SDK) stream tokens. We should consider how to integrate parsing in a streaming context. One approach: buffer the streamed response and parse when it's complete (since we likely need the full component instruction before we can act on it). The agent tools might include guidance or a small utility to handle stream completion and then trigger parsing. (This can be demonstrated in the example Next.js app, and our library can provide a pattern if not a full implementation.)

Minimal Dependencies & Flexibility: Keep this package lightweight. It should not assume a specific LLM provider or HTTP library where possible. Perhaps allow the developer to pass in a function for the LLM call, or just focus on prompt creation and parsing, leaving the actual API call outside. If we do include an example integration (like using OpenAI API), keep it abstract or optional. The example app will show a concrete usage with Vercel's SDK.

TypeScript: Implement in TS. Define appropriate types (e.g., types for the structure of component definitions, the format of system prompt or agent responses, etc.). Export those types for user benefit.

Documentation (minimal): The README for this package should explain its utilities briefly:

How to initialize it (e.g., load definitions, create a prompt).

Possibly a short code snippet integrating with a generic LLM call.

Keep the tone and length similar to popular libraries: focus on a quick example and bullet-point features, no excessive prose.

Release: Prepare @uicp/agent for NPM publishing. Similarly use semantic versioning. Ensure to mark dependencies (e.g., it will depend on @uicp/parser internally). Document any peer dependencies if needed (though ideally it just includes parser as a normal dependency). Exclude any non-essential files from the package.

Example Next.js Chat Application

We will provide a minimal Next.js 13+ application under examples/nextjs-chat to demonstrate how the UICP packages work together in a real scenario. This is not a library, just a sample usage that developers (or our team) can refer to. It will not be published to NPM (just included in the repo for reference).

Key aspects of the example app:

Basic UI: Use Vercel's AI SDK and Vercel AI UI components (AI Elements) to quickly set up a chat interface. This saves us from writing a lot of boilerplate UI. Specifically:

Use the AI SDK on the frontend to manage the chat conversation and streaming responses.

Use AI UI components to display chat messages (user and assistant bubbles).

We might need to customize how the assistant's messages are rendered to handle UICP components (for instance, if the assistant's message includes a special marker or JSON for a UI component, the front-end should render an actual UI element instead of plain text).

API Route (Edge/Serverless Function): Implement a Next.js API route (e.g., pages/api/chat.ts or using the new App Router's route handler) that acts as the backend for the chat. This route will:

Initialize the UICP agent integration (loading definitions, preparing the system prompt).

Accept user messages and maintain conversation state.

Call an LLM (likely OpenAI's API via the Vercel SDK) with the user message plus the system prompt (which includes component definitions context).

Receive the response from the LLM. Use @uicp/parser to parse the response into structured UI components.

Return the parsed result (and possibly the original text) back to the frontend. If using streaming, it might stream tokens and then a final structured payload once complete.

Handle errors (e.g., if parsing fails, return an error message or ask the model to try again).

Component Definitions for Example: Create a simple definitions.json for the example. This could define a couple of basic components to illustrate the idea, for example:

A MessageCard component with props like title and body (which the assistant can use to present information in a nice card format).

A Button component with props like label and maybe an action (though handling actions is beyond the current scope; we can just demonstrate the component rendering).

Keep the definitions small and simple, just enough to show dynamic UI. This JSON will live in the example app (for instance, under examples/nextjs-chat/lib/definitions.json or similar). In Next.js, we might expose it via an API route or import it directly server-side for the agent to use.

Frontend Rendering Logic: In the Next.js frontend (React), when we get the assistant's response:

If it’s streaming text, we'll show it as it comes. But for structured UI components, we likely wait until the model finishes output (or perhaps the model indicates when a UI component is fully described).

After receiving the parsed UI structure from the API route, the frontend will need to render the actual React components. We will implement a simple mapping from the parsed result to React components:

For example, if the parser returns something like { type: 'MessageCard', props: { title: "Hello", body: "World" } }, the frontend knows to render our predefined <MessageCard> React component with those props.

We'll create simple React components in the example app corresponding to those in definitions (e.g., a MessageCard component that just displays a styled card).

The mapping can be manual in the example (e.g., a switch or a component registry object that maps "MessageCard" to the actual React component).

Note: We are not creating a generic rendering library now, just doing what's needed for the example. In the future, we might consider a utility in the UICP packages for rendering, but for now keep it in the example for clarity.

Using Vercel AI Elements: Leverage components like <ChatMessage> or similar to display messages. We might embed our rendered UI component inside the chat feed when appropriate (e.g., if the assistant's message includes a MessageCard, display that as part of the chat).

Conciseness: The example code should be as simple as possible, focusing on demonstrating the integration. Avoid any extraneous features. Document inline or in a short README what the example does.

Running the Example: Document in the main README how to run the example (e.g., "cd examples/nextjs-chat && npm install && npm run dev"). Also mention any setup like putting an OpenAI API key in an environment variable for the Vercel SDK.

Development Guidelines

To ensure consistency and maintain quality, developers (Cursor IDE agents) should follow these guidelines when implementing the above:

Coding Style: Follow standard modern TypeScript practices. Use clear naming, modular code, and include source maps or type declarations as needed for consumers. We can include a linter/eslint config (maybe extend a popular config like Airbnb or just use Typescript ESLint recommended) and a formatter (Prettier) to keep code style uniform.

Conciseness and Clarity: Strive for concise implementations. Do not over-engineer; use straightforward solutions that are easy to read and maintain. Favor clarity over cleverness. Since this is open source, code will be read by others – aim for simplicity.

Documentation & Comments: Provide minimal but sufficient documentation:

Each package should have a brief README with essential information and example usage. Look at popular NPM packages for reference – they usually have a short intro, install instructions, and a few examples of using the API, nothing overly verbose.

Do not mention anything about AI or LLMs writing the code. The tone should be as if written by a developer (e.g., "This package provides X" rather than "I was instructed to...").

Avoid filler or repetitive text. Every sentence in docs should provide value to the user.

Comments in code: write comments where the code might be non-obvious, but avoid writing a comment for every line. (In popular projects, comments are used sparingly to explain complex logic or rationale.)

Testing: Write tests for critical functionality, but keep them targeted. For open source libraries, having a basic test suite increases confidence. We should test the parser with a variety of inputs (valid and invalid) to ensure it behaves correctly. If time permits, test some agent utilities (e.g., prompt generation yields expected strings).

Popular Patterns to Emulate: When unsure about how to format or structure something, consider how widely-used libraries do it. For example:

Project scaffolding: Many use a root README and individual package READMEs, a LICENSE file, and a CONTRIBUTING guide (we can add contributing guidelines if needed).

Export patterns: If a package has a main function, export it as the default or named export as appropriate, matching how users expect to import it. E.g., import { parseComponents } from '@uicp/parser'.

Configuration: use environment variables or config objects in a similar way to other tools (for instance, if using an API key, follow naming conventions). In our case, maybe environment variables for definitions path if appropriate (though probably better to pass directly in code).

Release Process: We will likely use an automated release tool (optional: Changesets for managing version bumps across the monorepo, or manual npm publish for each package initially). Make sure to:

Set proper version numbers in each package.json.

Test that a production build of each package works (e.g., can import the parser in a clean project after building).

Ensure the example app uses the local packages (via workspace) for testing, and also test the scenario with packages installed from NPM (when we do a release).

Both packages should be published under the uicp scope on NPM.

No Python Mention: This PRD is focused solely on Node/TypeScript. Omit any references to a Python implementation in code or docs. (A Python port may come later, but it’s outside our current scope.)

Licensing and Meta: Include a LICENSE file (use MIT License unless directed otherwise, since this is common for open source npm packages). Each package.json should list the license as MIT. Also include basic metadata like repository URL, bugs URL, etc., so that NPM links back to the GitHub properly. We might also include simple GitHub Actions workflows for linting/tests and perhaps publishing (if using CI for release).

By following these guidelines, we aim to produce clean, professional packages that blend in with the broader open-source ecosystem and are easy for others to adopt and contribute to. The end result should be a well-structured monorepo with clearly defined packages, minimal yet effective documentation, and a working example that proves out the UICP concept in practice.