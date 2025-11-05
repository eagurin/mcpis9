/**
 * Tool Registry - реестр и выполнение инструментов
 */

import type {
  ToolDefinition,
  ToolExecution,
  ToolExecutionResult,
  ToolType,
} from '@mcpis9/shared';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition>;
  private handlers: Map<string, (...args: any[]) => Promise<any>>;
  private executionHistory: ToolExecution[];

  constructor() {
    this.tools = new Map();
    this.handlers = new Map();
    this.executionHistory = [];
    this.registerDefaultTools();
  }

  /**
   * Регистрация инструмента
   */
  registerTool(
    definition: ToolDefinition,
    handler: (...args: any[]) => Promise<any>
  ): void {
    this.tools.set(definition.name, definition);
    this.handlers.set(definition.name, handler);
  }

  /**
   * Получить инструмент
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Получить все инструменты
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Получить инструменты по типу
   */
  getToolsByType(type: ToolType): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(tool => tool.type === type);
  }

  /**
   * Выполнить инструмент
   */
  async executeTool(
    toolName: string,
    parameters: Record<string, any>,
    execution: ToolExecution
  ): Promise<ToolExecutionResult> {
    const tool = this.tools.get(toolName);
    const handler = this.handlers.get(toolName);

    if (!tool || !handler) {
      const result: ToolExecutionResult = {
        success: false,
        output: null,
        error: `Tool ${toolName} not found`,
        metadata: {},
      };

      execution.status = 'failed';
      execution.result = result;
      execution.completedAt = new Date();
      this.executionHistory.push(execution);

      return result;
    }

    // Валидация параметров
    const validationError = this.validateParameters(tool, parameters);
    if (validationError) {
      const result: ToolExecutionResult = {
        success: false,
        output: null,
        error: validationError,
        metadata: {},
      };

      execution.status = 'failed';
      execution.result = result;
      execution.completedAt = new Date();
      this.executionHistory.push(execution);

      return result;
    }

    try {
      execution.status = 'running';

      const output = await handler(parameters);

      const result: ToolExecutionResult = {
        success: true,
        output,
        metadata: {
          executionTime: Date.now() - execution.startedAt.getTime(),
        },
      };

      execution.status = 'completed';
      execution.result = result;
      execution.completedAt = new Date();
      this.executionHistory.push(execution);

      return result;
    } catch (error) {
      const result: ToolExecutionResult = {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {},
      };

      execution.status = 'failed';
      execution.result = result;
      execution.completedAt = new Date();
      this.executionHistory.push(execution);

      return result;
    }
  }

  /**
   * Валидация параметров
   */
  private validateParameters(
    tool: ToolDefinition,
    parameters: Record<string, any>
  ): string | null {
    for (const param of tool.parameters) {
      if (param.required && !(param.name in parameters)) {
        return `Missing required parameter: ${param.name}`;
      }

      if (param.name in parameters) {
        const value = parameters[param.name];
        const actualType = Array.isArray(value) ? 'array' : typeof value;

        if (actualType !== param.type && param.type !== 'object') {
          return `Invalid type for parameter ${param.name}: expected ${param.type}, got ${actualType}`;
        }
      }
    }

    return null;
  }

  /**
   * Получить историю выполнения
   */
  getExecutionHistory(limit?: number): ToolExecution[] {
    return limit ? this.executionHistory.slice(-limit) : this.executionHistory;
  }

  /**
   * Регистрация инструментов по умолчанию
   */
  private registerDefaultTools(): void {
    // Search Tool
    this.registerTool(
      {
        name: 'search',
        type: 'search',
        description: 'Search for information on the internet',
        parameters: [
          {
            name: 'query',
            type: 'string',
            description: 'Search query',
            required: true,
          },
          {
            name: 'maxResults',
            type: 'number',
            description: 'Maximum number of results',
            required: false,
            default: 5,
          },
        ],
        returnType: 'array',
        handler: 'searchHandler',
      },
      async (params) => {
        // TODO: Implement real search
        return [
          { title: 'Result 1', url: 'https://example.com', snippet: 'Sample result' },
        ];
      }
    );

    // Code Execution Tool
    this.registerTool(
      {
        name: 'execute_code',
        type: 'code',
        description: 'Execute code in a sandbox',
        parameters: [
          {
            name: 'code',
            type: 'string',
            description: 'Code to execute',
            required: true,
          },
          {
            name: 'language',
            type: 'string',
            description: 'Programming language',
            required: true,
          },
        ],
        returnType: 'object',
        handler: 'codeExecutionHandler',
      },
      async (params) => {
        // TODO: Implement real code execution
        return { output: 'Code executed successfully', exitCode: 0 };
      }
    );

    // File Read Tool
    this.registerTool(
      {
        name: 'read_file',
        type: 'file',
        description: 'Read contents of a file',
        parameters: [
          {
            name: 'path',
            type: 'string',
            description: 'File path',
            required: true,
          },
        ],
        returnType: 'string',
        handler: 'fileReadHandler',
      },
      async (params) => {
        // TODO: Implement real file reading with security checks
        return 'File contents placeholder';
      }
    );

    // File Write Tool
    this.registerTool(
      {
        name: 'write_file',
        type: 'file',
        description: 'Write contents to a file',
        parameters: [
          {
            name: 'path',
            type: 'string',
            description: 'File path',
            required: true,
          },
          {
            name: 'content',
            type: 'string',
            description: 'Content to write',
            required: true,
          },
        ],
        returnType: 'boolean',
        handler: 'fileWriteHandler',
      },
      async (params) => {
        // TODO: Implement real file writing with security checks
        return true;
      }
    );

    // API Call Tool
    this.registerTool(
      {
        name: 'api_call',
        type: 'api',
        description: 'Make an API call',
        parameters: [
          {
            name: 'url',
            type: 'string',
            description: 'API endpoint URL',
            required: true,
          },
          {
            name: 'method',
            type: 'string',
            description: 'HTTP method',
            required: false,
            default: 'GET',
          },
          {
            name: 'body',
            type: 'object',
            description: 'Request body',
            required: false,
          },
        ],
        returnType: 'object',
        handler: 'apiCallHandler',
      },
      async (params) => {
        // TODO: Implement real API calls with security checks
        return { status: 200, data: {} };
      }
    );
  }
}
