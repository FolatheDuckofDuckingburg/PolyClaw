import fs from 'fs/promises';
import { applyPatch } from 'diff';

export interface PatchResult {
  success: boolean;
  message: string;
}

/**
 * Applies a unified diff patch to a target file safely.
 */
export async function applyFilePatch(filePath: string, patchContent: string): Promise<PatchResult> {
  try {
    const originalContent = await fs.readFile(filePath, 'utf-8');
    const patchedContent = applyPatch(originalContent, patchContent);

    if (patchedContent === false) {
      return {
        success: false,
        message: 'Failed to apply diff patch. The target file content does not match the patch context.',
      };
    }

    await fs.writeFile(filePath, patchedContent, 'utf-8');
    return {
      success: true,
      message: `Successfully applied patch to ${filePath}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Patch error: ${error.message}`,
    };
  }
}
