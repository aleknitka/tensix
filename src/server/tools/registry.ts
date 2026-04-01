export interface Tool {
  name: string;
  description: string;
  parameters: any; // JSON Schema
  execute: (args: any) => Promise<string>;
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getToolDefinitions(): any[] {
    // Formatted for Ollama/OpenRouter tools array
    return this.getAllTools().map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }
}

// Export a singleton instance
export const toolRegistry = new ToolRegistry();
