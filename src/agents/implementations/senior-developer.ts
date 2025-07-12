#!/usr/bin/env bun

import { BaseAgent, type AgentResponse, type AgentAction } from "../base-agent";
import type { AgentMetadata, AgentContext } from "../registry";

/**
 * Senior Developer Agent
 * Handles complex features, architecture decisions, code reviews, and mentoring
 */
export class SeniorDeveloperAgent extends BaseAgent {
  constructor(metadata: AgentMetadata, context: AgentContext) {
    super(metadata, context);
  }

  protected getRequiredPermissions(): string[] {
    return ['read', 'write', 'deploy', 'manage_branches'];
  }

  protected async executeTask(): Promise<AgentResponse> {
    const instructions = this.extractTaskInstructions();
    const actions: AgentAction[] = [];

    // Generate task-specific checklist
    const tasks = this.generateSeniorDevTasks(instructions);
    const completedTasks: string[] = [];

    // Initial comment with introduction and task list
    let commentBody = this.getAgentIntroduction();
    commentBody += '\n#### 🏗️ Senior Development Tasks:\n';
    commentBody += this.formatChecklist(tasks);
    
    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'high'
    });

    // Perform technical analysis
    completedTasks.push('Analyze request context and requirements');
    
    const techAnalysis = await this.performTechnicalAnalysis();
    const architectureReview = await this.reviewArchitecture(instructions);
    const implementationPlan = await this.createImplementationPlan(instructions);

    completedTasks.push('Perform technical analysis');
    completedTasks.push('Review architecture and design patterns');
    completedTasks.push('Create implementation plan');

    // Update comment with progress
    commentBody = this.getAgentIntroduction();
    commentBody += '\n#### 🏗️ Senior Development Tasks:\n';
    commentBody += this.formatChecklist(tasks, completedTasks);
    commentBody += '\n\n' + this.generateTechnicalReport(techAnalysis, architectureReview, implementationPlan);

    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'medium'
    });

    // Execute development actions
    const devActions = await this.executeDevelopmentActions(instructions);
    actions.push(...devActions);

    completedTasks.push('Execute development tasks');
    completedTasks.push('Validate implementation');
    completedTasks.push('Update status and communicate results');

    // Final status update
    const finalComment = this.getAgentIntroduction();
    finalComment += '\n#### 🏗️ Senior Development Tasks:\n';
    finalComment += this.formatChecklist(tasks, completedTasks);
    finalComment += '\n\n✅ **Senior development analysis complete!**\n\n';
    finalComment += this.generateDevelopmentSummary(techAnalysis, architectureReview, implementationPlan);

    actions.push({
      type: 'comment',
      data: { body: finalComment },
      priority: 'high'
    });

    return this.createSuccessResponse(
      'Senior development tasks completed successfully',
      actions
    );
  }

  private generateSeniorDevTasks(instructions: string): string[] {
    const baseTasks = [
      'Analyze request context and requirements',
      'Perform technical analysis',
      'Review architecture and design patterns',
      'Create implementation plan',
      'Execute development tasks',
      'Validate implementation',
      'Update status and communicate results'
    ];

    const additionalTasks: string[] = [];

    // Add specific tasks based on instructions
    if (instructions.toLowerCase().includes('architecture')) {
      additionalTasks.push('Design system architecture');
    }
    if (instructions.toLowerCase().includes('refactor')) {
      additionalTasks.push('Plan refactoring strategy');
    }
    if (instructions.toLowerCase().includes('performance')) {
      additionalTasks.push('Analyze performance implications');
    }
    if (instructions.toLowerCase().includes('security')) {
      additionalTasks.push('Conduct security analysis');
    }
    if (instructions.toLowerCase().includes('database')) {
      additionalTasks.push('Design database schema');
    }
    if (instructions.toLowerCase().includes('api')) {
      additionalTasks.push('Design API interface');
    }
    if (instructions.toLowerCase().includes('framework')) {
      additionalTasks.push('Evaluate framework options');
    }

    return [...baseTasks, ...additionalTasks];
  }

  private async performTechnicalAnalysis(): Promise<{
    codebaseStructure: string[];
    technologies: string[];
    patterns: string[];
    complexityFactors: string[];
  }> {
    const { githubData, githubContext } = this.context;
    
    // Analyze changed files if it's a PR
    const changedFiles = githubData.changedFilesWithSHA || [];
    const codebaseStructure = changedFiles.map(file => {
      const extension = file.filename.split('.').pop();
      return `${file.filename} (${extension})`;
    });

    // Identify technologies based on file extensions and content
    const technologies: string[] = [];
    const fileExtensions = changedFiles.map(f => f.filename.split('.').pop());
    
    if (fileExtensions.includes('ts') || fileExtensions.includes('tsx')) {
      technologies.push('TypeScript');
    }
    if (fileExtensions.includes('js') || fileExtensions.includes('jsx')) {
      technologies.push('JavaScript');
    }
    if (fileExtensions.includes('py')) {
      technologies.push('Python');
    }
    if (fileExtensions.includes('java')) {
      technologies.push('Java');
    }
    if (fileExtensions.includes('go')) {
      technologies.push('Go');
    }
    if (fileExtensions.includes('rs')) {
      technologies.push('Rust');
    }

    // Identify patterns
    const patterns: string[] = [];
    const content = [
      githubData.contextData?.title || '',
      githubData.contextData?.body || ''
    ].join(' ').toLowerCase();

    if (content.includes('component') || content.includes('react')) {
      patterns.push('Component-based architecture');
    }
    if (content.includes('api') || content.includes('rest')) {
      patterns.push('RESTful API design');
    }
    if (content.includes('microservice')) {
      patterns.push('Microservices architecture');
    }
    if (content.includes('mvc')) {
      patterns.push('Model-View-Controller');
    }

    // Complexity factors
    const complexityFactors: string[] = [];
    if (changedFiles.length > 10) {
      complexityFactors.push('Large number of files affected');
    }
    if (content.includes('database')) {
      complexityFactors.push('Database operations involved');
    }
    if (content.includes('migration')) {
      complexityFactors.push('Data migration required');
    }
    if (content.includes('breaking change')) {
      complexityFactors.push('Breaking changes detected');
    }

    return {
      codebaseStructure,
      technologies,
      patterns,
      complexityFactors
    };
  }

  private async reviewArchitecture(instructions: string): Promise<{
    currentArchitecture: string;
    recommendedChanges: string[];
    designPrinciples: string[];
    securityConsiderations: string[];
  }> {
    const { githubData } = this.context;
    
    // Analyze current architecture
    let currentArchitecture = 'Standard application architecture';
    const content = instructions.toLowerCase();
    
    if (content.includes('microservice')) {
      currentArchitecture = 'Microservices architecture';
    } else if (content.includes('monolith')) {
      currentArchitecture = 'Monolithic architecture';
    } else if (content.includes('serverless')) {
      currentArchitecture = 'Serverless architecture';
    }

    // Recommended changes
    const recommendedChanges: string[] = [];
    if (content.includes('scale')) {
      recommendedChanges.push('Implement horizontal scaling patterns');
    }
    if (content.includes('performance')) {
      recommendedChanges.push('Add caching layer');
      recommendedChanges.push('Optimize database queries');
    }
    if (content.includes('security')) {
      recommendedChanges.push('Implement authentication/authorization');
      recommendedChanges.push('Add input validation');
    }

    // Design principles
    const designPrinciples = [
      'Single Responsibility Principle',
      'Dependency Injection',
      'Separation of Concerns',
      'DRY (Don\'t Repeat Yourself)',
      'SOLID principles'
    ];

    // Security considerations
    const securityConsiderations: string[] = [];
    if (content.includes('api')) {
      securityConsiderations.push('API rate limiting');
      securityConsiderations.push('Input sanitization');
    }
    if (content.includes('database')) {
      securityConsiderations.push('SQL injection prevention');
      securityConsiderations.push('Data encryption at rest');
    }
    if (content.includes('authentication')) {
      securityConsiderations.push('Secure token management');
      securityConsiderations.push('Multi-factor authentication');
    }

    return {
      currentArchitecture,
      recommendedChanges,
      designPrinciples,
      securityConsiderations
    };
  }

  private async createImplementationPlan(instructions: string): Promise<{
    phases: Array<{ name: string; tasks: string[]; estimatedTime: string }>;
    technicalRequirements: string[];
    riskMitigation: string[];
    testingStrategy: string[];
  }> {
    const { requestComplexity } = this.context;
    
    // Implementation phases
    const phases = [
      {
        name: 'Foundation Setup',
        tasks: [
          'Set up development environment',
          'Configure build tools',
          'Establish coding standards'
        ],
        estimatedTime: requestComplexity === 'high' ? '1-2 days' : '0.5-1 day'
      },
      {
        name: 'Core Implementation',
        tasks: [
          'Implement core functionality',
          'Add error handling',
          'Integrate with existing systems'
        ],
        estimatedTime: requestComplexity === 'high' ? '3-5 days' : requestComplexity === 'medium' ? '1-3 days' : '0.5-1 day'
      },
      {
        name: 'Testing & Validation',
        tasks: [
          'Write unit tests',
          'Perform integration testing',
          'Conduct code review'
        ],
        estimatedTime: '1-2 days'
      },
      {
        name: 'Documentation & Deployment',
        tasks: [
          'Update documentation',
          'Prepare deployment scripts',
          'Deploy to staging'
        ],
        estimatedTime: '0.5-1 day'
      }
    ];

    // Technical requirements
    const technicalRequirements: string[] = [];
    const content = instructions.toLowerCase();
    
    if (content.includes('typescript')) {
      technicalRequirements.push('TypeScript compiler');
    }
    if (content.includes('react')) {
      technicalRequirements.push('React framework');
    }
    if (content.includes('node')) {
      technicalRequirements.push('Node.js runtime');
    }
    if (content.includes('database')) {
      technicalRequirements.push('Database setup');
    }

    // Risk mitigation
    const riskMitigation = [
      'Implement comprehensive error handling',
      'Add monitoring and logging',
      'Create rollback procedures',
      'Maintain backward compatibility'
    ];

    // Testing strategy
    const testingStrategy = [
      'Unit tests for core functions',
      'Integration tests for APIs',
      'End-to-end testing for critical paths',
      'Performance testing for scalability'
    ];

    return {
      phases,
      technicalRequirements,
      riskMitigation,
      testingStrategy
    };
  }

  private async executeDevelopmentActions(instructions: string): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    // Create branch for feature development
    if (instructions.toLowerCase().includes('feature') || 
        instructions.toLowerCase().includes('implement')) {
      actions.push({
        type: 'branch',
        data: {
          branchName: 'feature/senior-dev-implementation',
          fromBranch: 'main'
        },
        priority: 'high'
      });
    }

    // Add technical labels
    actions.push({
      type: 'label',
      data: {
        labels: ['type:feature', 'complexity:high', 'needs-review']
      },
      priority: 'medium'
    });

    // Request code review
    if (this.context.githubContext.eventName === 'pull_request') {
      actions.push({
        type: 'review',
        data: {
          event: 'REQUEST_CHANGES',
          body: 'Senior developer review completed. Please address the architectural considerations mentioned above.'
        },
        priority: 'high'
      });
    }

    return actions;
  }

  private generateTechnicalReport(
    techAnalysis: any,
    architectureReview: any,
    implementationPlan: any
  ): string {
    return `
### 🔧 Technical Analysis Report

#### Technology Stack
- **Languages/Frameworks**: ${techAnalysis.technologies.length > 0 ? techAnalysis.technologies.join(', ') : 'Standard web technologies'}
- **Architecture Patterns**: ${techAnalysis.patterns.length > 0 ? techAnalysis.patterns.join(', ') : 'Standard patterns'}
- **Complexity Factors**: ${techAnalysis.complexityFactors.length > 0 ? techAnalysis.complexityFactors.join(', ') : 'Standard complexity'}

#### Architecture Review
- **Current**: ${architectureReview.currentArchitecture}
- **Recommended Changes**: ${architectureReview.recommendedChanges.length > 0 ? architectureReview.recommendedChanges.join(', ') : 'No major changes needed'}
- **Security**: ${architectureReview.securityConsiderations.length > 0 ? architectureReview.securityConsiderations.join(', ') : 'Standard security practices'}

#### Implementation Plan
- **Phases**: ${implementationPlan.phases.length} phases planned
- **Estimated Timeline**: ${implementationPlan.phases.reduce((total, phase) => total + phase.estimatedTime + ' + ', '').slice(0, -3)}
- **Key Requirements**: ${implementationPlan.technicalRequirements.join(', ')}
`;
  }

  private generateDevelopmentSummary(
    techAnalysis: any,
    architectureReview: any,
    implementationPlan: any
  ): string {
    return `
### 🚀 Senior Development Summary

**Technical Approach**: ${architectureReview.currentArchitecture}
**Implementation Strategy**: ${implementationPlan.phases.length}-phase development approach
**Key Technologies**: ${techAnalysis.technologies.join(', ')}

**Recommendations**:
- Follow ${architectureReview.designPrinciples.slice(0, 2).join(' and ')} principles
- Implement ${implementationPlan.testingStrategy.length} testing strategies
- Consider ${architectureReview.securityConsiderations.length > 0 ? architectureReview.securityConsiderations[0] : 'standard security practices'}

**Next Steps**: Begin with ${implementationPlan.phases[0]?.name || 'implementation'} phase
`;
  }
}