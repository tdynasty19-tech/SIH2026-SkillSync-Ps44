import { AIProvider, AICompletionOptions } from './ai-provider.interface';
import { env } from '../../config/env.config';
import { AIProviderError } from '../../errors/app.error';

export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini';
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey?: string, model = 'gemini-1.5-flash') {
    this.apiKey = apiKey !== undefined ? apiKey : (env.GEMINI_API_KEY || '');
    this.model = model;
  }

  public async generateCompletion(
    prompt: string,
    options?: AICompletionOptions
  ): Promise<string> {
    if (!this.apiKey) {
      throw new AIProviderError('Gemini API key is not configured');
    }

    const timeoutMs = options?.timeoutMs || 15000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

      const contents: any[] = [];
      if (options?.systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: `System Instructions: ${options.systemPrompt}` }],
        });
        contents.push({
          role: 'model',
          parts: [{ text: 'Understood. I will follow the instructions and output valid JSON.' }],
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens ?? 2000,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 401 || status === 403) {
          throw new AIProviderError('Gemini authentication failed: Invalid API key');
        }
        if (status === 429) {
          throw new AIProviderError('Gemini rate limit exceeded');
        }
        throw new AIProviderError(`Gemini request failed with status: ${status}`);
      }

      const data: any = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new AIProviderError('Gemini returned empty completion content');
      }

      return text;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new AIProviderError(`Gemini request timed out after ${timeoutMs}ms`);
      }
      if (err instanceof AIProviderError) {
        throw err;
      }
      throw new AIProviderError(`Gemini provider failure: ${err.message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
