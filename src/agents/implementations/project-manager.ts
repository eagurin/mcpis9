#!/usr/bin/env bun

import { BaseAgent, type AgentResponse, type AgentAction } from "../base-agent";
import type { AgentMetadata, AgentContext } from "../registry";

/**
 * Project Manager Agent
 * Handles project planning, resource allocation, milestone tracking, and team coordination
 */
export class ProjectManagerAgent extends BaseAgent {
  constructor(metadata: AgentMetadata, context: AgentContext) {
    super(metadata, context);
  }

  protected getRequiredPermissions(): string[] {
    return ['read', 'write', 'manage_projects'];
  }

  protected async executeTask(): Promise<AgentResponse> {
    const instructions = this.extractTaskInstructions();
    const actions: AgentAction[] = [];

    // Generate task-specific checklist
    const tasks = this.generateProjectManagerTasks(instructions);
    const completedTasks: string[] = [];

    // Initial comment with introduction and task list
    let commentBody = this.getAgentIntroduction();
    commentBody += '\n#### 📋 Project Management Tasks:\n';
    commentBody += this.formatChecklist(tasks);
    
    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'high'
    });

    // Analyze project status
    completedTasks.push('Analyze request context and requirements');
    
    // Perform project management activities
    const projectAnalysis = await this.analyzeProjectContext();
    const resourcePlan = await this.createResourcePlan();
    const timelineEstimate = await this.estimateTimeline(instructions);

    completedTasks.push('Analyze project scope and requirements');
    completedTasks.push('Create resource allocation plan');
    completedTasks.push('Estimate project timeline');

    // Update comment with progress
    commentBody = this.getAgentIntroduction();
    commentBody += '\n#### 📋 Project Management Tasks:\n';
    commentBody += this.formatChecklist(tasks, completedTasks);
    commentBody += '\n\n' + this.generateProjectReport(projectAnalysis, resourcePlan, timelineEstimate);

    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'medium'
    });

    // Handle specific PM actions
    const pmActions = await this.executeProjectManagementActions(instructions);
    actions.push(...pmActions);

    completedTasks.push('Execute project management actions');
    completedTasks.push('Update status and communicate results');

    // Final status update
    const finalComment = this.getAgentIntroduction();
    finalComment += '\n#### 📋 Project Management Tasks:\n';
    finalComment += this.formatChecklist(tasks, completedTasks);
    finalComment += '\n\n✅ **Project management analysis complete!**\n\n';
    finalComment += this.generateProjectSummary(projectAnalysis, resourcePlan, timelineEstimate);

    actions.push({
      type: 'comment',
      data: { body: finalComment },
      priority: 'high'
    });

    return this.createSuccessResponse(
      'Project management tasks completed successfully',
      actions
    );
  }

  private generateProjectManagerTasks(instructions: string): string[] {
    const baseTasks = [
      'Analyze request context and requirements',
      'Analyze project scope and requirements',
      'Create resource allocation plan',
      'Estimate project timeline',
      'Execute project management actions',
      'Update status and communicate results'
    ];

    const additionalTasks: string[] = [];

    // Add specific tasks based on instructions
    if (instructions.toLowerCase().includes('milestone')) {
      additionalTasks.push('Create milestone planning strategy');
    }
    if (instructions.toLowerCase().includes('sprint')) {
      additionalTasks.push('Plan sprint organization');
    }
    if (instructions.toLowerCase().includes('resource')) {
      additionalTasks.push('Conduct detailed resource analysis');
    }
    if (instructions.toLowerCase().includes('deadline')) {
      additionalTasks.push('Create deadline management plan');
    }
    if (instructions.toLowerCase().includes('team')) {
      additionalTasks.push('Plan team coordination strategy');
    }

    return [...baseTasks, ...additionalTasks];
  }

  private async analyzeProjectContext(): Promise<{
    scope: string;
    complexity: string;
    stakeholders: string[];
    risks: string[];
  }> {
    const { githubData, requestComplexity } = this.context;
    
    const content = [
      githubData.contextData?.title || '',
      githubData.contextData?.body || '',
      ...githubData.comments.map(c => c.body)
    ].join(' ');

    // Analyze scope
    const scopeIndicators = {
      'feature development': ['feature', 'implement', 'add', 'create'],
      'bug fixes': ['bug', 'fix', 'error', 'issue'],
      'infrastructure': ['deploy', 'infrastructure', 'setup', 'configure'],
      'documentation': ['document', 'readme', 'guide', 'docs'],
      'testing': ['test', 'qa', 'validation', 'verify']
    };

    let scope = 'general development';
    for (const [scopeType, indicators] of Object.entries(scopeIndicators)) {
      if (indicators.some(indicator => content.toLowerCase().includes(indicator))) {
        scope = scopeType;
        break;
      }
    }

    // Identify stakeholders (mentioned users)
    const stakeholders = githubData.comments
      .map(comment => comment.user?.login)
      .filter(Boolean)
      .filter((user, index, array) => array.indexOf(user) === index) as string[];

    // Identify potential risks
    const risks: string[] = [];
    if (requestComplexity === 'high') {
      risks.push('High complexity may require additional time and resources');
    }
    if (content.toLowerCase().includes('deadline')) {
      risks.push('Tight deadline constraints identified');
    }
    if (content.toLowerCase().includes('dependencies')) {
      risks.push('External dependencies may cause delays');
    }
    if (stakeholders.length > 3) {
      risks.push('Multiple stakeholders may require additional coordination');
    }

    return {
      scope,
      complexity: requestComplexity,
      stakeholders,
      risks
    };
  }

  private async createResourcePlan(): Promise<{
    recommendedTeam: string[];
    estimatedEffort: string;
    skills: string[];
  }> {
    const { requestComplexity } = this.context;
    const instructions = this.extractTaskInstructions().toLowerCase();

    // Recommend team based on task type
    const recommendedTeam: string[] = [];
    
    if (instructions.includes('development') || instructions.includes('feature')) {
      if (requestComplexity === 'high') {
        recommendedTeam.push('Senior Developer', 'Junior Developer');
      } else {
        recommendedTeam.push('Junior Developer');
      }
    }

    if (instructions.includes('review') || instructions.includes('quality')) {
      recommendedTeam.push('Code Reviewer');
    }

    if (instructions.includes('test') || instructions.includes('qa')) {
      recommendedTeam.push('QA Engineer');
    }

    if (instructions.includes('deploy') || instructions.includes('infrastructure')) {
      recommendedTeam.push('DevOps Engineer');
    }

    // Default team if none specified
    if (recommendedTeam.length === 0) {
      recommendedTeam.push('Senior Developer');
    }

    // Estimate effort
    const effortMap = {
      low: '1-2 days',
      medium: '3-5 days',
      high: '1-2 weeks'
    };
    const estimatedEffort = effortMap[requestComplexity];

    // Required skills
    const skills: string[] = [];
    if (instructions.includes('typescript') || instructions.includes('javascript')) {
      skills.push('TypeScript/JavaScript');
    }
    if (instructions.includes('react') || instructions.includes('frontend')) {
      skills.push('Frontend Development');
    }
    if (instructions.includes('backend') || instructions.includes('api')) {
      skills.push('Backend Development');
    }
    if (instructions.includes('database')) {
      skills.push('Database Design');
    }
    if (instructions.includes('devops') || instructions.includes('deployment')) {
      skills.push('DevOps/Infrastructure');
    }

    return {
      recommendedTeam,
      estimatedEffort,
      skills
    };
  }

  private async estimateTimeline(instructions: string): Promise<{
    phases: Array<{ name: string; duration: string; dependencies: string[] }>;
    totalDuration: string;
    criticalPath: string[];
  }> {
    const { requestComplexity } = this.context;

    // Define phases based on task type
    const phases = [
      {
        name: 'Requirements Analysis',
        duration: requestComplexity === 'high' ? '1 day' : '0.5 day',
        dependencies: []
      },
      {
        name: 'Design & Planning',
        duration: requestComplexity === 'high' ? '2 days' : '1 day',
        dependencies: ['Requirements Analysis']
      },
      {
        name: 'Implementation',
        duration: requestComplexity === 'high' ? '5-7 days' : requestComplexity === 'medium' ? '2-3 days' : '1-2 days',
        dependencies: ['Design & Planning']
      },
      {
        name: 'Code Review',
        duration: '1 day',
        dependencies: ['Implementation']
      },
      {
        name: 'Testing',
        duration: requestComplexity === 'high' ? '2 days' : '1 day',
        dependencies: ['Code Review']
      }
    ];

    // Add deployment phase if needed
    if (instructions.toLowerCase().includes('deploy')) {
      phases.push({
        name: 'Deployment',
        duration: '0.5 day',
        dependencies: ['Testing']
      });
    }

    const totalDurationMap = {
      low: '3-5 days',
      medium: '6-8 days',
      high: '10-14 days'
    };

    const totalDuration = totalDurationMap[requestComplexity];
    const criticalPath = phases.map(phase => phase.name);

    return {
      phases,
      totalDuration,
      criticalPath
    };
  }

  private async executeProjectManagementActions(instructions: string): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    // Create labels for project organization
    if (instructions.toLowerCase().includes('organize') || 
        instructions.toLowerCase().includes('structure')) {
      actions.push({
        type: 'label',
        data: {
          labels: ['project:in-progress', 'priority:medium', 'type:feature']
        },
        priority: 'medium'
      });
    }

    // Assign team members
    if (instructions.toLowerCase().includes('assign') || 
        instructions.toLowerCase().includes('team')) {
      const resourcePlan = await this.createResourcePlan();
      actions.push({
        type: 'assign',
        data: {
          assignees: resourcePlan.recommendedTeam,
          reason: 'Based on project requirements and complexity analysis'
        },
        priority: 'high'
      });
    }

    return actions;
  }

  private generateProjectReport(
    analysis: any,
    resourcePlan: any,
    timeline: any
  ): string {
    return `
### 📊 Project Analysis Report

#### Project Scope
- **Type**: ${analysis.scope}
- **Complexity**: ${analysis.complexity}
- **Identified Risks**: ${analysis.risks.length > 0 ? analysis.risks.join(', ') : 'None identified'}

#### Resource Plan
- **Recommended Team**: ${resourcePlan.recommendedTeam.join(', ')}
- **Estimated Effort**: ${resourcePlan.estimatedEffort}
- **Required Skills**: ${resourcePlan.skills.length > 0 ? resourcePlan.skills.join(', ') : 'General development skills'}

#### Timeline Estimate
- **Total Duration**: ${timeline.totalDuration}
- **Key Phases**: ${timeline.phases.map(p => `${p.name} (${p.duration})`).join(' → ')}
`;
  }

  private generateProjectSummary(
    analysis: any,
    resourcePlan: any,
    timeline: any
  ): string {
    return `
### 📈 Project Management Summary

**Scope**: ${analysis.scope} (${analysis.complexity} complexity)
**Team**: ${resourcePlan.recommendedTeam.join(', ')}
**Timeline**: ${timeline.totalDuration}
**Next Steps**: Proceed with ${timeline.phases[1]?.name || 'implementation'} phase

**Recommendations**:
${analysis.risks.length > 0 ? `- Address identified risks: ${analysis.risks.join(', ')}` : '- No major risks identified'}
- Ensure team members have required skills: ${resourcePlan.skills.join(', ')}
- Regular status updates recommended for ${analysis.complexity} complexity projects
`;
  }
}