export interface Model {
  id: string;
  name: string;
  provider: 'ollama' | 'lmstudio' | 'openrouter';
  size?: number;
  details?: any;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface GenerateChunk {
  text?: string;
  toolCalls?: ToolCall[];
}

export interface ModelOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export abstract class BaseProvider {
  abstract listModels(): Promise<Model[]>;
  abstract checkStatus(): Promise<boolean>;
  abstract generate(modelId: string, messages: Message[], tools?: any[], options?: ModelOptions): AsyncIterable<GenerateChunk>;
  abstract unload(modelId: string): Promise<void>;
}
