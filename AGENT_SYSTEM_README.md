# 🤖 Advanced Boss Agent System with R2R Memory

## Overview

This project implements a sophisticated **Boss Agent Architecture** (Centralized Orchestration) with advanced R2R memory integration, specialized worker agents, and multi-step task orchestration.

## 🎯 Architecture

### Core Components

1. **Boss Agent (Orchestrator)**
   - Main decision-making agent
   - Analyzes user requests and creates execution plans
   - Delegates tasks to specialized worker agents
   - Coordinates multi-step workflows
   - Synthesizes final responses

2. **Worker Agents**
   - **Code Agent**: Code generation, review, refactoring, debugging
   - **Research Agent**: Web search, documentation lookup, knowledge queries
   - **Task Manager Agent**: Linear integration, project management
   - **Data Agent**: Data queries, analysis, transformations

3. **R2R Memory Layer**
   - Advanced RAG (Retrieval-Augmented Generation)
   - Knowledge graphs for entity/relationship extraction
   - Hybrid search (semantic + keyword)
   - Conversation history and context management
   - Task result storage for learning

4. **Orchestration Patterns**
   - **Sequential**: Execute tasks one after another
   - **Parallel**: Execute multiple tasks simultaneously
   - **Pipeline**: Chain tasks where output feeds into next
   - **Conditional**: Branch based on conditions
   - **Iterative**: Refine results through multiple iterations

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

### Configuration

Edit `.env` file:

```env
# At least one AI provider required
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
GOOGLE_API_KEY=your-key-here

# R2R Memory (optional but recommended)
R2R_BASE_URL=http://localhost:7272
R2R_API_KEY=your-r2r-api-key

# Linear Integration (optional)
LINEAR_API_KEY=lin_api_your-key-here
LINEAR_TEAM_ID=your-team-id
```

### Installing R2R (Optional)

For advanced memory capabilities:

```bash
# Light mode (quick start)
pip install r2r
export OPENAI_API_KEY=sk-...
python -m r2r.serve
```

Or use Docker:

```bash
docker run -p 7272:7272 ragtoriches/prod-r2r
```

## 📦 Usage

### 1. CLI Interface

```bash
# Interactive chat with boss agent
mcpis9 agent chat

# Send single message
mcpis9 agent chat -m "Write a TypeScript function to sort an array"

# Continue conversation
mcpis9 agent chat -c conversation-123

# Check agent status
mcpis9 agent status

# Test agent system
mcpis9 agent test
```

### 2. Web Interface

Start the Next.js web app:

```bash
cd packages/web
pnpm dev
```

Navigate to `http://localhost:3000` and start chatting!

### 3. Programmatic API

```typescript
import { initOrchestrator, type OrchestratorConfig } from '@mcpis9/shared';

// Initialize orchestrator
const config: OrchestratorConfig = {
  r2r: {
    baseUrl: 'http://localhost:7272',
    apiKey: process.env.R2R_API_KEY,
  },
  aiProviders: {
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
  },
};

const orchestrator = initOrchestrator(config);
await orchestrator.initialize();

// Process request
const response = await orchestrator.processRequest(
  "Write a factorial function in TypeScript",
  "conversation-id-123"
);

console.log(response);

// Check system status
const status = orchestrator.getSystemStatus();
console.log(status);

// Shutdown
await orchestrator.shutdown();
```

## 🏗️ Project Structure

```
mcpis9/
├── packages/
│   ├── shared/           # Shared types, agents, services
│   │   ├── src/
│   │   │   ├── agents/   # Boss and worker agents
│   │   │   ├── services/ # R2R memory service
│   │   │   └── types/    # Agent type definitions
│   ├── cli/              # Command-line interface
│   │   └── src/
│   │       ├── commands/ # CLI commands
│   │       └── cli/      # CLI entry point
│   └── web/              # Next.js web interface
│       └── src/
│           └── app/
│               └── api/  # API routes
├── AGENT_ARCHITECTURE.md # Detailed architecture docs
└── AGENT_SYSTEM_README.md # This file
```

## 🧠 Agent Capabilities

### Boss Agent
- Natural language understanding
- Intent classification
- Task decomposition
- Multi-agent orchestration
- Response synthesis
- Context management via R2R

### Code Agent
- **Code Generation**: Create new code from requirements
- **Code Review**: Analyze code for issues and improvements
- **Refactoring**: Improve code quality and structure
- **Debugging**: Identify and fix bugs

