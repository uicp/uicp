# Use Cases

UICP enables a wide variety of rich UI experiences in AI chat interfaces. Here are common use cases and implementation examples.

## Data Visualization

### Tables & Grids

Perfect for displaying structured data, reports, and comparisons.

**Example Use Cases:**
- Sales reports
- User lists
- Product inventories
- Financial data
- Analytics dashboards

**Component Example:**
```json
{
  "uid": "DataTable",
  "type": "table",
  "description": "Display tabular data with headers and rows",
  "inputs": {
    "title": { "type": "string" },
    "headers": { "type": "array", "required": true },
    "rows": { "type": "array", "required": true },
    "striped": { "type": "boolean", "default": true }
  }
}
```

**AI Usage:**
```
User: "Show me this month's top customers"
AI: Creates DataTable with customer data
```

### Charts & Graphs

Visualize trends, comparisons, and distributions.

**Example Use Cases:**
- Sales trends over time
- Performance metrics
- Market comparisons
- User growth
- Budget breakdowns

**Component Ideas:**
- LineChart
- BarChart
- PieChart
- AreaChart
- ScatterPlot

## E-commerce

### Product Cards

Display products with images, prices, and descriptions.

**Example Use Cases:**
- Product recommendations
- Search results
- Shopping lists
- Comparison tables
- Featured items

**Component Example:**
```json
{
  "uid": "ProductCard",
  "type": "card",
  "description": "Display product information",
  "inputs": {
    "title": { "type": "string", "required": true },
    "price": { "type": "number", "required": true },
    "image": { "type": "string" },
    "description": { "type": "string" },
    "rating": { "type": "number" },
    "inStock": { "type": "boolean", "default": true }
  }
}
```

**AI Usage:**
```
User: "Show me wireless headphones under $100"
AI: Returns ProductCards for matching items
```

### Shopping Cart

Display cart items with totals and actions.

**Example Use Cases:**
- Order summary
- Cart preview
- Checkout review
- Order history

## Content Display

### Information Cards

Present information in organized, scannable formats.

**Example Use Cases:**
- User profiles
- Article summaries
- Help documentation
- Feature highlights
- Status updates

**Component Example:**
```json
{
  "uid": "InfoCard",
  "type": "card",
  "description": "Display information in a card format",
  "inputs": {
    "title": { "type": "string", "required": true },
    "content": { "type": "string", "required": true },
    "variant": { 
      "type": "string", 
      "enum": ["info", "success", "warning", "error"],
      "default": "info"
    },
    "icon": { "type": "string" }
  }
}
```

**AI Usage:**
```
User: "Tell me about the premium plan"
AI: Creates InfoCard with plan details
```

### Media Galleries

Display images, videos, and media collections.

**Example Use Cases:**
- Photo galleries
- Video playlists
- Portfolio items
- Product images
- Tutorial screenshots

**Component Ideas:**
- ImageGallery
- VideoPlayer
- MediaCarousel
- Lightbox

## Interactive Forms

### Dynamic Forms

Generate forms based on context and user needs.

**Example Use Cases:**
- Feedback forms
- Survey questions
- Settings configuration
- Data input
- Filtering options

**Component Example:**
```json
{
  "uid": "DynamicForm",
  "type": "form",
  "description": "Create a form with specified fields",
  "inputs": {
    "title": { "type": "string" },
    "fields": { "type": "array", "required": true },
    "submitLabel": { "type": "string", "default": "Submit" }
  }
}
```

**AI Usage:**
```
User: "I want to report a bug"
AI: Creates DynamicForm with relevant bug report fields
```

### Selection Components

Help users make choices with structured UI.

**Component Ideas:**
- RadioGroup
- CheckboxList
- Dropdown
- RangeSlider
- DatePicker

## Notifications & Alerts

### Status Messages

Communicate system status and user actions.

**Example Use Cases:**
- Success confirmations
- Error messages
- Warnings
- Info notifications
- Loading states

**Component Example:**
```json
{
  "uid": "Alert",
  "type": "alert",
  "description": "Display alert or notification message",
  "inputs": {
    "message": { "type": "string", "required": true },
    "type": { 
      "type": "string",
      "enum": ["success", "error", "warning", "info"],
      "default": "info"
    },
    "dismissible": { "type": "boolean", "default": true }
  }
}
```

**AI Usage:**
```
User: "Delete my account"
AI: Creates warning Alert before proceeding
```

### Progress Indicators

Show task progress and status.

**Component Ideas:**
- ProgressBar
- StepIndicator
- Timeline
- StatusBadge
- LoadingSpinner

## Documentation

### Code Examples

Display code with syntax highlighting and copy functionality.

**Example Use Cases:**
- API examples
- Configuration snippets
- Tutorial code
- Error debugging
- Implementation guides

