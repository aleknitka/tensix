import { Ollama } from 'ollama';
import { BaseProvider, Model, Message, GenerateChunk, ModelOptions } from './types';

export class OllamaProvider extends BaseProvider {
  private client: Ollama;

  constructor(baseUrl: string = 'http://localhost:11434') {
    super();
    this.client = new Ollama({ host: baseUrl });
  }

  async listModels(): Promise<Model[]> {
    try {
      const response = await this.client.list();
      return response.models.map((m) => ({
        id: m.name,
        name: m.name,
        provider: 'ollama',
        size: m.size,
        details: m.details,
      }));
    } catch (error) {
      console.error('Ollama listModels error:', error);
      return [];
    }
  }

  async checkStatus(): Promise<boolean> {
    try {
      await this.client.list();
      return true;
    } catch {
      return false;
    }
  }

  async *generate(modelId: string, messages: Message[], tools?: any[], options?: ModelOptions): AsyncIterable<GenerateChunk> {
    try {
      // Map internal Message type to Ollama SDK Message type
      const ollamaMessages = messages.map(m => {
        const msg: any = { role: m.role, content: m.content };
        if (m.tool_calls) {
          msg.tool_calls = m.tool_calls.map(tc => ({
            function: {
              name: tc.function.name,
              arguments: JSON.parse(tc.function.arguments)
            }
          }));
        }
        if (m.tool_call_id) {
          msg.tool_call_id = m.tool_call_id;
        }
        return msg;
      });

      const ollamaOptions: any = {};
      if (options) {
        if (options.temperature !== undefined) ollamaOptions.temperature = options.temperature;
        if (options.top_p !== undefined) ollamaOptions.top_p = options.top_p;
        if (options.max_tokens !== undefined) ollamaOptions.num_predict = options.max_tokens;
        if (options.presence_penalty !== undefined) ollamaOptions.presence_penalty = options.presence_penalty;
        if (options.frequency_penalty !== undefined) ollamaOptions.frequency_penalty = options.frequency_penalty;
      }

      const response = await this.client.chat({
        model: modelId,
        messages: ollamaMessages,
        tools: tools,
        options: ollamaOptions,
        stream: true,
      });

      for await (const part of response) {
        if (part.message.tool_calls) {
          yield {
            toolCalls: part.message.tool_calls.map(tc => ({
              id: '', // Ollama SDK doesn't always provide IDs
              type: 'function',
              function: {
                name: tc.function.name,
                arguments: JSON.stringify(tc.function.arguments)
              }
            }))
          };
        }
        if (part.message.content) {
          yield { text: part.message.content };
        }
      }
    } catch (error) {
      console.error('Ollama generate error:', error);
      throw error;
    }
  }

  async unload(modelId: string): Promise<void> {
    try {
      // Sending an empty prompt with keep_alive: 0 unloads the model from memory.
      await this.client.generate({
        model: modelId,
        prompt: '',
        keep_alive: 0,
      });
    } catch (error) {
      console.error('Ollama unload error:', error);
    }
  }
}
