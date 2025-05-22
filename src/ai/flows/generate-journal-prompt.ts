// src/ai/flows/generate-journal-prompt.ts
'use server';

/**
 * @fileOverview Generates a personalized journal prompt based on the user's current mood and recent conversations.
 *
 * - generateJournalPrompt - A function that generates a personalized journal prompt.
 * - GenerateJournalPromptInput - The input type for the generateJournalPrompt function.
 * - GenerateJournalPromptOutput - The return type for the generateJournalPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJournalPromptInputSchema = z.object({
  mood: z.string().describe('The current mood of the user (e.g., happy, sad, anxious).'),
  recentConversation: z.string().describe('A summary of the recent conversation with the user.'),
});

export type GenerateJournalPromptInput = z.infer<typeof GenerateJournalPromptInputSchema>;

const GenerateJournalPromptOutputSchema = z.object({
  prompt: z.string().describe('A personalized journal prompt based on the user input.'),
});

export type GenerateJournalPromptOutput = z.infer<typeof GenerateJournalPromptOutputSchema>;

export async function generateJournalPrompt(input: GenerateJournalPromptInput): Promise<GenerateJournalPromptOutput> {
  return generateJournalPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJournalPromptPrompt',
  input: {schema: GenerateJournalPromptInputSchema},
  output: {schema: GenerateJournalPromptOutputSchema},
  prompt: `You are an AI assistant designed to help users with journaling.
  Based on the user's current mood and recent conversation, generate a personalized journal prompt to encourage reflection.

  Mood: {{{mood}}}
  Recent Conversation: {{{recentConversation}}}

  Journal Prompt:`, // Removed the angle brackets
});

const generateJournalPromptFlow = ai.defineFlow(
  {
    name: 'generateJournalPromptFlow',
    inputSchema: GenerateJournalPromptInputSchema,
    outputSchema: GenerateJournalPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
