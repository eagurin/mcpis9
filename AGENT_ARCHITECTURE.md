# Boss Agent System Architecture

## Overview

This document describes the advanced multi-agent system with R2R memory integration for mcpis9.

## Architecture Pattern: Centralized Orchestration (Boss Agent)

```
┌─────────────────────────────────────────────────────────────┐
│                        Boss Agent                           │
│  (Orchestrator - Analyzes, Plans, Delegates, Coordinates)  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├──────┬──────────┬──────────┬─────────────┐
                  │      │          │          │             │
           ┌──────▼───┐ ┌▼────────┐┌▼────────┐┌▼───────────┐│
           │   Code   │ │Research ││  Task   ││   Data     ││
           │  Agent   │ │ Agent   ││ Manager ││   Agent    ││
           └──────────┘ └─────────┘└─────────┘└────────────┘│
                  │                                           │
                  │      ┌────────────────────────────────────┘
                  │      │
           ┌──────▼──────▼──────┐
           │   R2R Memory Layer  │
           │ (RAG + Knowledge    │
           │  Graphs + Semantic  │
           │      Search)        │
           └─────────┬───────────┘
                     │
           ┌─────────▼───────────┐
           │  Persistence Layer  │
           │  (SQLite + Prisma)  │
           └─────────────────────┘
```

## Core Components

### 1. Boss Agent (Orchestrator)

**Responsibilities:**
- Analyze user requests and determine intent
- Break down complex tasks into subtasks
- Delegate subtasks to appropriate worker agents
- Coordinate multi-agent workflows
- Aggregate results from workers
- Maintain conversation context via R2R
- Make high-level decisions

**Capabilities:**
- Natural language understanding
- Task decomposition
- Agent selection and routing
- Workflow orchestration
- Error handling and recovery
- Context management with R2R memory

**Implementation:** `BossAgent` class in `packages/shared/src/agents/boss-agent.ts`

### 2. Worker Agents

#### 2.1 Code Agent
**Specialization:** Software development tasks
- Code generation and modification
- Refactoring and optimization
- Bug fixing and debugging
- Code review and analysis
- Documentation generation

#### 2.2 Research Agent
**Specialization:** Information gathering
- Web search and synthesis
- Documentation lookup
- Knowledge base queries via R2R
- Technical research
- Comparative analysis

#### 2.3 Task Manager Agent
**Specialization:** Project management
- Linear integration
- Issue creation and tracking
- Project planning
- Sprint management
- Status reporting

#### 2.4 Data Agent
**Specialization:** Data operations
- Database queries
- Data analysis
- Report generation
- Data transformation
- ETL operations

### 3. R2R Memory Layer

**Features:**
- **Multimodal Ingestion**: Process documents, code, images
- **Hybrid Search**: Semantic + keyword search with RRF
- **Knowledge Graphs**: Automatic entity/relationship extraction
- **Agentic RAG**: Reasoning + retrieval
- **Deep Research**: Multi-step reasoning

**Use Cases:**
- Store conversation history
- Build knowledge base from interactions
- Semantic search across past conversations
- Context retrieval for agent decisions
- Long-term memory across sessions

**Implementation:** `R2RMemoryService` in `packages/shared/src/services/r2r-memory.service.ts`

### 4. Communication Protocol

**Agent Message Format:**
```typescript
interface AgentMessage {
  id: string;
  from: AgentType;
  to: AgentType;
  type: 'request' | 'response' | 'notification';
  content: any;
  metadata: {
    timestamp: number;
    priority: 'low' | 'medium' | 'high';
    correlationId?: string;
  };
}
```

**Workflow Pattern:**
1. User → Boss Agent: User request
2. Boss Agent → R2R: Retrieve context
3. Boss Agent → Boss Agent: Analyze + plan
4. Boss Agent → Worker Agent(s): Delegate subtasks
5. Worker Agent(s) → R2R: Query knowledge
6. Worker Agent(s) → Boss Agent: Return results
7. Boss Agent → R2R: Store interaction
8. Boss Agent → User: Synthesized response

