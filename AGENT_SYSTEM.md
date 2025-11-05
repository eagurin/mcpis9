# Advanced Agent System with Boss Orchestration

## Overview

This document describes the advanced agent system implemented in mcpis9 with Boss Agent orchestration and R2R memory integration.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Boss Agent                            │
│                     (Orchestrator)                          │
│                                                             │
│  • Task Decomposition                                       │
│  • Agent Coordination                                       │
│  • Result Aggregation                                       │
│  • Strategic Planning                                       │
└─────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Code Agent   │  │Research Agent│  │Analysis Agent│
│              │  │              │  │              │
│ Programming  │  │ Information  │  │ Data Analysis│
│ Debugging    │  │ Gathering    │  │ Insights     │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐
│Creative Agent│  │ DevOps Agent │
│              │  │              │
│ Content      │  │Infrastructure│
│ Creation     │  │ Deployment   │
└──────────────┘  └──────────────┘
```

### Memory System

```
┌─────────────────────────────────────────────────────────────┐
│                     Memory Manager                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │  Short-term     │  │   Long-term      │  │  Working   ││
│  │  Memory         │  │   Memory (R2R)   │  │  Memory    ││
│  │                 │  │                  │  │            ││
│  │ • Recent msgs   │  │ • Document store │  │ • Task vars││
│  │ • Context       │  │ • RAG search     │  │ • Temp data││
│  │ • Auto-prune    │  │ • Embeddings     │  │            ││
│  └─────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Implementation Details

### Package Structure

```
packages/agents/
├── src/
│   ├── agents/
│   │   ├── base-agent.ts          # Base class for all agents
│   │   ├── boss-agent.ts          # Boss orchestrator
│   │   └── workers/
│   │       ├── code-agent.ts      # Code generation & debugging
│   │       ├── research-agent.ts  # Information gathering
│   │       ├── analysis-agent.ts  # Data analysis
│   │       ├── creative-agent.ts  # Content creation
│   │       └── devops-agent.ts    # Infrastructure & deployment
│   ├── memory/
│   │   ├── r2r-client.ts          # R2R API client
│   │   └── memory-manager.ts      # Memory coordination
│   ├── tools/
│   │   └── tool-registry.ts       # Tool system
│   ├── orchestrator.ts            # Main entry point
│   └── index.ts                   # Public API
```

### Key Features

#### 1. Boss Agent Orchestration

The Boss Agent implements sophisticated task orchestration:

- **Task Decomposition**: Breaks complex tasks into manageable subtasks
- **Agent Assignment**: Routes subtasks to the most suitable specialist agent
- **Dependency Management**: Handles task dependencies and execution order
- **Result Aggregation**: Combines results from multiple agents
- **Synthesis**: Creates coherent final responses

#### 2. Specialized Worker Agents

Each worker agent has a specific domain of expertise:

**Code Agent**
- Language: Multiple programming languages
- Focus: Clean, maintainable, tested code
- Tools: Code execution, file operations

**Research Agent**
- Focus: Information gathering and verification
- Tools: Search, memory retrieval
- Output: Well-researched, cited information

**Analysis Agent**
- Focus: Pattern recognition and insights
- Approach: Data-driven conclusions
- Output: Actionable recommendations

**Creative Agent**
- Focus: Original content creation
- Approach: Innovative thinking
- Output: Engaging, creative content

**DevOps Agent**
- Focus: Infrastructure and operations
- Approach: Scalability and reliability
- Output: Production-ready solutions

#### 3. R2R Memory Integration

Advanced memory system with RAG capabilities:

- **Document Indexing**: Automatic indexing of important information
- **Semantic Search**: Find relevant context using embeddings
- **Hybrid Search**: Combines semantic and keyword search
- **Knowledge Graphs**: Entity and relationship extraction
- **Multi-modal**: Supports various content types

#### 4. Tool System

Extensible tool framework:

- **Built-in Tools**: Search, code execution, file operations, API calls
- **Custom Tools**: Easy registration of new tools
- **Parameter Validation**: Automatic validation of tool inputs
- **Execution Tracking**: Complete audit trail of tool usage

## Usage Examples

### 1. Simple Task via Boss Agent

```typescript
const orchestrator = new AgentOrchestrator();

const result = await orchestrator.executeTask(
  'Create a REST API for managing tasks'
);
```

**What happens:**
1. Boss Agent analyzes the request
2. Decomposes into subtasks:
   - Design API structure (Analysis Agent)
   - Implement endpoints (Code Agent)
   - Plan deployment (DevOps Agent)
3. Coordinates execution
4. Aggregates and synthesizes results

### 2. Direct Worker Usage

```typescript
const result = await orchestrator.executeWithWorker(
  'research',
  'Find information about Next.js 15 features'
);
```

### 3. With Requirements

```typescript
const result = await orchestrator.executeTask(
  'Build a user authentication system',
  [
    'Use JWT tokens',
    'Include refresh tokens',
    'Add rate limiting',
    'Implement 2FA',
  ]
);
```