### Research Agent
- **Web Research**: Information gathering and synthesis
- **Documentation Lookup**: Find relevant documentation
- **Knowledge Queries**: Search R2R knowledge base
- **Comparative Analysis**: Compare technologies/approaches

### Task Manager Agent
- **Linear Integration**: Create/update/query Linear issues
- **Project Management**: Project and cycle management
- **Task Tracking**: Monitor progress and status
- **Team Coordination**: Assign and delegate tasks

### Data Agent
- **Data Queries**: Execute database queries
- **Analysis**: Statistical analysis and insights
- **Transformations**: Data ETL operations
- **Visualizations**: Generate charts and graphs

## 🔧 Advanced Features

### 1. R2R Memory Integration

The system stores all interactions in R2R for:
- **Long-term memory**: Remember past conversations
- **Context retrieval**: Find relevant past interactions
- **Knowledge graphs**: Build understanding of relationships
- **Semantic search**: Find similar past tasks

```typescript
// Search conversation history
const results = await memory.search({
  query: "How did I implement authentication?",
  type: "hybrid",
  limit: 5
});

// Build knowledge graph
await memory.buildKnowledgeGraph(documentIds);

// Query knowledge graph
const graphResults = await memory.queryKnowledgeGraph(
  "MATCH (n:Entity) WHERE n.type = 'function' RETURN n"
);
```

### 2. Linear Integration

Automatically manage Linear issues:

```typescript
// Create issue
await orchestrator.processRequest(
  "Create a Linear issue: Implement user authentication with title 'Add OAuth login'",
  conversationId
);

// Query issues
await orchestrator.processRequest(
  "Show me all high-priority issues assigned to me",
  conversationId
);
```

### 3. Multi-Step Workflows

The boss agent automatically breaks down complex tasks:

```typescript
await orchestrator.processRequest(
  "Research Next.js 14 features, write a summary, create a Linear issue to implement App Router, and generate starter code",
  conversationId
);
```

This will:
1. Research Agent → Gather Next.js 14 information
2. Boss Agent → Synthesize summary
3. Task Manager Agent → Create Linear issue
4. Code Agent → Generate App Router starter code

## 📊 Monitoring

### Check System Status

```bash
# CLI
mcpis9 agent status

# Web API
curl http://localhost:3000/api/chat
```

Response:
```json
{
  "status": "ready",
  "agents": {
    "boss": {
      "status": "idle",
      "completedTasks": 15,
      "failedTasks": 0,
      "successRate": 1.0
    },
    "workers": {
      "code": { "status": "idle", "completedTasks": 5 },
      "research": { "status": "idle", "completedTasks": 3 },
      "task_manager": { "status": "idle", "completedTasks": 2 },
      "data": { "status": "idle", "completedTasks": 5 }
    },
    "memory": {
      "connected": true
    }
  }
}
```

## 🧪 Testing

Run agent tests:

```bash
# Test all agents
mcpis9 agent test

# Or programmatically
pnpm test
```

## 🔐 Security

- **API Keys**: Store in `.env`, never commit
- **R2R Access**: Use API keys for R2R authentication
- **Rate Limiting**: Implement rate limits in production
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Graceful degradation on failures

## 🚀 Deployment

### Docker

```bash
# Build
docker build -t mcpis9-agent-system .

# Run
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e R2R_BASE_URL=http://r2r:7272 \
  mcpis9-agent-system
```

### Vercel

```bash
# Deploy web interface
cd packages/web
vercel --prod
```

Add environment variables in Vercel dashboard.

## 📚 Documentation

- [AGENT_ARCHITECTURE.md](./AGENT_ARCHITECTURE.md) - Detailed architecture documentation
- [R2R Documentation](https://r2r-docs.sciphi.ai/) - R2R memory system docs
- [Linear API](https://linear.app/developers) - Linear integration docs

## 🤝 Contributing

Contributions are welcome! Please read the architecture docs first to understand the system design.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **R2R** by SciPhi-AI - Advanced RAG system
- **Anthropic** - Claude AI models
- **Linear** - Project management integration
- **Vercel** - AI SDK and deployment

## 📞 Support

For issues and questions:
- GitHub Issues: [eagurin/mcpis9/issues](https://github.com/eagurin/mcpis9/issues)
- Email: e.a.gurin@gmail.com

---

Built with ❤️ by Евгений
