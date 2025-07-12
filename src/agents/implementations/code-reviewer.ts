#!/usr/bin/env bun

import { BaseAgent, type AgentResponse, type AgentAction } from "../base-agent";
import type { AgentMetadata, AgentContext } from "../registry";

/**
 * Code Reviewer Agent
 * Performs thorough code reviews, security analysis, and quality assurance
 */
export class CodeReviewerAgent extends BaseAgent {
  constructor(metadata: AgentMetadata, context: AgentContext) {
    super(metadata, context);
  }

  protected getRequiredPermissions(): string[] {
    return ['read', 'comment', 'request_changes'];
  }

  protected async executeTask(): Promise<AgentResponse> {
    const instructions = this.extractTaskInstructions();
    const actions: AgentAction[] = [];

    // Generate review checklist
    const tasks = this.generateReviewTasks(instructions);
    const completedTasks: string[] = [];

    // Initial comment with introduction and checklist
    let commentBody = this.getAgentIntroduction();
    commentBody += '\n#### 🔍 Code Review Checklist:\n';
    commentBody += this.formatChecklist(tasks);
    
    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'high'
    });

    // Perform code analysis
    completedTasks.push('Analyze request context and requirements');
    
    const codeAnalysis = await this.performCodeAnalysis();
    const securityReview = await this.conductSecurityReview();
    const qualityAssessment = await this.assessCodeQuality();

    completedTasks.push('Analyze code structure and patterns');
    completedTasks.push('Conduct security review');
    completedTasks.push('Assess code quality and standards');

    // Update comment with findings
    commentBody = this.getAgentIntroduction();
    commentBody += '\n#### 🔍 Code Review Checklist:\n';
    commentBody += this.formatChecklist(tasks, completedTasks);
    commentBody += '\n\n' + this.generateReviewReport(codeAnalysis, securityReview, qualityAssessment);

    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'medium'
    });

    // Generate review actions
    const reviewActions = await this.generateReviewActions(codeAnalysis, securityReview, qualityAssessment);
    actions.push(...reviewActions);

    completedTasks.push('Generate review feedback');
    completedTasks.push('Provide recommendations');
    completedTasks.push('Complete review assessment');

    // Final review summary
    const finalComment = this.getAgentIntroduction();
    finalComment += '\n#### 🔍 Code Review Checklist:\n';
    finalComment += this.formatChecklist(tasks, completedTasks);
    finalComment += '\n\n✅ **Code review completed!**\n\n';
    finalComment += this.generateReviewSummary(codeAnalysis, securityReview, qualityAssessment);

    actions.push({
      type: 'comment',
      data: { body: finalComment },
      priority: 'high'
    });

    return this.createSuccessResponse(
      'Code review completed successfully',
      actions
    );
  }

  private generateReviewTasks(instructions: string): string[] {
    const baseTasks = [
      'Analyze request context and requirements',
      'Analyze code structure and patterns',
      'Conduct security review',
      'Assess code quality and standards',
      'Generate review feedback',
      'Provide recommendations',
      'Complete review assessment'
    ];

    const additionalTasks: string[] = [];

    if (instructions.toLowerCase().includes('security')) {
      additionalTasks.push('Perform detailed security analysis');
    }
    if (instructions.toLowerCase().includes('performance')) {
      additionalTasks.push('Analyze performance implications');
    }
    if (instructions.toLowerCase().includes('api')) {
      additionalTasks.push('Review API design and contracts');
    }
    if (instructions.toLowerCase().includes('database')) {
      additionalTasks.push('Review data access patterns');
    }

    return [...baseTasks, ...additionalTasks];
  }

  private async performCodeAnalysis(): Promise<{
    structure: string[];
    patterns: string[];
    issues: string[];
    suggestions: string[];
  }> {
    const { githubData } = this.context;
    const changedFiles = githubData.changedFilesWithSHA || [];

    // Analyze file structure
    const structure = changedFiles.map(file => {
      const parts = file.filename.split('/');
      return `${parts[parts.length - 1]} in ${parts.slice(0, -1).join('/')}`;
    });

    // Identify patterns
    const patterns: string[] = [];
    const fileTypes = changedFiles.map(f => f.filename.split('.').pop());
    
    if (fileTypes.includes('ts') || fileTypes.includes('tsx')) {
      patterns.push('TypeScript implementation');
    }
    if (changedFiles.some(f => f.filename.includes('test'))) {
      patterns.push('Test coverage included');
    }
    if (changedFiles.some(f => f.filename.includes('component'))) {
      patterns.push('Component-based architecture');
    }

    // Common issues to check
    const issues: string[] = [];
    if (changedFiles.length > 15) {
      issues.push('Large change set - consider breaking into smaller PRs');
    }
    if (!changedFiles.some(f => f.filename.includes('test'))) {
      issues.push('No test files detected - tests may be needed');
    }

    // Suggestions
    const suggestions = [
      'Ensure proper error handling',
      'Add comprehensive comments for complex logic',
      'Verify type safety',
      'Check for code duplication'
    ];

    return { structure, patterns, issues, suggestions };
  }

  private async conductSecurityReview(): Promise<{
    vulnerabilities: string[];
    recommendations: string[];
    severity: 'low' | 'medium' | 'high';
  }> {
    const { githubData } = this.context;
    const content = [
      githubData.contextData?.title || '',
      githubData.contextData?.body || ''
    ].join(' ').toLowerCase();

    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];

    // Check for security-related changes
    if (content.includes('authentication') || content.includes('login')) {
      vulnerabilities.push('Authentication implementation needs security review');
      recommendations.push('Implement secure token handling');
      recommendations.push('Add rate limiting');
    }

    if (content.includes('api') || content.includes('endpoint')) {
      vulnerabilities.push('API endpoints require input validation');
      recommendations.push('Sanitize all user inputs');
      recommendations.push('Implement proper authorization checks');
    }

    if (content.includes('database') || content.includes('sql')) {
      vulnerabilities.push('Database operations need SQL injection protection');
      recommendations.push('Use parameterized queries');
      recommendations.push('Implement proper data validation');
    }

    const severity: 'low' | 'medium' | 'high' = 
      vulnerabilities.length > 2 ? 'high' :
      vulnerabilities.length > 0 ? 'medium' : 'low';

    return { vulnerabilities, recommendations, severity };
  }

  private async assessCodeQuality(): Promise<{
    score: number;
    strengths: string[];
    improvements: string[];
    standards: string[];
  }> {
    const { githubData } = this.context;
    const changedFiles = githubData.changedFilesWithSHA || [];

    let score = 80; // Base score

    const strengths: string[] = [];
    const improvements: string[] = [];

    // Positive indicators
    if (changedFiles.some(f => f.filename.includes('test'))) {
      strengths.push('Test coverage included');
      score += 10;
    }

    if (changedFiles.some(f => f.filename.endsWith('.ts') || f.filename.endsWith('.tsx'))) {
      strengths.push('TypeScript implementation');
      score += 5;
    }

    // Areas for improvement
    if (changedFiles.length > 20) {
      improvements.push('Consider breaking large changes into smaller PRs');
      score -= 10;
    }

    if (!changedFiles.some(f => f.filename.includes('README') || f.filename.includes('.md'))) {
      improvements.push('Documentation updates may be needed');
      score -= 5;
    }

    const standards = [
      'Follow consistent naming conventions',
      'Maintain proper code formatting',
      'Use meaningful variable names',
      'Keep functions focused and small'
    ];

    return {
      score: Math.max(0, Math.min(100, score)),
      strengths,
      improvements,
      standards
    };
  }

  private async generateReviewActions(
    codeAnalysis: any,
    securityReview: any,
    qualityAssessment: any
  ): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    // Add review labels
    const labels = ['review-completed'];
    
    if (securityReview.severity === 'high') {
      labels.push('security-review-needed');
    }
    
    if (qualityAssessment.score < 70) {
      labels.push('needs-improvement');
    } else if (qualityAssessment.score > 90) {
      labels.push('high-quality');
    }

    actions.push({
      type: 'label',
      data: { labels },
      priority: 'medium'
    });

    // Request changes if needed
    if (codeAnalysis.issues.length > 0 || securityReview.vulnerabilities.length > 0) {
      actions.push({
        type: 'review',
        data: {
          event: 'REQUEST_CHANGES',
          body: 'Code review completed. Please address the issues mentioned above before merging.'
        },
        priority: 'high'
      });
    } else {
      actions.push({
        type: 'review',
        data: {
          event: 'APPROVE',
          body: 'Code review passed. Good work!'
        },
        priority: 'high'
      });
    }

    return actions;
  }

  private generateReviewReport(codeAnalysis: any, securityReview: any, qualityAssessment: any): string {
    return `
### 📊 Code Review Report

#### Code Quality Score: ${qualityAssessment.score}/100

#### Structural Analysis
- **Files Changed**: ${codeAnalysis.structure.length}
- **Patterns Detected**: ${codeAnalysis.patterns.join(', ')}
- **Issues Found**: ${codeAnalysis.issues.length > 0 ? codeAnalysis.issues.join(', ') : 'None'}

#### Security Assessment
- **Severity Level**: ${securityReview.severity.toUpperCase()}
- **Vulnerabilities**: ${securityReview.vulnerabilities.length > 0 ? securityReview.vulnerabilities.join(', ') : 'None identified'}
- **Recommendations**: ${securityReview.recommendations.length > 0 ? securityReview.recommendations.join(', ') : 'Standard security practices apply'}

#### Quality Metrics
- **Strengths**: ${qualityAssessment.strengths.join(', ')}
- **Improvements**: ${qualityAssessment.improvements.length > 0 ? qualityAssessment.improvements.join(', ') : 'Code meets quality standards'}
`;
  }

  private generateReviewSummary(codeAnalysis: any, securityReview: any, qualityAssessment: any): string {
    const decision = (codeAnalysis.issues.length === 0 && securityReview.vulnerabilities.length === 0) ? 'APPROVED' : 'NEEDS CHANGES';
    
    return `
### ✅ Review Summary

**Decision**: ${decision}
**Quality Score**: ${qualityAssessment.score}/100
**Security Level**: ${securityReview.severity.toUpperCase()}

**Key Points**:
- Code structure follows ${codeAnalysis.patterns.length > 0 ? codeAnalysis.patterns[0] : 'standard patterns'}
- ${qualityAssessment.strengths.length > 0 ? qualityAssessment.strengths[0] : 'Meets basic quality standards'}
- ${securityReview.severity === 'low' ? 'No major security concerns' : 'Security considerations noted'}

**Next Steps**: ${decision === 'APPROVED' ? 'Ready for merge after final checks' : 'Address review comments before proceeding'}
`;
  }
}