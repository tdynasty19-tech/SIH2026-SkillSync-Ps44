import { AIProvider } from './ai-provider.interface';
import { OpenAIProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { MockAIProvider } from './mock.provider';
import { env } from '../../config/env.config';

export class AIProviderFactory {
  private static activeProvider: AIProvider | null = null;

  public static getProvider(): AIProvider {
    if (this.activeProvider) {
      return this.activeProvider;
    }

    const providerType = (env.AI_PROVIDER || 'gemini').toLowerCase().trim();

    if (providerType === 'openai') {
      this.activeProvider = new OpenAIProvider();
    } else if (providerType === 'mock') {
      this.activeProvider = new MockAIProvider();
    } else {
      this.activeProvider = new GeminiProvider();
    }

    return this.activeProvider;
  }

  public static setProvider(provider: AIProvider | null): void {
    this.activeProvider = provider;
  }
}
