'use server';
import "server-only";

import path from "path";
import { promises as fs } from "fs";

export async function getChangelog(): Promise<string> {
  const filePath = path.join(process.cwd(), "public", "changelog.md");

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return fileContent;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch changelog: ${error.message}`);
    } else {
      throw new Error("Failed to fetch changelog: Unknown error");
    }
  }
}