### 5. Linear Integration

**Capabilities:**
- Create/update/close issues
- Manage projects and cycles
- Track progress
- Workflow automation
- Team coordination

**Implementation:** Via Linear SDK in Task Manager Agent

### 6. Persistence Strategy

**Structured Data (SQLite + Prisma):**
- User accounts and sessions
- Agent configurations
- Task history
- Metrics and analytics

**Unstructured Data (R2R):**
- Conversation transcripts
- Code snippets
- Research findings
- Knowledge graphs

## Orchestration Patterns

### Pattern 1: Simple Delegation
```
User Request → Boss → Single Worker → Boss → User
```

### Pattern 2: Parallel Execution
```
User Request → Boss → Worker1
                   → Worker2  → Boss → User
                   → Worker3
```

### Pattern 3: Sequential Pipeline
```
User Request → Boss → Worker1 → Worker2 → Worker3 → Boss → User
```

### Pattern 4: Conditional Branching
```
User Request → Boss → Analyze
                    → If Code: Code Agent
                    → If Research: Research Agent
                    → If Task: Task Manager
                    → Boss → User
```

### Pattern 5: Iterative Refinement
```
User Request → Boss → Worker → Evaluate → If OK: Done
                              ↓               ↓
                              Refine ← Not OK ←
```

## Error Handling

**Strategies:**
1. **Retry with exponential backoff** for transient failures
2. **Fallback agents** if primary agent fails
3. **Graceful degradation** (e.g., no R2R → use local memory)
4. **Error reporting** to Boss for decision
5. **Context preservation** during failures

## Scalability Considerations

**Current Phase (MVP):**
- Single Boss Agent instance
- 4 Worker Agent types
- Local R2R deployment
- SQLite database

**Future Phases:**
- Multiple Boss Agents (load balancing)
- Worker Agent pools
- Distributed R2R cluster
- PostgreSQL for production
- Redis for caching

## Configuration

**Environment Variables:**
```env
# R2R Configuration
R2R_BASE_URL=http://localhost:7272
R2R_API_KEY=your_api_key

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# Linear Integration
LINEAR_API_KEY=lin_api_...
LINEAR_TEAM_ID=...

# Database
DATABASE_URL=file:./dev.db
```

## Development Roadmap

### Phase 1: Foundation (Current)
- ✅ Boss Agent core implementation
- ✅ Basic worker agents
- ✅ R2R memory integration
- ✅ Message protocol
- ✅ Simple orchestration patterns

### Phase 2: Enhancement
- Linear integration
- Advanced orchestration patterns
- Error recovery mechanisms
- Performance optimization

### Phase 3: Production
- Multi-tenancy support
- Rate limiting and quotas
- Monitoring and observability
- CI/CD pipeline
- Security hardening

## Testing Strategy

**Unit Tests:**
- Individual agent logic
- Message serialization
- R2R client operations

**Integration Tests:**
- Boss → Worker communication
- R2R memory operations
- Linear API integration

**End-to-End Tests:**
- Complete user workflows
- Multi-agent orchestration
- Error scenarios

## Security Considerations

1. **API Key Management**: Secure storage, rotation
2. **Access Control**: Role-based agent permissions
3. **Data Privacy**: Encryption at rest and in transit
4. **Input Validation**: Sanitize user inputs
5. **Rate Limiting**: Prevent abuse
6. **Audit Logging**: Track all agent actions

## Monitoring and Observability

**Metrics:**
- Agent response times
- Task success/failure rates
- R2R query performance
- API usage and costs

**Logging:**
- All agent interactions
- Error traces
- Decision explanations
- Performance bottlenecks

**Dashboards:**
- Real-time agent status
- Task queue depth
- Resource utilization
- User satisfaction scores

## References

- [R2R Documentation](https://r2r-docs.sciphi.ai/)
- [Linear Agent Best Practices](https://linear.app/developers/agent-best-practices)
- [Azure AI Agent Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
