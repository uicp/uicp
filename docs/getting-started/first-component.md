# Your First Component

Learn how to create a complete UICP component from scratch, including the React component, definition, and integration.

## What You'll Build

We'll create a **StatusCard** component that displays status information with different visual variants (success, warning, error). This component will be usable by your AI agent in chat responses.

## Step 1: Design the Component

Before writing code, plan your component:

### Component Purpose
Display status messages with appropriate visual styling

### Props (Inputs)
- `message` (string, required): The status message to display
- `status` (string, required): Status type (success, warning, error, info)
- `timestamp` (string, optional): When the status occurred
- `details` (string, optional): Additional details

### Visual Design
- Color-coded by status type
- Clear hierarchy (message > details > timestamp)
- Icon for status type
- Responsive and accessible

## Step 2: Create the React Component

Create the component file:

```tsx
// components/uicp/status-card.tsx

interface StatusCardProps {
  message: string;
  status: 'success' | 'warning' | 'error' | 'info';
  timestamp?: string;
  details?: string;
}

const statusConfig = {
  success: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    icon: '✓',
  },
  warning: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    icon: '⚠',
  },
  error: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    icon: '✕',
  },
  info: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    icon: 'ℹ',
  },
};

export function StatusCard({ message, status, timestamp, details }: StatusCardProps) {
  const config = statusConfig[status];

  return (
    <div className={`border-l-4 ${config.borderColor} ${config.bgColor} p-4 my-3 rounded-r-lg`}>
      <div className="flex items-start">
        <span className={`text-2xl mr-3 ${config.textColor}`}>
          {config.icon}
        </span>
        <div className="flex-1">
          <p className={`font-semibold ${config.textColor} mb-1`}>
            {message}
          </p>
          {details && (
            <p className={`text-sm ${config.textColor} opacity-80 mb-2`}>
              {details}
            </p>
          )}
          {timestamp && (
            <p className={`text-xs ${config.textColor} opacity-60`}>
              {timestamp}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Component Best Practices

✅ **TypeScript interface** for props
✅ **Default export or named export** (both work)
✅ **Consistent styling** with your design system
✅ **Accessibility** considerations (semantic HTML, readable text)
✅ **Responsive design** (works on all screen sizes)

## Step 3: Create the Component Definition

Add your component to `definitions.json`:

```json
{
  "version": "1.0.0",
  "components": [
    {
      "uid": "StatusCard",
      "type": "status",
      "description": "Display a status message with visual indicators. Use for success confirmations, warnings, errors, or informational messages. Choose the appropriate status type to convey the message urgency.",
      "componentPath": "status-card",
      "inputs": {
        "message": {
          "type": "string",
          "description": "The main status message to display",
          "required": true
        },
        "status": {
          "type": "string",
          "description": "Type of status: 'success' for confirmations, 'warning' for cautions, 'error' for failures, 'info' for general information",
          "required": true,
          "enum": ["success", "warning", "error", "info"]
        },
        "timestamp": {
          "type": "string",
          "description": "Optional timestamp indicating when the status occurred (e.g., '2 minutes ago', '2024-01-15 10:30 AM')",
          "required": false
        },
        "details": {
          "type": "string",
          "description": "Optional additional details or context about the status",
          "required": false
        }
      },
      "example": {
        "uid": "StatusCard",
        "data": {
          "message": "Profile updated successfully",
          "status": "success",
          "timestamp": "Just now",
          "details": "Your changes have been saved and are now live."
        }
      }
    }
  ]
}
```

### Definition Best Practices

✅ **Clear, detailed description** - Helps AI understand when to use the component
✅ **Comprehensive input descriptions** - AI needs to know what each field does
✅ **Use case guidance** - Explain when to use specific enum values
✅ **Realistic example** - Shows AI how to use the component correctly
✅ **Mark required vs optional** - Prevents validation errors

## Step 4: Register the Component

Add the component to your registry:

```tsx
// lib/uicp/registry.ts
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from '@/components/uicp/simple-card';
import { StatusCard } from '@/components/uicp/status-card'; // New component

// Register all components
registerComponent('SimpleCard', SimpleCard);
registerComponent('StatusCard', StatusCard); // Register new component
```

**Important:** The UID in `registerComponent()` must exactly match the `uid` in `definitions.json`.

## Step 5: Test the Component

### Manual Test

Create a test page to preview your component:

```tsx
// app/test-components/page.tsx
import { StatusCard } from '@/components/uicp/status-card';

