import { Ollama } from 'ollama';
import { BaseProvider, Model, Message } from './types';

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

  async *generate(modelId: string, messages: Message[]): AsyncIterable<string> {
    try {
      const response = await this.client.chat({
        model: modelId,
        messages: messages,
        stream: true,
      });

      for await (const part of response) {
        yield part.message.content;
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