### 4. CLI Usage

```bash
# List available agents
mcpis9 agent --list

# Execute task via Boss Agent
mcpis9 agent --task "Create a TypeScript library for date manipulation"

# Execute via specific worker
mcpis9 agent --worker code --task "Implement bubble sort in Python"

# With requirements
mcpis9 agent --task "Build REST API" \
  --requirements "Use Express" "Add Swagger docs" "Include tests"
```

### 5. Web API Usage

```javascript
// POST /api/agents
const response = await fetch('/api/agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'Analyze user engagement metrics',
    requirements: ['Focus on retention', 'Identify trends'],
  }),
});

const { result } = await response.json();
```

## Configuration

### Environment Variables

```bash
# R2R Configuration
ENABLE_R2R=true
R2R_API_URL=http://localhost:8000
R2R_API_KEY=your-api-key

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
```

### Programmatic Configuration

```typescript
const config: OrchestratorConfig = {
  enableR2R: true,
  r2rConfig: {
    apiUrl: 'http://localhost:8000',
    apiKey: 'your-api-key',
    collectionId: 'mcpis9-memory',
    embeddingModel: 'text-embedding-3-small',
  },
  maxShortTermMemory: 100,
};

const orchestrator = new AgentOrchestrator(config);
```

## Development

### Adding a New Worker Agent

1. Create agent class extending `BaseAgent`:

```typescript
export class CustomAgent extends BaseAgent {
  protected async processTask(
    task: AgentTask,
    context: string
  ): Promise<AgentTaskResult> {
    // Your implementation
  }
}
```

2. Register in orchestrator:

```typescript
const agent = new CustomAgent(role, memory, toolRegistry);
orchestrator.getBossAgent().registerWorker(agent);
```

### Adding a New Tool

```typescript
toolRegistry.registerTool(
  {
    name: 'my_tool',
    type: 'custom',
    description: 'Does something useful',
    parameters: [/* ... */],
    returnType: 'string',
    handler: 'myToolHandler',
  },
  async (params) => {
    // Implementation
    return result;
  }
);
```

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Test specific agent
npm test -- code-agent.test.ts
```

## Performance Considerations

### Memory Management

- Short-term memory auto-prunes at 80% capacity
- Long-term memory uses R2R for efficient retrieval
- Working memory cleared after task completion

### Parallel Execution

- Boss Agent can execute independent subtasks in parallel
- Dependency resolution ensures correct execution order
- Timeout protection for long-running tasks

### Scalability

- Stateless agent design allows horizontal scaling
- R2R provides distributed memory
- Tool execution can be sandboxed

## Best Practices

### 1. Task Description

Be specific and clear:
```typescript
// Good
"Create a REST API with Express.js for user management,
including CRUD operations, authentication, and validation"

// Bad
"Make an API"
```

### 2. Requirements

Provide concrete requirements:
```typescript
requirements: [
  'Use TypeScript',
  'Include unit tests',
  'Add input validation',
  'Document with JSDoc',
]
```

### 3. Memory Usage

Store important context:
```typescript
await memoryManager.summarizeAndStore(
  agentId,
  taskId,
  'Key decision: Using PostgreSQL for persistence',
  ['database', 'architecture']
);
```

### 4. Error Handling

Always check task results:
```typescript
const result = await orchestrator.executeTask(description);

if (!result.success) {
  console.error('Task failed:', result.error);
  // Handle failure
}
```

## Troubleshooting

### R2R Connection Issues

```bash
# Check R2R health
mcpis9 agent --status

# Test R2R directly
curl http://localhost:8000/health
```

### Agent Not Responding

1. Check agent status: `mcpis9 agent --status`
2. Review logs for errors
3. Verify API keys are set
4. Check memory limits

### Poor Task Results

1. Improve task description clarity
2. Add more specific requirements
3. Use appropriate worker agent directly
4. Review agent's system prompt

## Future Enhancements

### Planned Features

- [ ] LLM provider integration (Claude, OpenAI, Gemini)
- [ ] Streaming responses
- [ ] Tool sandboxing and security
- [ ] Agent collaboration protocols
- [ ] Learning from feedback
- [ ] Multi-turn conversations
- [ ] Custom agent plugins
- [ ] Performance metrics dashboard

### Research Areas

- Improved task decomposition algorithms
- Agent learning and adaptation
- Automated tool discovery
- Cross-agent knowledge sharing
- Efficiency optimizations

## References

- [Orchestrator-Workers Pattern](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [R2R Documentation](https://r2r-docs.sciphi.ai/)
- [Multi-Agent Systems](https://github.com/awslabs/multi-agent-orchestrator)
- [RAG Best Practices](https://www.anthropic.com/research/contextual-retrieval)

## License

MIT

## Contributing

Contributions welcome! See CONTRIBUTING.md for guidelines.
