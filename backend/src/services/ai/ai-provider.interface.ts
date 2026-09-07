export interface AICompletionOptions {
  systemPrompt?: string;
  timeoutMs?: number;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  readonly name: string;
  generateCompletion(prompt: string, options?: AICompletionOptions): Promise<string>;
}
