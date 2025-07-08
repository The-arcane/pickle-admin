'use server';
/**
 * @fileOverview A flow to read QR codes from images.
 * - readQrCode - A function that extracts text from a QR code image.
 * - ReadQrCodeInput - The input type for the readQrCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReadQrCodeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a QR code, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ReadQrCodeInput = z.infer<typeof ReadQrCodeInputSchema>;

const ReadQrCodeOutputSchema = z.string().describe('The text content extracted from the QR code.');

export async function readQrCode(input: ReadQrCodeInput): Promise<string> {
  return readQrCodeFlow(input);
}

const readQrCodePrompt = ai.definePrompt({
    name: 'readQrCodePrompt',
    input: {schema: ReadQrCodeInputSchema},
    output: {schema: ReadQrCodeOutputSchema},
    model: 'googleai/gemini-1.5-flash-preview',
    prompt: `You are an expert QR code reader. Analyze the following image and extract the exact text content from the QR code present in it. Output only the raw text content from the QR code, with no extra formatting, labels, or explanation. If there is no QR code or it is unreadable, output an empty string.

Image: {{media url=photoDataUri}}`,
});

const readQrCodeFlow = ai.defineFlow(
  {
    name: 'readQrCodeFlow',
    inputSchema: ReadQrCodeInputSchema,
    outputSchema: ReadQrCodeOutputSchema,
  },
  async (input) => {
    const {output} = await readQrCodePrompt(input);
    return output || '';
  }
);
