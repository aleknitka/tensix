import { BaseProvider, Model, Message } from './types';

export class LMStudioProvider extends BaseProvider {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:1234') {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async listModels(): Promise<Model[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.data.map((m: any) => ({
        id: m.id,
        name: m.id,
        provider: 'lmstudio',
      }));
    } catch (error) {
      console.error('LM Studio listModels error:', error);
      return [];
    }
  }

  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async *generate(modelId: string, messages: Message[]): AsyncIterable<string> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelId,
          messages: messages,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error(`LM Studio error: ${response.statusText}`);

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.replace(/^data: /, '').trim();
          if (!cleanLine || cleanLine === '[DONE]') continue;

          try {
            const json = JSON.parse(cleanLine);
            const content = json.choices[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            // Partial JSON - wait for next chunk
          }
        }
      }
    } catch (error) {
      console.error('LM Studio generate error:', error);
      throw error;
    }
  }

  async unload(modelId: string): Promise<void> {
    // No-op: standard OpenAI-compatible API doesn't support explicit unloading.
  }
}
