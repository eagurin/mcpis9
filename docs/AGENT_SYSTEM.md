# 🤖 Advanced Agent System Documentation

## Overview

This is an advanced multi-agent orchestration system inspired by [Lleverage.ai](https://docs.lleverage.ai/) architecture with integrated [R2R (Retrieval-Augmented Retrieval)](https://github.com/evgenygurin/R2R) memory capabilities and [Linear](https://linear.app) project management integration.

## Architecture

### Core Components

1. **Boss Agent** - Master orchestrator that:
   - Delegates tasks to specialized agents
   - Coordinates multi-agent workflows
   - Maintains system state and metrics
   - Makes decisions using R2R agentic retrieval
   - Manages task queues and priorities

2. **Specialized Agents**:
   - **Research Agent** - Information gathering and analysis using R2R semantic search
   - **Code Agent** - Code generation, review, and debugging with RAG
   - **Browser Agent** - Web automation and scraping (Lleverage.ai inspired)
   - **Planner Agent** - Task decomposition and strategic planning
   - **Worker Agent** - General purpose task execution

3. **R2R Memory System**:
   - Semantic search across agent memories
   - Knowledge graph generation
   - Agentic retrieval with extended reasoning
   - Long-term memory storage
   - Context-aware decision making

4. **Linear Integration**:
   - Automatic issue creation from tasks
   - Status synchronization
   - Project management workflows
   - Team collaboration

## Key Features

### 1. Advanced Memory (R2R)

All agents have access to a sophisticated memory system:

```typescript
// Semantic search
const memories = await r2rClient.search({
  query: "How did we solve similar tasks?",
  limit: 10,
  threshold: 0.7
});

// Agentic retrieval with reasoning
const decision = await r2rClient.agentRetrieval({
  query: "What's the best approach for this task?",
  model: "claude-3-7-sonnet",
  thinkingBudget: 10000
});

// Knowledge graph creation
const graph = await r2rClient.createKnowledgeGraph({
  collectionId: "agent-memories"
});
```

### 2. Task Orchestration

The Boss Agent manages complex task workflows:

```typescript
// Create a task
const task = await bossAgent.createTask({
  title: "Build authentication system",
  description: "Implement OAuth2 with JWT tokens",
  type: "code_generation",
  priority: "high",
  context: {
    goal: "Secure user authentication",
    requirements: ["OAuth2", "JWT", "Refresh tokens"],
    constraints: ["Must use PostgreSQL", "TypeScript only"]
  }
});

// Task is automatically delegated to best available agent
await bossAgent.processQueue();
```

### 3. Agent Communication

Agents communicate through a message-based system:

```typescript
// Boss agent sends task to code agent
await bossAgent.sendMessage({
  from: "boss-agent",
  to: "code-agent-001",
  type: "task_assignment",
  content: task,
  priority: "high",
  requiresResponse: true
});
```

### 4. Performance Tracking

System maintains comprehensive metrics:

- Task success rates
- Agent efficiency scores
- Average response times
- Quality metrics
- Memory usage

## Installation & Setup

### 1. Install R2R

```bash
# Option 1: Light mode (no PostgreSQL)
pip install r2r
r2r serve

# Option 2: Full mode with PostgreSQL
docker pull r2r/r2r:latest
docker run -p 7272:7272 r2r/r2r:latest
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

Required variables:
- `R2R_BASE_URL` - R2R API endpoint (default: http://localhost:7272)
- `R2R_API_KEY` - R2R API key (optional)
- `AGENT_MODEL` - AI model to use (default: claude-3-7-sonnet)

Optional:
- `LINEAR_API_KEY` - For Linear integration
- `LINEAR_TEAM_ID` - Your Linear team ID

### 3. Install Dependencies

```bash
bun install
```

### 4. Run the System

```bash
# Start web interface
bun run web:dev

# Or start CLI
bun run cli:dev
```

## API Endpoints

### Agent Management

```
GET    /api/agents          - Get all agents and system status
POST   /api/agents          - Start boss agent
```

### Task Management

```
GET    /api/tasks           - List all tasks
POST   /api/tasks           - Create new task
GET    /api/tasks/[id]      - Get specific task
PATCH  /api/tasks/[id]      - Update task status
```

### Memory

```
POST   /api/memory/search   - Search R2R memory
```

## Web Interface

Access the web interface at `http://localhost:3000/agents`

### Features:

1. **Dashboard Tab**:
   - Real-time agent status
   - System metrics
   - Performance indicators

2. **Tasks Tab**:
   - Create new tasks
   - Monitor task progress
   - View task history

3. **Memory Tab**:
   - Search agent memories
   - View stored knowledge
   - Explore connections

## Usage Examples

### Example 1: Research Task

```typescript
const task = await bossAgent.createTask({
  title: "Research Next.js 15 features",
  description: "Find and summarize new features in Next.js 15",
  type: "research",
  priority: "medium"
});
```

The Research Agent will:
1. Use R2R agentic retrieval to gather information
2. Generate a comprehensive report
3. Store findings in memory
4. Return formatted results

### Example 2: Code Generation

```typescript
const task = await bossAgent.createTask({
  title: "Create API endpoint",
  description: "Build REST API for user management",
  type: "code_generation",
  priority: "high",
  context: {
    requirements: ["CRUD operations", "Authentication", "Validation"],
    tech_stack: ["Node.js", "Express", "PostgreSQL"]
  }
});
```

The Code Agent will:
1. Retrieve relevant code context from memory
2. Generate code using RAG
3. Include proper error handling
4. Return code artifacts

### Example 3: Complex Workflow

```typescript
// Create a planning task first
const planTask = await bossAgent.createTask({
  title: "Plan e-commerce implementation",
  description: "Break down e-commerce platform into tasks",
  type: "planning",
  priority: "critical"
});

// Planner agent creates sub-tasks automatically
// Boss agent delegates sub-tasks to appropriate agents
// Progress is tracked in real-time
```

## Linear Integration

### Sync Tasks with Linear

```typescript
import { createLinearClient } from '@mcpis9/shared';

const linear = createLinearClient({
  apiKey: process.env.LINEAR_API_KEY,
  teamId: process.env.LINEAR_TEAM_ID
});

// Create Linear issue from task
const issue = await linear.createIssueFromTask(task, teamId);

// Sync status
await linear.syncTaskWithIssue(task, issue.id);
```

## Best Practices

### 1. Task Design

- **Be Specific**: Clear titles and detailed descriptions
- **Set Context**: Provide requirements, constraints, resources
- **Right Priority**: Use critical/high/medium/low appropriately
- **Dependencies**: Link related tasks

### 2. Memory Management

- **Quality Over Quantity**: Store important learnings
- **Good Metadata**: Tag memories for better retrieval
- **Regular Cleanup**: Remove outdated information
- **Importance Scores**: Rate memories 0-1

### 3. Agent Selection

The Boss Agent automatically selects agents based on:
- Task type
- Agent capabilities
- Current availability
- Performance history

Trust the system's selection, but you can influence it through task type.

## Monitoring & Debugging

### System Events

The Boss Agent emits events for monitoring:

```typescript
bossAgent.on('system_event', (event) => {
  console.log('Event:', event.type, event.data);
});

bossAgent.on('message', (message) => {
  console.log('Message:', message.from, '->', message.to);
});
```

### Metrics Endpoint

```bash
curl http://localhost:3000/api/agents
```

Returns:
- Active tasks count
- Completed/failed tasks
- Agent statuses
- System load
- Memory usage

## Troubleshooting

### R2R Connection Issues

```bash
# Check R2R is running
curl http://localhost:7272/v3/health

# Restart R2R
docker restart r2r-container
```

### Agent Not Processing Tasks

1. Check agent status in dashboard
2. Verify R2R connection
3. Check task queue size
4. Review system logs

### Memory Search Returns No Results

1. Verify documents are stored
2. Lower threshold in search query
3. Try broader search terms
4. Check collection ID

## Architecture Decisions

### Why R2R?

- **Advanced RAG**: Beyond simple vector search
- **Agentic Retrieval**: Extended reasoning capabilities
- **Knowledge Graphs**: Understand relationships
- **Production Ready**: Built for scale

### Why Lleverage.ai Pattern?

- **Visual Workflows**: Easy to understand
- **Agent Orchestration**: Proven patterns
- **Browser Automation**: Real-world tasks
- **Enterprise Ready**: Battle-tested architecture

### Why Linear Integration?

- **Developer-First**: Built for dev teams
- **GraphQL API**: Flexible and powerful
- **Agent Support**: Native agent integration
- **Modern Workflows**: Async-first design

## Future Enhancements

- [ ] Workflow builder UI (Lleverage.ai inspired)
- [ ] Multi-agent conversations
- [ ] Learning from feedback
- [ ] Custom agent types
- [ ] Workflow templates
- [ ] Advanced analytics
- [ ] Agent marketplace
- [ ] Voice interface

## Resources

- [R2R Documentation](https://github.com/evgenygurin/R2R)
- [Lleverage.ai Docs](https://docs.lleverage.ai/)
- [Linear API](https://developers.linear.app/)
- [Agent Best Practices](https://linear.app/developers/agent-best-practices)

## Support

For issues or questions:
- GitHub Issues: [mcpis9/issues](https://github.com/eagurin/mcpis9/issues)
- Telegram: [@mcpis9](https://t.me/mcpis9)
- Email: e.a.gurin@gmail.com

---

*Built with ❤️ by the mcpis9 team*
