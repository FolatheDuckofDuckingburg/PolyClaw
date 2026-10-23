import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { createTwoFilesPatch } from 'diff';

const WORKSPACE_ROOT = path.resolve(process.cwd());
type FileApprovalHandler = (preview: string) => Promise<boolean>;
let fileApprovalHandler: FileApprovalHandler | undefined;

export function setFileApprovalHandler(handler: FileApprovalHandler | undefined): void {
  fileApprovalHandler = handler;
}

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
  description: 'Propose a UTF-8 file change. PolyClaw shows a diff and requires explicit user approval before writing.',
  parameters: z.object({
    filePath: z.string().min(1).describe('Relative path to a file inside the current workspace'),
    content: z.string().describe('The full proposed file content'),
  }),
  execute: async ({ filePath, content }) => {
    try {
      const safePath = await resolveWorkspacePath(filePath, 'write');
      let original = '';
      let isNewFile = false;
      try {
        original = await fs.readFile(safePath, 'utf-8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        isNewFile = true;
      }

      if (original === content && !isNewFile) {
        return { success: true, changed: false, message: `No changes needed for ${filePath}.` };
      }

      const diff = createTwoFilesPatch(
        isNewFile ? '/dev/null' : filePath,
        filePath,
        original,
        content,
        'current',
        'proposed',
      );
      const preview = diff.length > 12_000 ? `${diff.slice(0, 12_000)}\n... diff truncated ...` : diff;

      if (!fileApprovalHandler) {
        return {
          success: false,
          blocked: true,
          error: 'Interactive file-change approval is unavailable. Run PolyClaw in its interactive REPL to review and approve edits.',
          preview,
        };
      }

      const approved = await fileApprovalHandler(
        `Proposed file change: ${filePath}\n\n${preview}\n\nThis writes the full proposed content to the workspace file.`,
      );
      if (!approved) {
        return { success: false, approved: false, message: `User denied the proposed change to ${filePath}.`, preview };
      }

      await fs.writeFile(safePath, content, 'utf-8');
      return { success: true, changed: true, message: `Successfully wrote approved changes to ${filePath}`, preview };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: `Failed to write file: ${message}` };
    }
  },
});
