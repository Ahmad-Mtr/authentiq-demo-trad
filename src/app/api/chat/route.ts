import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { mistral, type MistralLanguageModelOptions } from '@ai-sdk/mistral';



export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    
    const model = mistral('mistral-large-latest');
  const result = streamText({
    model: model,
    system: 'You are a helpful assistant.',
    messages: await convertToModelMessages(messages),
    // providerOptions: {
    //     parallelToolCalls: false,
    //     safePrompt: true,
    // } as MistralLanguageModelOptions,
  });

  return result.toUIMessageStreamResponse();
}