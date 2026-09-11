import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';

export const readFile = tool({
  description: 'Read complete contents of a target file from the workspace.',
  parameters: z.object({
    filePath: z.string().describe('Relative or absolute file path to read'),
  }),
  execute: async ({ filePath }) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { content };
    } catch (err: any) {
      return { error: `Failed to read ${filePath}: ${err.message}` };
    }
  },
});

export const writeFile = tool({
  description: 'Write entire content to a new or existing workspace file.',
  parameters: z.object({
    filePath: z.string().describe('Target destination file path'),
    content: z.string().describe('Full text content to write into the file'),
  }),
  execute: async ({ filePath, content }) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true, filePath };
    } catch (err: any) {
      return { error: `Failed to write ${filePath}: ${err.message}` };
    }
  },
});
