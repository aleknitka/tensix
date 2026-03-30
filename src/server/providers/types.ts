export interface Model {
  id: string;
  name: string;
  provider: 'ollama' | 'lmstudio' | 'openrouter';
  size?: number;
  details?: any;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export abstract class BaseProvider {
  abstract listModels(): Promise<Model[]>;
  abstract checkStatus(): Promise<boolean>;
  abstract generate(modelId: string, messages: Message[]): AsyncIterable<string>;
  abstract unload(modelId: string): Promise<void>;
}
