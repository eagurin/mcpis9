# 🚀 Quick Start Guide - Advanced Agent System

## Prerequisites

- Node.js 18+ or Bun
- Docker (for R2R)
- Git

## 5-Minute Setup

### Step 1: Clone and Install

```bash
git clone https://github.com/eagurin/mcpis9.git
cd mcpis9
bun install
```

### Step 2: Start R2R Memory System

```bash
# Option A: Docker (Recommended)
docker run -d -p 7272:7272 --name r2r sciphi/r2r:latest

# Option B: Python
pip install r2r
r2r serve
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
R2R_BASE_URL=http://localhost:7272
AGENT_MODEL=claude-3-7-sonnet
```

### Step 4: Start the Application

```bash
bun run web:dev
```

### Step 5: Access the Interface

Open your browser to:
- **Web UI**: http://localhost:3000/agents
- **Main App**: http://localhost:3000

## First Tasks

### Create Your First Task

1. Go to http://localhost:3000/agents
2. Click the "Tasks" tab
3. Click "➕ Create Task"
4. Fill in:
   - **Title**: "Research TypeScript best practices"
   - **Description**: "Find and summarize current TypeScript best practices for 2025"
   - **Type**: Research
   - **Priority**: Medium
5. Click "Create Task"

The system will:
- Assign the task to the Research Agent
- Use R2R to gather information
- Store findings in memory
- Display results in real-time

### Monitor Agents

1. Click the "Dashboard" tab
2. See all agents and their status
3. View system metrics
4. Watch agents work in real-time

### Search Memory

1. Click the "Memory" tab
2. Enter a query: "What have we learned about TypeScript?"
3. See semantic search results from R2R

## Advanced Setup (Optional)

### Linear Integration

1. Get your Linear API key from https://linear.app/settings/api
2. Add to `.env`:
```env
LINEAR_API_KEY=lin_api_xxxxx
LINEAR_TEAM_ID=your-team-id
```

3. Tasks will now sync with Linear automatically!

### Custom AI Models

Edit `.env`:
```env
AGENT_MODEL=gpt-4
ANTHROPIC_API_KEY=your-key
OPENAI_API_KEY=your-key
```

## API Usage

### Create Task via API

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build login page",
    "description": "Create a responsive login page with email/password",
    "type": "code_generation",
    "priority": "high"
  }'
```

### Get Agent Status

```bash
curl http://localhost:3000/api/agents
```

### Search Memory

```bash
curl -X POST http://localhost:3000/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How did we solve authentication?",
    "limit": 5
  }'
```

## Task Types

Choose the right type for your task:

- **`code_generation`** - Generate new code
- **`code_review`** - Review existing code
- **`research`** - Gather information
- **`web_automation`** - Browser automation
- **`testing`** - Write or run tests
- **`debugging`** - Fix bugs
- **`planning`** - Break down complex tasks
- **`documentation`** - Write docs

## Common Workflows

### Workflow 1: Build a Feature

```typescript
// 1. Create planning task
await fetch('/api/tasks', {
  method: 'POST',
  body: JSON.stringify({
    title: "Plan user dashboard",
    type: "planning",
    priority: "high"
  })
});

// 2. Planner agent creates sub-tasks
// 3. Code agent implements components
// 4. Research agent finds best practices
// 5. Results stored in memory
```

### Workflow 2: Research & Implement

```typescript
// 1. Research
await createTask({
  title: "Research state management options",
  type: "research"
});

// 2. Generate code based on research
await createTask({
  title: "Implement Zustand store",
  type: "code_generation",
  context: {
    requirements: ["Based on research findings"]
  }
});
```

## Troubleshooting

### R2R Not Connected

```bash
# Check R2R is running
curl http://localhost:7272/v3/health

# Restart if needed
docker restart r2r
```

### Tasks Not Processing

1. Check Dashboard for agent status
2. Look at browser console for errors
3. Verify R2R connection
4. Check task queue isn't stuck

### No Search Results

- Lower the threshold in search
- Try broader queries
- Ensure tasks have completed (memory is stored after completion)

## Next Steps

1. **Read Full Docs**: See `docs/AGENT_SYSTEM.md`
2. **Explore Web UI**: Try all three tabs
3. **Create Complex Tasks**: Test task dependencies
4. **Add Linear**: Sync with your project management
5. **Customize Agents**: Modify agent behavior

## Example Tasks to Try

### Easy
```json
{
  "title": "Explain async/await",
  "type": "research",
  "priority": "low"
}
```

### Medium
```json
{
  "title": "Create REST API for todos",
  "type": "code_generation",
  "priority": "medium",
  "context": {
    "requirements": ["Express.js", "TypeScript", "CRUD operations"]
  }
}
```

### Hard
```json
{
  "title": "Build full-stack authentication",
  "type": "planning",
  "priority": "high",
  "context": {
    "goal": "Complete auth system",
    "requirements": ["OAuth2", "JWT", "Refresh tokens", "Email verification"],
    "constraints": ["PostgreSQL", "Next.js", "TypeScript"]
  }
}
```

## Support & Community

- **GitHub**: [eagurin/mcpis9](https://github.com/eagurin/mcpis9)
- **Telegram**: [@mcpis9](https://t.me/mcpis9)
- **Email**: e.a.gurin@gmail.com

---

**Ready to build amazing things with AI agents!** 🚀
