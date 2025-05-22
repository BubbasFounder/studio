'use server';

/**
 * @fileOverview AI agent for generating empathetic and supportive responses.
 *
 * - generateEmpatheticResponse - A function that generates empathetic responses.
 * - GenerateEmpatheticResponseInput - The input type for the generateEmpatheticResponse function.
 * - GenerateEmpatheticResponseOutput - The return type for the generateEmpatheticResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmpatheticResponseInputSchema = z.object({
  userInput: z.string().describe('The user input to generate a response for.'),
  emotion: z.string().optional().describe('The detected emotion of the user input.'),
});
export type GenerateEmpatheticResponseInput = z.infer<typeof GenerateEmpatheticResponseInputSchema>;

const GenerateEmpatheticResponseOutputSchema = z.object({
  response: z.string().describe('The empathetic and supportive response from the AI.'),
});
export type GenerateEmpatheticResponseOutput = z.infer<typeof GenerateEmpatheticResponseOutputSchema>;

export async function generateEmpatheticResponse(input: GenerateEmpatheticResponseInput): Promise<GenerateEmpatheticResponseOutput> {
  return generateEmpatheticResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmpatheticResponsePrompt',
  input: {schema: GenerateEmpatheticResponseInputSchema},
  output: {schema: GenerateEmpatheticResponseOutputSchema},
  prompt: `You are Bubba, a friendly and supportive AI companion designed to provide empathetic responses to user input.

  {% if emotion %}The user is feeling {{{emotion}}}.{% endif %}
  Respond to the following user input with empathy and support:

  {{userInput}}
  `,
});

const generateEmpatheticResponseFlow = ai.defineFlow(
  {
    name: 'generateEmpatheticResponseFlow',
    inputSchema: GenerateEmpatheticResponseInputSchema,
    outputSchema: GenerateEmpatheticResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
