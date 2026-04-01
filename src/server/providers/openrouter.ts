import { BaseProvider, Model, Message, GenerateChunk, ModelOptions } from './types';

export class OpenRouterProvider extends BaseProvider {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async listModels(): Promise<Model[]> {
    if (!this.apiKey) return [];
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/aleksander/tensix',
          'X-Title': 'Tensix'
        }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.data.map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        provider: 'openrouter',
        details: m
      }));
    } catch (error) {
      console.error('OpenRouter listModels error:', error);
      return [];
    }
  }

  async checkStatus(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const response = await fetch(`${this.baseUrl}/auth/key`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async *generate(modelId: string, messages: Message[], tools?: any[], options?: ModelOptions): AsyncIterable<GenerateChunk> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/aleksander/tensix',
          'X-Title': 'Tensix'
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages,
          tools: tools,
          stream: true,
          temperature: options?.temperature,
          top_p: options?.top_p,
          max_tokens: options?.max_tokens,
          presence_penalty: options?.presence_penalty,
          frequency_penalty: options?.frequency_penalty,
        }),
      });

      if (!response.ok) throw new Error(`OpenRouter error: ${response.statusText}`);

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
            const delta = json.choices[0]?.delta;
            if (delta?.content) {
              yield { text: delta.content };
            }
            if (delta?.tool_calls) {
              yield { toolCalls: delta.tool_calls };
            }
          } catch (e) {
            // Partial JSON - wait for next chunk
          }
        }
      }
    } catch (error) {
      console.error('OpenRouter generate error:', error);
      throw error;
    }
  }

  async unload(modelId: string): Promise<void> {
    // No-op for cloud providers.
  }
}
