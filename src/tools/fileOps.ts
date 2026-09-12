import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';

export const readFile = tool({
  description: 'Read the text contents of a file inside the local workspace path',
  parameters: z.object({
    filePath: z.string().describe('The relative or absolute file path to read'),
  }),
  execute: async ({ filePath }) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { content };
    } catch (err: any) {
      return { error: `Failed to read file: ${err.message}` };
    }
  },
});

export const writeFile = tool({
  description: 'Write string content directly to a specific file target path',
  parameters: z.object({
    filePath: z.string().describe('The file target path to write content into'),
    content: z.string().describe('The full file content payload'),
  }),
  execute: async ({ filePath, content }) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true, message: `Successfully wrote content to ${filePath}` };
    } catch (err: any) {
      return { error: `Failed to write file: ${err.message}` };
    }
  },
});
