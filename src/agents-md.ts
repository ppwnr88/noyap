import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { NoyapConfig } from "./config.js";
import { sentinel } from "./templates.js";

export const noyapReferenceSentinel = "<!-- noyap:reference -->";
export const noyapSeparateFile = ".noyap/AGENTS.noyap.md";

export type AgentsMdStrategy = "merge" | "separate" | "overwrite" | "cancel";
export type CodexMergeStrategy = AgentsMdStrategy;

export interface AgentsMdDocument {
  file: string;
  content: string;
  headings: string[];
  hasNoyapRules: boolean;
  hasNoyapReference: boolean;
}

export interface ConflictWarning {
  file: string;
  message: string;
}

export function parseAgentsMd(content: string, file = "AGENTS.md"): AgentsMdDocument {
  const headings = [...content.matchAll(/^(#{1,6})\s+(.+)$/gm)].map((match) => match[2].trim());
  return {
    file,
    content,
    headings,
    hasNoyapRules: content.includes(sentinel),
    hasNoyapReference: content.includes(noyapReferenceSentinel) || content.includes(noyapSeparateFile)
  };
}

function findProjectRoot(cwd: string): string {
  let current = path.resolve(cwd);
  while (true) {
    if (existsSync(path.join(current, ".git"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(cwd);
    current = parent;
  }
}

function directoriesFromRoot(root: string, cwd: string): string[] {
  const resolvedRoot = path.resolve(root);
  const resolvedCwd = path.resolve(cwd);
  const relative = path.relative(resolvedRoot, resolvedCwd);
  if (relative.startsWith("..")) return [resolvedCwd];
  const parts = relative ? relative.split(path.sep) : [];
  return [resolvedRoot, ...parts.map((_, index) => path.join(resolvedRoot, ...parts.slice(0, index + 1)))];
}

export async function findAgentsMdChain(cwd: string): Promise<AgentsMdDocument[]> {
  const root = findProjectRoot(cwd);
  const documents: AgentsMdDocument[] = [];

  for (const dir of directoriesFromRoot(root, cwd)) {
    const override = path.join(dir, "AGENTS.override.md");
    const regular = path.join(dir, "AGENTS.md");
    const selected = existsSync(override) ? override : existsSync(regular) ? regular : undefined;
    if (!selected) continue;
    const content = await readFile(selected, "utf8");
    if (!content.trim()) continue;
    documents.push(parseAgentsMd(content, path.relative(cwd, selected) || path.basename(selected)));
  }

  return documents;
}

export function detectAgentsMdConflicts(documents: AgentsMdDocument[], config: NoyapConfig): ConflictWarning[] {
  const warnings: ConflictWarning[] = [];
  const terseMode = ["minimal", "hardcore", "hardcore-th"].includes(config.mode);

  for (const document of documents) {
    const content = document.content.toLowerCase();
    const add = (message: string) => warnings.push({ file: document.file, message });

    if (terseMode && /(explain|describe|document).{0,40}(detail|thorough|careful|full|comprehensive)/i.test(document.content)) {
      add("Existing AGENTS.md requests detailed explanations; terse modes should yield when detail is required.");
    }
    if (/(architecture|architectural).{0,60}(detail|decision|rationale|tradeoff)/i.test(document.content)) {
      add("Existing AGENTS.md asks for architectural rationale; keep concise tradeoffs but do not remove required detail.");
    }
    if (/(security|secret|auth|permission).{0,80}(detail|careful|explain|warning|risk)/i.test(document.content)) {
      add("Existing AGENTS.md emphasizes security detail; preserve warning depth.");
    }
    if (/(migration|database|schema|rollback).{0,80}(detail|careful|explain|warning|risk)/i.test(document.content)) {
      add("Existing AGENTS.md emphasizes migration/database care; preserve warning depth.");
    }
    if (content.includes("never be terse") || content.includes("do not be terse")) {
      add("Existing AGENTS.md discourages terse answers; Noyap should be treated as an additive style hint.");
    }
  }

  return warnings;
}

export function mergeAgentsMd(existing: string, noyapRules: string): string {
  if (existing.includes(sentinel)) return existing;
  const separator = existing.endsWith("\n\n") ? "" : existing.endsWith("\n") ? "\n" : "\n\n";
  return `${existing}${separator}${noyapRules}`;
}

export function referenceSeparateAgentsMd(existing: string): string {
  if (existing.includes(noyapReferenceSentinel) || existing.includes(noyapSeparateFile)) return existing;
  const reference = [
    noyapReferenceSentinel,
    "## Noyap Rules",
    "",
    "Additional communication rules live in `.noyap/AGENTS.noyap.md`.",
    "Project-specific AGENTS.md guidance remains authoritative when instructions conflict."
  ].join("\n");
  const separator = existing.endsWith("\n\n") ? "" : existing.endsWith("\n") ? "\n" : "\n\n";
  return `${existing}${separator}${reference}\n`;
}

export async function writeTextFile(cwd: string, file: string, content: string): Promise<void> {
  const fullPath = path.join(cwd, file);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}
