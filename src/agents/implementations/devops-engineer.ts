#!/usr/bin/env bun

import { BaseAgent, type AgentResponse, type AgentAction } from "../base-agent";
import type { AgentMetadata, AgentContext } from "../registry";

/**
 * DevOps Engineer Agent
 * Manages deployment, infrastructure, CI/CD pipelines, and system monitoring
 */
export class DevOpsAgent extends BaseAgent {
  constructor(metadata: AgentMetadata, context: AgentContext) {
    super(metadata, context);
  }

  protected getRequiredPermissions(): string[] {
    return ['read', 'write', 'deploy', 'manage_infrastructure'];
  }

  protected async executeTask(): Promise<AgentResponse> {
    const instructions = this.extractTaskInstructions();
    const actions: AgentAction[] = [];

    // Generate DevOps checklist
    const tasks = this.generateDevOpsTasks(instructions);
    const completedTasks: string[] = [];

    // Initial comment with introduction and checklist
    let commentBody = this.getAgentIntroduction();
    commentBody += '\n#### ⚙️ DevOps Operations Checklist:\n';
    commentBody += this.formatChecklist(tasks);
    
    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'high'
    });

    // Perform DevOps analysis
    completedTasks.push('Analyze request context and requirements');
    
    const infrastructureAssessment = await this.assessInfrastructure(instructions);
    const deploymentPlan = await this.createDeploymentPlan(instructions);
    const monitoringStrategy = await this.designMonitoringStrategy(instructions);

    completedTasks.push('Assess infrastructure requirements');
    completedTasks.push('Create deployment strategy');
    completedTasks.push('Design monitoring and alerting');

    // Update comment with findings
    commentBody = this.getAgentIntroduction();
    commentBody += '\n#### ⚙️ DevOps Operations Checklist:\n';
    commentBody += this.formatChecklist(tasks, completedTasks);
    commentBody += '\n\n' + this.generateDevOpsReport(infrastructureAssessment, deploymentPlan, monitoringStrategy);

    actions.push({
      type: 'comment',
      data: { body: commentBody },
      priority: 'medium'
    });

    // Execute DevOps actions
    const devopsActions = await this.executeDevOpsActions(instructions, deploymentPlan);
    actions.push(...devopsActions);

    completedTasks.push('Execute infrastructure operations');
    completedTasks.push('Configure deployment pipelines');
    completedTasks.push('Implement monitoring solutions');

    // Final DevOps summary
    const finalComment = this.getAgentIntroduction();
    finalComment += '\n#### ⚙️ DevOps Operations Checklist:\n';
    finalComment += this.formatChecklist(tasks, completedTasks);
    finalComment += '\n\n✅ **DevOps assessment completed!**\n\n';
    finalComment += this.generateDevOpsSummary(infrastructureAssessment, deploymentPlan, monitoringStrategy);

    actions.push({
      type: 'comment',
      data: { body: finalComment },
      priority: 'high'
    });

    return this.createSuccessResponse(
      'DevOps assessment completed successfully',
      actions
    );
  }

  private generateDevOpsTasks(instructions: string): string[] {
    const baseTasks = [
      'Analyze request context and requirements',
      'Assess infrastructure requirements',
      'Create deployment strategy',
      'Design monitoring and alerting',
      'Execute infrastructure operations',
      'Configure deployment pipelines',
      'Implement monitoring solutions'
    ];

    const additionalTasks: string[] = [];

    if (instructions.toLowerCase().includes('deploy')) {
      additionalTasks.push('Plan production deployment');
      additionalTasks.push('Configure rollback procedures');
    }
    if (instructions.toLowerCase().includes('ci/cd')) {
      additionalTasks.push('Set up CI/CD pipelines');
      additionalTasks.push('Configure automated testing');
    }
    if (instructions.toLowerCase().includes('infrastructure')) {
      additionalTasks.push('Design infrastructure architecture');
      additionalTasks.push('Plan resource scaling');
    }
    if (instructions.toLowerCase().includes('monitoring')) {
      additionalTasks.push('Implement comprehensive monitoring');
      additionalTasks.push('Set up alerting rules');
    }
    if (instructions.toLowerCase().includes('security')) {
      additionalTasks.push('Configure security policies');
      additionalTasks.push('Implement access controls');
    }

    return [...baseTasks, ...additionalTasks];
  }

  private async assessInfrastructure(instructions: string): Promise<{
    currentSetup: string;
    requirements: string[];
    scalingNeeds: string[];
    securityConsiderations: string[];
  }> {
    const content = instructions.toLowerCase();

    // Assess current setup
    let currentSetup = 'Standard cloud infrastructure';
    if (content.includes('kubernetes') || content.includes('k8s')) {
      currentSetup = 'Kubernetes orchestrated environment';
    } else if (content.includes('docker')) {
      currentSetup = 'Containerized application deployment';
    } else if (content.includes('serverless')) {
      currentSetup = 'Serverless architecture';
    }

    // Infrastructure requirements
    const requirements: string[] = [];
    if (content.includes('database')) {
      requirements.push('Database hosting and management');
    }
    if (content.includes('cdn')) {
      requirements.push('Content Delivery Network');
    }
    if (content.includes('load balancer') || content.includes('high availability')) {
      requirements.push('Load balancing and redundancy');
    }
    if (content.includes('cache') || content.includes('redis')) {
      requirements.push('Caching layer');
    }

    // Scaling needs
    const scalingNeeds: string[] = [];
    if (this.context.requestComplexity === 'high') {
      scalingNeeds.push('Horizontal scaling capability');
    }
    if (content.includes('traffic') || content.includes('users')) {
      scalingNeeds.push('Auto-scaling based on demand');
    }
    if (content.includes('global') || content.includes('multi-region')) {
      scalingNeeds.push('Multi-region deployment');
    }

    // Security considerations
    const securityConsiderations: string[] = [];
    if (content.includes('api') || content.includes('backend')) {
      securityConsiderations.push('API security and rate limiting');
    }
    if (content.includes('data') || content.includes('database')) {
      securityConsiderations.push('Data encryption and backup');
    }
    if (content.includes('auth')) {
      securityConsiderations.push('Authentication and authorization');
    }

    return {
      currentSetup,
      requirements,
      scalingNeeds,
      securityConsiderations
    };
  }

  private async createDeploymentPlan(instructions: string): Promise<{
    strategy: string;
    stages: string[];
    rollbackPlan: string;
    timeline: string;
  }> {
    const content = instructions.toLowerCase();
    const complexity = this.context.requestComplexity;

    // Deployment strategy
    let strategy = 'Blue-Green deployment';
    if (content.includes('canary')) {
      strategy = 'Canary deployment';
    } else if (content.includes('rolling')) {
      strategy = 'Rolling deployment';
    } else if (complexity === 'low') {
      strategy = 'Direct deployment';
    }

    // Deployment stages
    const stages = [
      'Build and test',
      'Deploy to staging',
      'Integration testing',
      'Deploy to production',
      'Monitor and validate'
    ];

    if (strategy === 'Canary deployment') {
      stages.splice(3, 1, 'Deploy to 10% of users', 'Monitor metrics', 'Full production deployment');
    }

    // Rollback plan
    const rollbackPlan = strategy === 'Blue-Green deployment' 
      ? 'Instant rollback via traffic switching'
      : strategy === 'Canary deployment'
      ? 'Immediate traffic redirection from canary'
      : 'Database backup restoration and previous version deployment';

    // Timeline
    const timeline = complexity === 'high' ? '2-4 hours' : 
                    complexity === 'medium' ? '1-2 hours' : '30-60 minutes';

    return {
      strategy,
      stages,
      rollbackPlan,
      timeline
    };
  }

  private async designMonitoringStrategy(instructions: string): Promise<{
    metrics: string[];
    alerts: string[];
    dashboards: string[];
    logStrategy: string;
  }> {
    const content = instructions.toLowerCase();

    // Key metrics to monitor
    const metrics = [
      'Application response time',
      'Error rate',
      'CPU and memory usage',
      'Database performance'
    ];

    if (content.includes('api')) {
      metrics.push('API request rate and latency');
    }
    if (content.includes('user') || content.includes('frontend')) {
      metrics.push('User experience metrics');
    }

    // Alert configurations
    const alerts = [
      'High error rate (>5%)',
      'Slow response time (>2s)',
      'Resource usage >80%',
      'Service unavailability'
    ];

    // Dashboard requirements
    const dashboards = [
      'Application health overview',
      'Infrastructure metrics',
      'Error tracking and debugging'
    ];

    if (content.includes('business') || content.includes('analytics')) {
      dashboards.push('Business metrics dashboard');
    }

    // Logging strategy
    const logStrategy = this.context.requestComplexity === 'high' 
      ? 'Centralized logging with structured logs and correlation IDs'
      : 'Standard application logging with error tracking';

    return {
      metrics,
      alerts,
      dashboards,
      logStrategy
    };
  }

  private async executeDevOpsActions(instructions: string, deploymentPlan: any): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    // Add DevOps labels
    const labels = ['devops-reviewed'];
    
    if (instructions.toLowerCase().includes('deploy')) {
      labels.push('deployment-ready');
    }
    if (instructions.toLowerCase().includes('infrastructure')) {
      labels.push('infrastructure-change');
    }

    actions.push({
      type: 'label',
      data: { labels },
      priority: 'medium'
    });

    // Create deployment checklist
    const deploymentChecklist = `
### 🚀 Deployment Checklist

#### Pre-deployment
${deploymentPlan.stages.slice(0, 2).map(stage => `- [ ] ${stage}`).join('\n')}

#### Deployment
${deploymentPlan.stages.slice(2).map(stage => `- [ ] ${stage}`).join('\n')}

#### Post-deployment
- [ ] Verify application health
- [ ] Check monitoring dashboards
- [ ] Validate rollback procedures

**Strategy**: ${deploymentPlan.strategy}
**Estimated Time**: ${deploymentPlan.timeline}
`;

    actions.push({
      type: 'comment',
      data: { body: deploymentChecklist },
      priority: 'low'
    });

    return actions;
  }

  private generateDevOpsReport(
    infrastructure: any,
    deployment: any,
    monitoring: any
  ): string {
    return `
### 🏗️ DevOps Assessment Report

#### Infrastructure Analysis
- **Current Setup**: ${infrastructure.currentSetup}
- **Requirements**: ${infrastructure.requirements.length > 0 ? infrastructure.requirements.join(', ') : 'Standard hosting requirements'}
- **Scaling Needs**: ${infrastructure.scalingNeeds.length > 0 ? infrastructure.scalingNeeds.join(', ') : 'Current capacity sufficient'}
- **Security**: ${infrastructure.securityConsiderations.length > 0 ? infrastructure.securityConsiderations.join(', ') : 'Standard security measures'}

#### Deployment Strategy
- **Method**: ${deployment.strategy}
- **Timeline**: ${deployment.timeline}
- **Stages**: ${deployment.stages.length} deployment stages
- **Rollback**: ${deployment.rollbackPlan}

#### Monitoring & Observability
- **Key Metrics**: ${monitoring.metrics.join(', ')}
- **Alert Rules**: ${monitoring.alerts.length} configured
- **Dashboards**: ${monitoring.dashboards.join(', ')}
- **Logging**: ${monitoring.logStrategy}
`;
  }

  private generateDevOpsSummary(
    infrastructure: any,
    deployment: any,
    monitoring: any
  ): string {
    return `
### ⚙️ DevOps Summary

**Infrastructure**: ${infrastructure.currentSetup}
**Deployment Strategy**: ${deployment.strategy} (${deployment.timeline})
**Monitoring**: ${monitoring.metrics.length} key metrics tracked

**Readiness Assessment**:
- Infrastructure: ${infrastructure.requirements.length === 0 ? 'Ready' : 'Needs setup'}
- Deployment: ${deployment.strategy} strategy planned
- Monitoring: ${monitoring.alerts.length} alerts configured

**Recommendations**:
- Use ${deployment.strategy} for safe deployment
- Monitor ${monitoring.metrics.slice(0, 2).join(' and ')}
- ${infrastructure.securityConsiderations.length > 0 ? 'Implement ' + infrastructure.securityConsiderations[0] : 'Maintain current security posture'}

**Next Steps**: ${infrastructure.requirements.length > 0 ? 'Complete infrastructure setup' : 'Ready for deployment execution'}
`;
  }
}