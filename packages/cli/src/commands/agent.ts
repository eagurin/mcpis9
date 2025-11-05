/**
 * Agent Management CLI Commands
 */

import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import {
  initOrchestrator,
  getOrchestrator,
  type OrchestratorConfig,
} from '@mcpis9/shared';

export function createAgentCommand(): Command {
  const agent = new Command('agent');

  agent.description('Manage the AI agent system');

  // Agent chat command
  agent
    .command('chat')
    .description('Start an interactive chat with the boss agent')
    .option('-m, --message <message>', 'Send a single message')
    .option('-c, --conversation-id <id>', 'Continue a specific conversation')
    .action(async (options) => {
      const spinner = ora('Initializing agent system...').start();

      try {
        // Initialize orchestrator
        const config = getOrchestratorConfig();
        const orchestrator = initOrchestrator(config);
        await orchestrator.initialize();

        spinner.succeed('Agent system ready');

        if (options.message) {
          // Single message mode
          console.log(chalk.cyan('\n> ' + options.message));
          const response = await orchestrator.processRequest(
            options.message,
            options.conversationId
          );
          console.log(chalk.green('\n' + response + '\n'));
        } else {
          // Interactive mode
          console.log(chalk.yellow('\n💬 Interactive Agent Chat'));
          console.log(chalk.gray('Type your message or "exit" to quit\n'));

          const inquirer = await import('inquirer');
          let conversationId = options.conversationId || `cli-${Date.now()}`;

          while (true) {
            const { message } = await inquirer.default.prompt([
              {
                type: 'input',
                name: 'message',
                message: 'You:',
                prefix: chalk.cyan('💭'),
              },
            ]);

            if (!message || message.toLowerCase() === 'exit') {
              console.log(chalk.yellow('\n👋 Goodbye!\n'));
              break;
            }

            const thinking = ora('Agent thinking...').start();
            try {
              const response = await orchestrator.processRequest(message, conversationId);
              thinking.stop();
              console.log(chalk.green(`\n🤖 Agent: ${response}\n`));
            } catch (error) {
              thinking.fail('Error processing message');
              console.error(chalk.red((error as Error).message));
            }
          }
        }

        await orchestrator.shutdown();
      } catch (error) {
        spinner.fail('Failed to initialize agent system');
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  // Agent status command
  agent
    .command('status')
    .description('Show agent system status')
    .action(async () => {
      const spinner = ora('Checking agent status...').start();

      try {
        const config = getOrchestratorConfig();
        const orchestrator = initOrchestrator(config);
        await orchestrator.initialize();

        const status = orchestrator.getSystemStatus();
        spinner.succeed('Agent status retrieved');

        console.log(chalk.yellow('\n📊 Agent System Status\n'));
        console.log(chalk.cyan('Boss Agent:'));
        console.log(`  Status: ${chalk.green(status.boss.status)}`);
        console.log(`  Completed Tasks: ${status.boss.completedTasks}`);
        console.log(`  Failed Tasks: ${status.boss.failedTasks}`);
        console.log(`  Success Rate: ${(status.boss.metrics.successRate * 100).toFixed(1)}%`);

        console.log(chalk.cyan('\n\nWorker Agents:'));
        for (const [type, state] of Object.entries(status.workers)) {
          console.log(`\n  ${chalk.yellow(state.agent.name)}:`);
          console.log(`    Status: ${chalk.green(state.status)}`);
          console.log(`    Completed: ${state.completedTasks}`);
          console.log(`    Failed: ${state.failedTasks}`);
        }

        console.log(chalk.cyan('\n\nMemory Service:'));
        console.log(`  Connected: ${status.memory.connected ? chalk.green('Yes') : chalk.red('No')}`);

        console.log();

        await orchestrator.shutdown();
      } catch (error) {
        spinner.fail('Failed to get agent status');
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  // Agent test command
  agent
    .command('test')
    .description('Test the agent system with sample tasks')
    .action(async () => {
      const spinner = ora('Initializing agent system...').start();

      try {
        const config = getOrchestratorConfig();
        const orchestrator = initOrchestrator(config);
        await orchestrator.initialize();

        spinner.succeed('Agent system ready');

        const testCases = [
          'Hello! How are you?',
          'Write a simple TypeScript function to calculate factorial',
          'Research the latest features in Next.js 14',
        ];

        for (const testCase of testCases) {
          console.log(chalk.cyan(`\n🧪 Test: ${testCase}`));
          const testing = ora('Processing...').start();

          try {
            const response = await orchestrator.processRequest(
              testCase,
              `test-${Date.now()}`
            );
            testing.succeed('Test passed');
            console.log(chalk.green(`Response: ${response.substring(0, 200)}...`));
          } catch (error) {
            testing.fail('Test failed');
            console.error(chalk.red((error as Error).message));
          }
        }

        console.log(chalk.yellow('\n✅ All tests completed\n'));

        await orchestrator.shutdown();
      } catch (error) {
        spinner.fail('Failed to run tests');
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  return agent;
}

/**
 * Get orchestrator configuration from environment
 */
function getOrchestratorConfig(): OrchestratorConfig {
  return {
    r2r: process.env.R2R_BASE_URL
      ? {
          baseUrl: process.env.R2R_BASE_URL,
          apiKey: process.env.R2R_API_KEY,
        }
      : undefined,
    linear: process.env.LINEAR_API_KEY
      ? {
          apiKey: process.env.LINEAR_API_KEY,
          teamId: process.env.LINEAR_TEAM_ID,
        }
      : undefined,
    aiProviders: {
      anthropic: process.env.ANTHROPIC_API_KEY
        ? { apiKey: process.env.ANTHROPIC_API_KEY }
        : undefined,
      openai: process.env.OPENAI_API_KEY
        ? { apiKey: process.env.OPENAI_API_KEY }
        : undefined,
      google: process.env.GOOGLE_API_KEY
        ? { apiKey: process.env.GOOGLE_API_KEY }
        : undefined,
    },
  };
}
