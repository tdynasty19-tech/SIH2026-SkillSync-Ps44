import { AIProvider, AICompletionOptions } from './ai-provider.interface';
import { env } from '../../config/env.config';
import { AIProviderError } from '../../errors/app.error';

export class OpenAIProvider implements AIProvider {
  public readonly name = 'openai';
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey?: string, model = 'gpt-4o-mini') {
    this.apiKey = apiKey || env.OPENAI_API_KEY || '';
    this.model = model;
  }

  public async generateCompletion(
    prompt: string,
    options?: AICompletionOptions
  ): Promise<string> {
    if (!this.apiKey) {
      throw new AIProviderError('OpenAI API key is not configured');
    }

    const timeoutMs = options?.timeoutMs || 15000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const messages: any[] = [];
      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? 2000,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 401 || status === 403) {
          throw new AIProviderError('OpenAI authentication failed: Invalid API key');
        }
        if (status === 429) {
          throw new AIProviderError('OpenAI rate limit exceeded');
        }
        throw new AIProviderError(`OpenAI request failed with status: ${status}`);
      }

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new AIProviderError('OpenAI returned empty completion content');
      }

      return content;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new AIProviderError(`OpenAI request timed out after ${timeoutMs}ms`);
      }
      if (err instanceof AIProviderError) {
        throw err;
      }
      throw new AIProviderError(`OpenAI provider failure: ${err.message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