export default function TestComponents() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Component Tests</h1>
      
      <StatusCard
        message="Operation completed successfully"
        status="success"
        timestamp="Just now"
        details="All items have been processed."
      />

      <StatusCard
        message="Warning: Storage almost full"
        status="warning"
        timestamp="5 minutes ago"
        details="You're using 95% of your available storage."
      />

      <StatusCard
        message="Failed to connect to server"
        status="error"
        timestamp="10 minutes ago"
        details="Please check your internet connection and try again."
      />

      <StatusCard
        message="New features available"
        status="info"
        details="Check out the latest updates in the changelog."
      />
    </div>
  );
}
```

Visit `/test-components` to see your component in all variants.

### AI Test

Test with your AI chat:

**Test Prompts:**

1. **"I updated my profile successfully"**
   - Expected: Success StatusCard

2. **"Show me a warning about my storage"**
   - Expected: Warning StatusCard

3. **"There was an error processing my payment"**
   - Expected: Error StatusCard

4. **"Tell me about the new features"**
   - Expected: Info StatusCard

### Debug AI Behavior

If the AI doesn't use your component:

1. **Check tool availability:**
   ```
   User: "What components do you have access to?"
   ```
   StatusCard should be in the list.

2. **Be explicit:**
   ```
   User: "Show me a success status card saying 'Done'"
   ```

3. **Check API logs:** See if tools are being called

## Step 6: Refine Based on Usage

After testing, you may want to refine:

### Improve Description

If AI uses component incorrectly, improve the description:

```json
{
  "description": "Display a status message with visual styling. IMPORTANT: Use 'success' status for confirmations and completed actions, 'error' for failures and problems, 'warning' for cautions and alerts, 'info' for general information and updates."
}
```

### Add More Examples

Multiple examples help AI understand different use cases:

```json
{
  "examples": [
    {
      "uid": "StatusCard",
      "data": {
        "message": "Payment processed",
        "status": "success"
      }
    },
    {
      "uid": "StatusCard",
      "data": {
        "message": "Invalid credit card",
        "status": "error",
        "details": "Please check your card number"
      }
    }
  ]
}
```

### Adjust Styling

Based on user feedback, refine the visual design:

```tsx
// Add hover effects, transitions, etc.
<div className={`... transition-all duration-200 hover:shadow-md`}>
```

## Common Patterns

### Optional Fields

Make fields optional but provide good defaults:

```tsx
export function StatusCard({ 
  message, 
  status, 
  timestamp, 
  details,
  icon, // Custom icon override
}: StatusCardProps) {
  const displayIcon = icon || statusConfig[status].icon;
  // ...
}
```

### Validation

Add runtime validation for better error messages:

```tsx
export function StatusCard({ status, ...props }: StatusCardProps) {
  if (!statusConfig[status]) {
    console.error(`Invalid status: ${status}`);
    return <div>Invalid status type</div>;
  }
  // ...
}
```

### Complex Data

For complex data structures, use nested objects:

```json
{
  "inputs": {
    "user": {
      "type": "object",
      "description": "User information",
      "properties": {
        "name": { "type": "string" },
        "avatar": { "type": "string" }
      }
    }
  }
}
```

## Component Checklist

Before considering your component complete:

- [ ] React component created and styled
- [ ] Props interface defined with TypeScript
- [ ] Component exported (named or default)
- [ ] Definition added to definitions.json
- [ ] All inputs documented with descriptions
- [ ] Required vs optional correctly marked
- [ ] Realistic example provided
- [ ] Component registered in registry
- [ ] Manual testing completed (all variants)
- [ ] AI testing completed (generates correctly)
- [ ] Responsive design verified
- [ ] Accessibility checked

## Next Steps

### Add More Components

Now that you understand the process, create more components:

- **DataTable**: For tabular data
- **Chart**: For data visualization
- **Form**: For user input
- **Modal**: For focused interactions

### Advanced Features

- [Component Definitions](../advanced/component-definitions.md) - Deep dive into schemas
- [Validation](../advanced/validation.md) - Add custom validation logic
- [Error Handling](../advanced/error-handling.md) - Graceful error management

### See Examples

- [Component Examples](../example-project/component-examples.md) - More component ideas
- [Example Project](../example-project/overview.md) - Complete implementation reference

## Resources

- [React Component Patterns](https://reactpatterns.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [UICP GitHub Examples](https://github.com/uicp/uicp/tree/main/examples)

---

**Great job!** You've created your first UICP component. Keep building and experimenting! 🚀

