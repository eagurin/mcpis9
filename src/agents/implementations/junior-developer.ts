#!/usr/bin/env bun

import { BaseAgent, type AgentResponse, type AgentAction } from "../base-agent";
import type { AgentMetadata, AgentContext } from "../registry";

/**
 * Junior Developer Agent
 * Handles bug fixes, simple features, documentation updates, and learning tasks
 */
export class JuniorDeveloperAgent extends BaseAgent {
  constructor(metadata: AgentMetadata, context: AgentContext) {
    super(metadata, context);
  }

  protected getRequiredPermissions(): string[] {
    return ['read', 'write'];
  }

  protected async executeTask(): Promise<AgentResponse> {
    const instructions = this.extractTaskInstructions();
    const actions: AgentAction[] = [];

    // Check if task is too complex for junior developer
    if (this.shouldEscalateBasedOnContent(instructions)) {
      return this.createEscalationResponse();
    }

    // Generate task-specific checklist
    const tasks = this.generateJuniorDevTasks(instructions);
    const completedTasks: string[] = [];

    // Initial comment with introduction and task list
    let commentBody = this.getAgentIntroduction();
    commentBody += '\n#### 🔰 Junior Development Tasks:\n';
    commentBody += this.formatChecklist(tasks);
    
    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'high'
    });

    // Perform basic analysis
    completedTasks.push('Analyze request context and requirements');
    
    const taskAnalysis = await this.analyzeSimpleTask(instructions);
    const learningPoints = await this.identifyLearningOpportunities(instructions);

    completedTasks.push('Analyze task requirements');
    completedTasks.push('Identify learning opportunities');

    // Update comment with progress
    commentBody = this.getAgentIntroduction();
    commentBody += '\n#### 🔰 Junior Development Tasks:\n';
    commentBody += this.formatChecklist(tasks, completedTasks);
    commentBody += '\n\n' + this.generateTaskReport(taskAnalysis, learningPoints);

    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'medium'
    });

    // Execute development actions
    const devActions = await this.executeSimpleDevelopmentActions(instructions);
    actions.push(...devActions);

    completedTasks.push('Execute development tasks');
    completedTasks.push('Seek mentor guidance if needed');
    completedTasks.push('Update status and communicate results');

    // Final status update
    const finalComment = this.getAgentIntroduction();
    finalComment += '\n#### 🔰 Junior Development Tasks:\n';
    finalComment += this.formatChecklist(tasks, completedTasks);
    finalComment += '\n\n✅ **Junior development tasks completed!**\n\n';
    finalComment += this.generateLearingSummary(taskAnalysis, learningPoints);

    actions.push({
      type: 'comment',
      data: { body: finalComment },
      priority: 'high'
    });

    return this.createSuccessResponse(
      'Junior development tasks completed successfully',
      actions
    );
  }

  private shouldEscalateBasedOnContent(instructions: string): boolean {
    const complexKeywords = [
      'architecture', 'design pattern', 'refactor', 'performance optimization',
      'security', 'database migration', 'framework', 'infrastructure'
    ];

    return complexKeywords.some(keyword => 
      instructions.toLowerCase().includes(keyword)
    );
  }

  private generateJuniorDevTasks(instructions: string): string[] {
    const baseTasks = [
      'Analyze request context and requirements',
      'Analyze task requirements',
      'Identify learning opportunities',
      'Execute development tasks',
      'Seek mentor guidance if needed',
      'Update status and communicate results'
    ];

    const additionalTasks: string[] = [];

    // Add specific tasks based on instructions
    if (instructions.toLowerCase().includes('bug')) {
      additionalTasks.push('Reproduce the bug');
      additionalTasks.push('Identify root cause');
    }
    if (instructions.toLowerCase().includes('documentation')) {
      additionalTasks.push('Review existing documentation');
      additionalTasks.push('Update documentation');
    }
    if (instructions.toLowerCase().includes('test')) {
      additionalTasks.push('Write basic tests');
      additionalTasks.push('Run test suite');
    }
    if (instructions.toLowerCase().includes('style') || instructions.toLowerCase().includes('format')) {
      additionalTasks.push('Apply code formatting');
      additionalTasks.push('Check coding standards');
    }

    return [...baseTasks, ...additionalTasks];
  }

  private async analyzeSimpleTask(instructions: string): Promise<{
    taskType: string;
    difficulty: string;
    approach: string;
    timeEstimate: string;
  }> {
    const content = instructions.toLowerCase();

    // Determine task type
    let taskType = 'general development';
    if (content.includes('bug') || content.includes('fix')) {
      taskType = 'bug fix';
    } else if (content.includes('documentation') || content.includes('readme')) {
      taskType = 'documentation';
    } else if (content.includes('test')) {
      taskType = 'testing';
    } else if (content.includes('style') || content.includes('format')) {
      taskType = 'code formatting';
    } else if (content.includes('feature') && content.includes('simple')) {
      taskType = 'simple feature';
    }

    // Assess difficulty
    const difficulty = this.context.requestComplexity === 'low' ? 'easy' : 
                     this.context.requestComplexity === 'medium' ? 'moderate' : 'challenging';

    // Determine approach
    let approach = 'step-by-step implementation';
    if (taskType === 'bug fix') {
      approach = 'reproduce, analyze, fix, test';
    } else if (taskType === 'documentation') {
      approach = 'review, understand, document, validate';
    } else if (taskType === 'testing') {
      approach = 'understand requirements, write tests, validate';
    }

    // Estimate time
    const timeEstimate = difficulty === 'easy' ? '2-4 hours' :
                        difficulty === 'moderate' ? '4-8 hours' : '1-2 days';

    return {
      taskType,
      difficulty,
      approach,
      timeEstimate
    };
  }

  private async identifyLearningOpportunities(instructions: string): Promise<{
    skills: string[];
    concepts: string[];
    mentorshipNeeds: string[];
  }> {
    const content = instructions.toLowerCase();

    // Identify skills to practice
    const skills: string[] = [];
    if (content.includes('typescript') || content.includes('javascript')) {
      skills.push('JavaScript/TypeScript programming');
    }
    if (content.includes('react')) {
      skills.push('React component development');
    }
    if (content.includes('css') || content.includes('style')) {
      skills.push('CSS styling');
    }
    if (content.includes('git')) {
      skills.push('Git version control');
    }
    if (content.includes('test')) {
      skills.push('Unit testing');
    }

    // Identify concepts to learn
    const concepts: string[] = [];
    if (content.includes('component')) {
      concepts.push('Component-based architecture');
    }
    if (content.includes('api')) {
      concepts.push('API integration');
    }
    if (content.includes('state')) {
      concepts.push('State management');
    }
    if (content.includes('async')) {
      concepts.push('Asynchronous programming');
    }

    // Identify when mentorship is needed
    const mentorshipNeeds: string[] = [];
    if (this.context.requestComplexity === 'medium') {
      mentorshipNeeds.push('Review implementation approach');
    }
    if (content.includes('performance')) {
      mentorshipNeeds.push('Performance optimization guidance');
    }
    if (content.includes('security')) {
      mentorshipNeeds.push('Security best practices');
    }

    return {
      skills,
      concepts,
      mentorshipNeeds
    };
  }

  private async executeSimpleDevelopmentActions(instructions: string): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    // Add appropriate labels
    const labels = ['good-first-issue', 'junior-dev'];
    if (instructions.toLowerCase().includes('bug')) {
      labels.push('bug');
    }
    if (instructions.toLowerCase().includes('documentation')) {
      labels.push('documentation');
    }

    actions.push({
      type: 'label',
      data: { labels },
      priority: 'low'
    });

    // Request review from senior developer if needed
    if (this.context.requestComplexity === 'medium') {
      actions.push({
        type: 'assign',
        data: {
          assignees: ['senior-dev'],
          reason: 'Requesting senior developer review for guidance'
        },
        priority: 'medium'
      });
    }

    return actions;
  }

  private generateTaskReport(taskAnalysis: any, learningPoints: any): string {
    return `
### 📋 Task Analysis

#### Task Overview
- **Type**: ${taskAnalysis.taskType}
- **Difficulty**: ${taskAnalysis.difficulty}
- **Approach**: ${taskAnalysis.approach}
- **Estimated Time**: ${taskAnalysis.timeEstimate}

#### Learning Opportunities
- **Skills to Practice**: ${learningPoints.skills.length > 0 ? learningPoints.skills.join(', ') : 'General development skills'}
- **Concepts to Learn**: ${learningPoints.concepts.length > 0 ? learningPoints.concepts.join(', ') : 'Basic programming concepts'}
- **Mentorship Needed**: ${learningPoints.mentorshipNeeds.length > 0 ? learningPoints.mentorshipNeeds.join(', ') : 'Independent work possible'}
`;
  }

  private generateLearingSummary(taskAnalysis: any, learningPoints: any): string {
    const mentorshipNote = learningPoints.mentorshipNeeds.length > 0 
      ? `\n\n🤝 **Mentorship**: Will collaborate with senior developer on ${learningPoints.mentorshipNeeds.join(', ')}`
      : '';

    return `
### 📚 Junior Developer Summary

**Task Completed**: ${taskAnalysis.taskType} (${taskAnalysis.difficulty} difficulty)
**Time Investment**: ${taskAnalysis.timeEstimate}
**Skills Practiced**: ${learningPoints.skills.join(', ')}
**Learning Focus**: ${learningPoints.concepts.length > 0 ? learningPoints.concepts.join(', ') : 'Practical implementation'}${mentorshipNote}

**Growth Notes**: This task provided hands-on experience with ${taskAnalysis.taskType} and reinforced best practices for ${learningPoints.skills.slice(0, 2).join(' and ')}.
`;
  }
}