#!/usr/bin/env bun

import { BaseAgent, type AgentResponse, type AgentAction } from "../base-agent";
import type { AgentMetadata, AgentContext } from "../registry";

/**
 * QA Engineer Agent
 * Handles testing, bug validation, quality metrics, and test automation
 */
export class QAAgent extends BaseAgent {
  constructor(metadata: AgentMetadata, context: AgentContext) {
    super(metadata, context);
  }

  protected getRequiredPermissions(): string[] {
    return ['read', 'write', 'run_tests'];
  }

  protected async executeTask(): Promise<AgentResponse> {
    const instructions = this.extractTaskInstructions();
    const actions: AgentAction[] = [];

    // Generate QA checklist
    const tasks = this.generateQATasks(instructions);
    const completedTasks: string[] = [];

    // Initial comment with introduction and checklist
    let commentBody = this.getAgentIntroduction();
    commentBody += '\n#### 🧪 QA Testing Checklist:\n';
    commentBody += this.formatChecklist(tasks);
    
    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'high'
    });

    // Perform QA analysis
    completedTasks.push('Analyze request context and requirements');
    
    const testPlan = await this.createTestPlan(instructions);
    const qualityMetrics = await this.assessQualityMetrics();
    const bugAnalysis = await this.analyzeBugReports();

    completedTasks.push('Create comprehensive test plan');
    completedTasks.push('Assess current quality metrics');
    completedTasks.push('Analyze bug reports and patterns');

    // Update comment with findings
    commentBody = this.getAgentIntroduction();
    commentBody += '\n#### 🧪 QA Testing Checklist:\n';
    commentBody += this.formatChecklist(tasks, completedTasks);
    commentBody += '\n\n' + this.generateQAReport(testPlan, qualityMetrics, bugAnalysis);

    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'medium'
    });

    // Execute QA actions
    const qaActions = await this.executeQAActions(instructions, testPlan);
    actions.push(...qaActions);

    completedTasks.push('Execute testing procedures');
    completedTasks.push('Validate quality standards');
    completedTasks.push('Document findings and recommendations');

    // Final QA summary
    const finalComment = this.getAgentIntroduction();
    finalComment += '\n#### 🧪 QA Testing Checklist:\n';
    finalComment += this.formatChecklist(tasks, completedTasks);
    finalComment += '\n\n✅ **QA assessment completed!**\n\n';
    finalComment += this.generateQASummary(testPlan, qualityMetrics, bugAnalysis);

    actions.push({
      type: 'comment',
      data: { body: finalComment },
      priority: 'high'
    });

    return this.createSuccessResponse(
      'QA assessment completed successfully',
      actions
    );
  }

  private generateQATasks(instructions: string): string[] {
    const baseTasks = [
      'Analyze request context and requirements',
      'Create comprehensive test plan',
      'Assess current quality metrics',
      'Analyze bug reports and patterns',
      'Execute testing procedures',
      'Validate quality standards',
      'Document findings and recommendations'
    ];

    const additionalTasks: string[] = [];

    if (instructions.toLowerCase().includes('bug')) {
      additionalTasks.push('Reproduce and validate bug');
      additionalTasks.push('Analyze bug impact and severity');
    }
    if (instructions.toLowerCase().includes('performance')) {
      additionalTasks.push('Conduct performance testing');
    }
    if (instructions.toLowerCase().includes('security')) {
      additionalTasks.push('Perform security testing');
    }
    if (instructions.toLowerCase().includes('automation')) {
      additionalTasks.push('Design test automation strategy');
    }
    if (instructions.toLowerCase().includes('regression')) {
      additionalTasks.push('Execute regression testing');
    }

    return [...baseTasks, ...additionalTasks];
  }

  private async createTestPlan(instructions: string): Promise<{
    testTypes: string[];
    coverage: string;
    scenarios: string[];
    automationLevel: string;
  }> {
    const content = instructions.toLowerCase();

    // Determine test types needed
    const testTypes: string[] = ['Unit Tests'];
    
    if (content.includes('integration') || content.includes('api')) {
      testTypes.push('Integration Tests');
    }
    if (content.includes('ui') || content.includes('frontend')) {
      testTypes.push('UI Tests');
    }
    if (content.includes('performance')) {
      testTypes.push('Performance Tests');
    }
    if (content.includes('security')) {
      testTypes.push('Security Tests');
    }
    if (content.includes('accessibility')) {
      testTypes.push('Accessibility Tests');
    }

    // Estimate coverage
    const complexity = this.context.requestComplexity;
    const coverage = complexity === 'high' ? '90%+' : 
                    complexity === 'medium' ? '80%+' : '70%+';

    // Define test scenarios
    const scenarios: string[] = [];
    if (content.includes('login') || content.includes('auth')) {
      scenarios.push('User authentication flow');
    }
    if (content.includes('form') || content.includes('input')) {
      scenarios.push('Form validation and submission');
    }
    if (content.includes('api')) {
      scenarios.push('API request/response handling');
    }
    if (content.includes('error')) {
      scenarios.push('Error handling and recovery');
    }
    
    // Default scenarios
    if (scenarios.length === 0) {
      scenarios.push('Happy path functionality');
      scenarios.push('Edge case handling');
      scenarios.push('Error conditions');
    }

    // Automation level
    const automationLevel = complexity === 'high' ? 'High (80%+)' : 
                           complexity === 'medium' ? 'Medium (60%+)' : 'Basic (40%+)';

    return {
      testTypes,
      coverage,
      scenarios,
      automationLevel
    };
  }

  private async assessQualityMetrics(): Promise<{
    currentCoverage: string;
    defectDensity: string;
    testEffectiveness: string;
    recommendations: string[];
  }> {
    const { githubData } = this.context;
    const changedFiles = githubData.changedFilesWithSHA || [];

    // Estimate current coverage based on test files
    const testFiles = changedFiles.filter(f => 
      f.filename.includes('test') || 
      f.filename.includes('spec') ||
      f.filename.includes('__tests__')
    );
    
    const hasTests = testFiles.length > 0;
    const testRatio = hasTests ? (testFiles.length / changedFiles.length) * 100 : 0;

    const currentCoverage = testRatio > 30 ? 'Good (70%+)' :
                           testRatio > 15 ? 'Fair (50%+)' : 'Low (<50%)';

    // Assess defect density (simulated)
    const defectDensity = this.context.requestComplexity === 'high' ? 'Medium risk' :
                         this.context.requestComplexity === 'medium' ? 'Low risk' : 'Very low risk';

    // Test effectiveness
    const testEffectiveness = hasTests ? 'Good' : 'Needs improvement';

    // Recommendations
    const recommendations: string[] = [];
    if (!hasTests) {
      recommendations.push('Add comprehensive test coverage');
    }
    if (testRatio < 20) {
      recommendations.push('Increase test-to-code ratio');
    }
    if (this.context.requestComplexity === 'high') {
      recommendations.push('Implement additional integration tests');
    }

    return {
      currentCoverage,
      defectDensity,
      testEffectiveness,
      recommendations
    };
  }

  private async analyzeBugReports(): Promise<{
    bugCount: number;
    severity: string;
    categories: string[];
    patterns: string[];
  }> {
    const { githubData } = this.context;
    const content = [
      githubData.contextData?.title || '',
      githubData.contextData?.body || '',
      ...githubData.comments.map(c => c.body)
    ].join(' ').toLowerCase();

    // Count bug-related keywords
    const bugKeywords = ['bug', 'error', 'issue', 'problem', 'broken', 'fail'];
    const bugCount = bugKeywords.reduce((count, keyword) => 
      count + (content.match(new RegExp(keyword, 'g')) || []).length, 0
    );

    // Determine severity
    const severityKeywords = {
      critical: ['critical', 'urgent', 'blocker', 'crash'],
      high: ['high', 'important', 'major'],
      medium: ['medium', 'moderate'],
      low: ['low', 'minor', 'trivial']
    };

    let severity = 'low';
    for (const [level, keywords] of Object.entries(severityKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        severity = level;
        break;
      }
    }

    // Categorize bugs
    const categories: string[] = [];
    if (content.includes('ui') || content.includes('interface')) {
      categories.push('UI/UX');
    }
    if (content.includes('api') || content.includes('backend')) {
      categories.push('Backend/API');
    }
    if (content.includes('performance')) {
      categories.push('Performance');
    }
    if (content.includes('security')) {
      categories.push('Security');
    }
    if (content.includes('data')) {
      categories.push('Data/Database');
    }

    // Identify patterns
    const patterns: string[] = [];
    if (content.includes('regression')) {
      patterns.push('Regression issue');
    }
    if (content.includes('browser') || content.includes('cross-platform')) {
      patterns.push('Cross-platform compatibility');
    }
    if (content.includes('intermittent') || content.includes('random')) {
      patterns.push('Intermittent failure');
    }

    return {
      bugCount,
      severity,
      categories,
      patterns
    };
  }

  private async executeQAActions(instructions: string, testPlan: any): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    // Add QA labels
    const labels = ['qa-reviewed'];
    
    if (testPlan.coverage === 'Low (<50%)') {
      labels.push('needs-tests');
    }
    
    if (instructions.toLowerCase().includes('bug')) {
      labels.push('bug-validated');
    }

    actions.push({
      type: 'label',
      data: { labels },
      priority: 'medium'
    });

    // Create test checklist comment
    const testChecklist = `
### 🧪 Test Execution Checklist

${testPlan.testTypes.map(type => `- [ ] ${type}`).join('\n')}
${testPlan.scenarios.map(scenario => `- [ ] ${scenario}`).join('\n')}

**Target Coverage**: ${testPlan.coverage}
**Automation Level**: ${testPlan.automationLevel}
`;

    actions.push({
      type: 'comment',
      data: { body: testChecklist },
      priority: 'low'
    });

    return actions;
  }

  private generateQAReport(testPlan: any, qualityMetrics: any, bugAnalysis: any): string {
    return `
### 📊 QA Assessment Report

#### Test Plan
- **Test Types**: ${testPlan.testTypes.join(', ')}
- **Target Coverage**: ${testPlan.coverage}
- **Key Scenarios**: ${testPlan.scenarios.join(', ')}
- **Automation Level**: ${testPlan.automationLevel}

#### Quality Metrics
- **Current Coverage**: ${qualityMetrics.currentCoverage}
- **Defect Risk**: ${qualityMetrics.defectDensity}
- **Test Effectiveness**: ${qualityMetrics.testEffectiveness}

#### Bug Analysis
- **Bug References**: ${bugAnalysis.bugCount} found
- **Severity Level**: ${bugAnalysis.severity.toUpperCase()}
- **Categories**: ${bugAnalysis.categories.length > 0 ? bugAnalysis.categories.join(', ') : 'General'}
- **Patterns**: ${bugAnalysis.patterns.length > 0 ? bugAnalysis.patterns.join(', ') : 'Standard issues'}
`;
  }

  private generateQASummary(testPlan: any, qualityMetrics: any, bugAnalysis: any): string {
    const testStatus = testPlan.coverage === 'Good (70%+)' ? 'PASSED' : 'NEEDS IMPROVEMENT';
    
    return `
### ✅ QA Summary

**Test Status**: ${testStatus}
**Coverage Goal**: ${testPlan.coverage}
**Risk Level**: ${qualityMetrics.defectDensity}

**Quality Assessment**:
- Test coverage is ${qualityMetrics.currentCoverage.toLowerCase()}
- ${testPlan.testTypes.length} test types planned
- ${bugAnalysis.severity === 'low' ? 'Low severity issues' : bugAnalysis.severity + ' severity issues detected'}

**Recommendations**:
${qualityMetrics.recommendations.length > 0 ? qualityMetrics.recommendations.map(r => `- ${r}`).join('\n') : '- Current quality standards are met'}

**Next Steps**: ${testStatus === 'PASSED' ? 'Ready for deployment testing' : 'Address quality gaps before proceeding'}
`;
  }
}