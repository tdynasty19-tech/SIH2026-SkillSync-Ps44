import { AIProvider, AICompletionOptions } from './ai-provider.interface';

export class MockAIProvider implements AIProvider {
  public readonly name = 'mock';
  public responseToReturn: string = '{}';
  public shouldFail: boolean = false;
  public failureError: Error = new Error('Mock AI Provider intentional failure');
  public lastPrompt: string = '';
  public lastOptions?: AICompletionOptions;

  public async generateCompletion(
    prompt: string,
    options?: AICompletionOptions
  ): Promise<string> {
    this.lastPrompt = prompt;
    this.lastOptions = options;

    if (this.shouldFail) {
      throw this.failureError;
    }

    return this.responseToReturn;
  }
}