**Component Example:**
```json
{
  "uid": "CodeBlock",
  "type": "code",
  "description": "Display code with syntax highlighting",
  "inputs": {
    "code": { "type": "string", "required": true },
    "language": { "type": "string", "required": true },
    "title": { "type": "string" },
    "showLineNumbers": { "type": "boolean", "default": true },
    "copyable": { "type": "boolean", "default": true }
  }
}
```

**AI Usage:**
```
User: "How do I make an API request?"
AI: Creates CodeBlock with example code
```

### API Reference

Display API endpoints, parameters, and responses.

**Component Ideas:**
- ApiEndpoint
- ParameterTable
- ResponseExample
- SchemaViewer

## Business Applications

### Dashboards

Display metrics, KPIs, and business intelligence.

**Example Use Cases:**
- Sales dashboards
- Performance metrics
- Team analytics
- Project status
- Financial reports

**Component Ideas:**
- MetricCard
- KPIWidget
- TrendIndicator
- ComparisonChart

### Project Management

Track tasks, projects, and team progress.

**Component Ideas:**
- TaskCard
- ProjectTimeline
- TeamMemberCard
- MilestoneList
- BurndownChart

## Customer Support

### Ticket Information

Display support tickets and their details.

**Example Use Cases:**
- Ticket summaries
- Issue tracking
- Status updates
- Resolution history

**Component Example:**
```json
{
  "uid": "TicketCard",
  "type": "card",
  "description": "Display support ticket information",
  "inputs": {
    "ticketId": { "type": "string", "required": true },
    "status": { "type": "string", "required": true },
    "priority": { "type": "string" },
    "subject": { "type": "string", "required": true },
    "description": { "type": "string" },
    "created": { "type": "string" }
  }
}
```

### FAQ Components

Present frequently asked questions.

**Component Ideas:**
- FAQAccordion
- QuestionCard
- CategoryList
- SearchableHelp

## Financial Applications

### Transaction Displays

Show financial transactions and details.

**Example Use Cases:**
- Payment history
- Transaction details
- Invoice displays
- Receipt generation

**Component Ideas:**
- TransactionCard
- InvoiceTable
- ReceiptView
- PaymentForm

### Pricing Tables

Compare plans and pricing options.

**Component Ideas:**
- PricingCard
- ComparisonTable
- FeatureList
- SubscriptionPlan

## Real-World Implementation Examples

### Example 1: E-commerce Assistant

```typescript
// User: "Show me recommended products for my home office"

// AI response includes:
```uicp
{
  "uid": "ProductCard",
  "data": {
    "title": "Ergonomic Office Chair",
    "price": 299.99,
    "image": "https://...",
    "rating": 4.5,
    "description": "Comfortable chair with lumbar support"
  }
}
```

// And more ProductCards for desk, lamp, etc.
```

### Example 2: Data Analytics Assistant

```typescript
// User: "Analyze last quarter's sales performance"

// AI creates multiple components:
```uicp
{ "uid": "MetricCard", "data": { "title": "Total Revenue", "value": "$125K", "change": "+15%" } }
```

```uicp
{ "uid": "LineChart", "data": { "title": "Monthly Trend", "data": [...] } }
```

```uicp
{ "uid": "DataTable", "data": { "title": "Top Products", "headers": [...], "rows": [...] } }
```
```

### Example 3: Project Management Assistant

```typescript
// User: "Show me team progress"

// AI creates:
```uicp
{ "uid": "ProjectTimeline", "data": { "milestones": [...], "current": "Design Phase" } }
```

```uicp
{ "uid": "TaskList", "data": { "tasks": [...], "grouped": "by-assignee" } }
```

```uicp
{ "uid": "TeamMetrics", "data": { "velocity": 45, "completed": 23, "remaining": 12 } }
```
```

## Choosing Components for Your Use Case

### Consider These Factors:

1. **Data Structure**: What shape is your data?
   - Tabular → DataTable
   - Hierarchical → TreeView
   - Time-based → Timeline/Chart

2. **User Intent**: What is the user trying to do?
   - Browse → Cards/Gallery
   - Compare → Table/ComparisonChart
   - Track → Progress/Timeline

3. **Information Density**: How much info needs to be displayed?
   - High density → Tables
   - Medium density → Cards
   - Low density → Alerts/Badges

4. **Interaction Needed**: Does the user need to interact?
   - Input → Forms
   - Selection → Dropdowns/Checkboxes
   - View only → Cards/Tables

## Best Practices

### Start Small
Begin with 3-5 essential components for your use case.

### Think Reusability
Design components that can be used in multiple contexts.

### Provide Good Examples
Include realistic example data in definitions for better AI usage.

### Test AI Behavior
See how the AI chooses to use your components in various scenarios.

### Iterate Based on Usage
Monitor which components are used and refine their definitions.

## Next Steps

- See these concepts in action: [Example Project](../example-project/overview.md)
- Start building: [Getting Started Guide](../getting-started/installation.md)
- Learn component creation: [Your First Component](../getting-started/first-component.md)

