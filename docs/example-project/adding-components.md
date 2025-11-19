# Adding Components

Learn how to add new components to the example project.

## Step-by-Step Guide

### 1. Create Component File

Create a new component in `components/uicp/`:

```tsx
// components/uicp/status-badge.tsx

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    online: { color: 'bg-green-500', text: 'Online' },
    offline: { color: 'bg-gray-500', text: 'Offline' },
    away: { color: 'bg-yellow-500', text: 'Away' },
    busy: { color: 'bg-red-500', text: 'Busy' },
  };

  const config = statusConfig[status];

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-sm text-gray-200">
        {label || config.text}
      </span>
    </div>
  );
}
```

### 2. Add Definition

Update `lib/uicp/definitions.json`:

```json
{
  "version": "1.0.0",
  "components": [
    {
      "uid": "StatusBadge",
      "type": "badge",
      "description": "Display user or system status with a colored indicator",
      "componentPath": "status-badge",
      "inputs": {
        "status": {
          "type": "string",
          "description": "Status type: 'online', 'offline', 'away', or 'busy'",
          "required": true,
          "enum": ["online", "offline", "away", "busy"]
        },
        "label": {
          "type": "string",
          "description": "Optional custom label text",
          "required": false
        }
      },
      "example": {
        "uid": "StatusBadge",
        "data": {
          "status": "online",
          "label": "Available now"
        }
      }
    }
  ]
}
```

### 3. Register Component

Update `lib/uicp/registry.ts`:

```typescript
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from '@/components/uicp/simple-card';
import { DataTable } from '@/components/uicp/data-table';
import { StatusBadge } from '@/components/uicp/status-badge'; // New

registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);
registerComponent('StatusBadge', StatusBadge); // New
```

### 4. Test It

Restart your dev server and try:

```
User: "Show my status as online"
AI creates:
```uicp
{
  "uid": "StatusBadge",
  "data": {
    "status": "online"
  }
}
```
```

## Best Practices

### Component Design

1. **Keep it simple** - One clear purpose
2. **Use TypeScript** - Define prop interfaces
3. **Provide defaults** - For optional props
4. **Style consistently** - Match existing components
5. **Think responsive** - Mobile-first design

### Definition Writing

1. **Clear descriptions** - Help AI understand when to use it
2. **Detailed input docs** - Explain each prop
3. **Realistic examples** - Show actual use cases
4. **Specify enums** - For limited value sets
5. **Mark required fields** - Prevent errors

### Testing

1. **Manual testing** - Create a test page
2. **AI testing** - Try various prompts
3. **Edge cases** - Test with missing/invalid data
4. **Responsive** - Test on different screen sizes

## More Examples

### Metric Card

```tsx
// components/uicp/metric-card.tsx

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ title, value, change, trend }: MetricCardProps) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500',
  };

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-100 mb-2">{value}</div>
      {change && trend && (
        <div className={`text-sm ${trendColors[trend]}`}>
          {trend === 'up' && '↑'} {trend === 'down' && '↓'} {change}
        </div>
      )}
    </div>
  );
}
```

### Alert Component

```tsx
// components/uicp/alert.tsx

interface AlertProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
}

export function Alert({ message, type, dismissible = true }: AlertProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const typeConfig = {
    info: 'bg-blue-950 border-blue-600 text-blue-200',
    success: 'bg-green-950 border-green-600 text-green-200',
    warning: 'bg-yellow-950 border-yellow-600 text-yellow-200',
    error: 'bg-red-950 border-red-600 text-red-200',
  };

  return (
    <div className={`border-l-4 p-4 my-2 rounded-r ${typeConfig[type]}`}>
      <div className="flex justify-between items-start">
        <p>{message}</p>
        {dismissible && (
          <button onClick={() => setVisible(false)} className="ml-4">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
```

## Troubleshooting

### Component Not Rendering

**Check:**
1. Component is registered in `registry.ts`
2. UID matches between registration and definition
3. Component is exported correctly
4. No TypeScript errors

### AI Not Using Component

**Check:**
1. Definition description is clear
2. Example is realistic
3. Component type makes sense
4. Try being explicit in prompts

### Styling Issues

**Check:**
1. Tailwind classes are correct
2. Dark theme colors used
3. Responsive classes included
4. Consistent with other components

## Next Steps

- [Component Examples](component-examples.md) - Study existing components
- [Project Structure](project-structure.md) - Understand the codebase
- [Deployment](deployment.md) - Deploy your changes

