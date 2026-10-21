import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const WORKSPACE_ROOT = path.resolve(process.cwd());

function isWithinWorkspace(candidate: string): boolean {
  const relative = path.relative(WORKSPACE_ROOT, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function resolveWorkspacePath(filePath: string, operation: 'read' | 'write'): Promise<string> {
  if (path.isAbsolute(filePath)) {
    throw new Error('Absolute paths are not allowed. Use a path relative to the current workspace.');
  }

  const candidate = path.resolve(WORKSPACE_ROOT, filePath);
  if (!isWithinWorkspace(candidate)) {
    throw new Error('Path escapes the current workspace.');
  }

  if (operation === 'read') {
    const realTarget = await fs.realpath(candidate);
    if (!isWithinWorkspace(realTarget)) {
      throw new Error('Symlink target escapes the current workspace.');
    }
    return realTarget;
  }

  // Writes require an existing parent directory. Resolve it to prevent a
  // symlinked directory inside the workspace from redirecting writes outside.
  const realParent = await fs.realpath(path.dirname(candidate));
  if (!isWithinWorkspace(realParent)) {
    throw new Error('Parent directory escapes the current workspace.');
  }

  try {
    const realTarget = await fs.realpath(candidate);
    if (!isWithinWorkspace(realTarget)) {
      throw new Error('Symlink target escapes the current workspace.');
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  return candidate;
}

export const readFile = tool({
  description: 'Read a UTF-8 text file inside the current project workspace using a relative path',
  parameters: z.object({
    filePath: z.string().min(1).describe('Relative path to a file inside the current workspace'),
  }),
  execute: async ({ filePath }) => {
    try {
      const safePath = await resolveWorkspacePath(filePath, 'read');
      const content = await fs.readFile(safePath, 'utf-8');
      return { content };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: `Failed to read file: ${message}` };
    }
  },
});

export const writeFile = tool({
  description: 'Write UTF-8 text to a file inside the current project workspace using a relative path',
  parameters: z.object({
    filePath: z.string().min(1).describe('Relative path to a file inside the current workspace'),
    content: z.string().describe('The full file content payload'),
  }),
  execute: async ({ filePath, content }) => {
    try {
      const safePath = await resolveWorkspacePath(filePath, 'write');
      await fs.writeFile(safePath, content, 'utf-8');
      return { success: true, message: `Successfully wrote content to ${filePath}` };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: `Failed to write file: ${message}` };
    }
  },
});
