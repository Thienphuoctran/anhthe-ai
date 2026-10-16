---
name: shadcn-ui
description: Official shadcn/ui component library integration. Use for building beautiful, accessible React/Next.js interfaces with minimal token overhead.
---
# shadcn/ui Official Guidelines for AI Coding Agents

## 1. Core Rule: Never write raw custom UI from scratch
When building UI elements (buttons, cards, dialogs, progress bars, tables, tabs, inputs):
- ALWAYS check and use the `shadcn` CLI component registry:
  `npx shadcn@latest add <component_name>`
- Available core components:
  `button`, `card`, `dialog`, `progress`, `table`, `tabs`, `input`, `badge`, `avatar`, `alert`, `skeleton`.

## 2. Token Saving Strategy
- Do NOT output hundreds of lines of custom Tailwind CSS for components that already exist in shadcn/ui.
- Simply instruct the project to add the component and import it:
  `import { Button } from "@/components/ui/button"`
  `import { Progress } from "@/components/ui/progress"`
- Keep custom code focused purely on business logic (e.g., countdown timer logic, score calculation).