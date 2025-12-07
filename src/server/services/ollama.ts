import { config } from '../utils/load-env';
import { logger } from '../utils/logger';

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaGenerateOptions {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  format?: string;
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatOptions {
  model: string;
  messages: OllamaChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  format?: string;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaChatMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.ollama.baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      logger.error('Ollama API request failed', { endpoint, error });
      throw error;
    }
  }

  // List available models
  async listModels(): Promise<OllamaModel[]> {
    return this.request<OllamaModel[]>('/tags');
  }

  // Check if a model exists
  async hasModel(modelName: string): Promise<boolean> {
    try {
      const models = await this.listModels();
      return models.some(model => model.name === modelName);
    } catch {
      return false;
    }
  }

  // Pull a model
  async pullModel(modelName: string, onProgress?: (progress: any) => void): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.statusText}`);
    }

    if (onProgress && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const progress = JSON.parse(line);
            onProgress(progress);
          } catch {
            // Ignore parsing errors
          }
        }
      }
    }
  }

  // Generate completion
  async generate(options: OllamaGenerateOptions): Promise<OllamaGenerateResponse> {
    return this.request<OllamaGenerateResponse>('/generate', {
      method: 'POST',
      body: JSON.stringify({
        model: options.model,
        prompt: options.prompt,
        system: options.system,
        options: {
          temperature: options.temperature,
          num_predict: options.max_tokens,
        },
        stream: false,
        format: options.format,
      }),
    });
  }

  // Generate streaming completion
  async *generateStream(options: OllamaGenerateOptions): AsyncGenerator<OllamaGenerateResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model,
        prompt: options.prompt,
        system: options.system,
        options: {
          temperature: options.temperature,
          num_predict: options.max_tokens,
        },
        stream: true,
        format: options.format,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate stream: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          yield data;
        } catch (error) {
          logger.warn('Failed to parse stream chunk', { line, error });
        }
      }
    }
  }

  // Chat completion
  async chat(options: OllamaChatOptions): Promise<OllamaChatResponse> {
    return this.request<OllamaChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        options: {
          temperature: options.temperature,
          num_predict: options.max_tokens,
        },
        stream: false,
        format: options.format,
      }),
    });
  }

  // Chat streaming completion
  async *chatStream(options: OllamaChatOptions): AsyncGenerator<OllamaChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        options: {
          temperature: options.temperature,
          num_predict: options.max_tokens,
        },
        stream: true,
        format: options.format,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to chat stream: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          yield data;
        } catch (error) {
          logger.warn('Failed to parse stream chunk', { line, error });
        }
      }
    }
  }

  // Delete a model
  async deleteModel(modelName: string): Promise<void> {
    await this.request('/delete', {
      method: 'DELETE',
      body: JSON.stringify({ name: modelName }),
    });
  }

  // Get model info
  async showModel(modelName: string): Promise<any> {
    return this.request('/show', {
      method: 'POST',
      body: JSON.stringify({ name: modelName }),
    });
  }
}

// Export singleton instance
export const ollama = new OllamaClient();