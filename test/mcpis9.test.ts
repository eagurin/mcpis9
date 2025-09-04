import { McpIS9 } from '../src/core/mcpis9';

describe('McpIS9', () => {
  let mcpis9: McpIS9;

  beforeEach(() => {
    mcpis9 = new McpIS9();
  });

  test('should create instance', () => {
    expect(mcpis9).toBeInstanceOf(McpIS9);
  });

  test('should have AI help method', () => {
    expect(typeof mcpis9.getAIHelp).toBe('function');
  });

  test('should have CLI help method', () => {
    expect(typeof mcpis9.getCLIHelp).toBe('function');
  });

  test('should have Dev help method', () => {
    expect(typeof mcpis9.getDevHelp).toBe('function');
  });
});
