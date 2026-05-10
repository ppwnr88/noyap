import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { agentAliases, agents, findAgent, type AgentTarget } from "./agents.js";
import {
  detectAgentsMdConflicts,
  findAgentsMdChain,
  mergeAgentsMd,
  noyapReferenceSentinel,
  noyapSeparateFile,
  referenceSeparateAgentsMd,
  type AgentsMdStrategy,
  type CodexMergeStrategy,
  writeTextFile
} from "./agents-md.js";
import {
  defaultConfig,
  languages,
  modes,
  normalizeConfig,
  rolePresets,
  thaiTechnicalTermModes,
  type NoyapConfig
} from "./config.js";
import { loadTemplate, renderTemplate, sentinel } from "./templates.js";
import { formatHelp } from "./cli.js";
export { doctor, formatDoctorResult, type DoctorCheck, type DoctorOptions, type DoctorResult } from "./doctor.js";
export { getRolePresetGuidance, getSafetyRulesText, rolePresetGuidance, safetyRules } from "./presets.js";
export { commandDefinitions, commonExamples, completionMetadata, optionDefinitions, quickStartExamples } from "./cli.js";
export {
  detectAgentsMdConflicts,
  findAgentsMdChain,
  mergeAgentsMd,
  parseAgentsMd,
  referenceSeparateAgentsMd,
  type AgentsMdStrategy,
  type CodexMergeStrategy
} from "./agents-md.js";

export {
  detectLanguage,
  detectStyle,
  findThaiTechnicalTerms,
  shouldPreserveTerm,
  thaiTechnicalTerms,
  type DetectedLanguage,
  type StyleDetection
} from "./language.js";

export interface InitOptions {
  cwd: string;
  agent?: string;
  all: boolean;
  force: boolean;
  dryRun: boolean;
  interactive: boolean;
  agentsMdStrategy: AgentsMdStrategy;
  codexStrategy: CodexMergeStrategy;
  config: NoyapConfig;
}

export interface WriteResult {
  agent: AgentTarget;
  status: "created" | "appended" | "merged" | "referenced" | "overwritten" | "skipped" | "unchanged" | "warning";
  file: string;
  message?: string;
}

function parseValue(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} needs a value`);
  return value;
}

export function parseArgs(argv: string[], cwd = process.cwd()): InitOptions & { help: boolean; version: boolean } {
  const opts = {
    cwd,
    all: false,
    force: false,
    dryRun: false,
    interactive: false,
    agentsMdStrategy: "merge",
    codexStrategy: "merge",
    config: { ...defaultConfig },
    help: false,
    version: false
  } as InitOptions & { help: boolean; version: boolean };

  const command = argv[0];
  if (!command || command === "--help" || command === "-h") opts.help = true;
  if (command === "--version" || command === "-v") opts.version = true;
  if (command && command !== "init" && command !== "doctor" && !command.startsWith("-")) {
    throw new Error(`Unknown command: ${command}`);
  }

  for (let i = command === "init" || command === "doctor" ? 1 : 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--agent") opts.agent = parseValue(argv, i++, "--agent");
    else if (arg === "--all") opts.all = true;
    else if (arg === "--force" || arg === "-f") opts.force = true;
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--interactive") opts.interactive = true;
    else if (arg === "--agents-md-strategy" || arg === "--codex-strategy") {
      const value = parseValue(argv, i++, arg);
      if (!["merge", "separate", "overwrite", "cancel"].includes(value)) {
        throw new Error("Invalid AGENTS.md strategy. Use one of: merge, separate, overwrite, cancel");
      }
      opts.agentsMdStrategy = value as AgentsMdStrategy;
      opts.codexStrategy = value as CodexMergeStrategy;
    }
    else if (arg === "--completion") {
      const shell = parseValue(argv, i++, "--completion");
      if (!["bash", "zsh", "fish"].includes(shell)) throw new Error("Unsupported shell. Use one of: bash, zsh, fish");
    }
    else if (arg === "--preserve-mixed-language") opts.config.preserveMixedLanguage = true;
    else if (arg === "--no-preserve-mixed-language") opts.config.preserveMixedLanguage = false;
    else if (arg === "--natural-thai") opts.config.naturalThaiMode = true;
    else if (arg === "--no-natural-thai") opts.config.naturalThaiMode = false;
    else if (arg === "--preset" || arg === "--role") {
      const value = parseValue(argv, i++, arg);
      if (!rolePresets.includes(value as NoyapConfig["rolePreset"])) {
        throw new Error(`Invalid role preset: ${value}. Use one of: ${rolePresets.join(", ")}`);
      }
      opts.config.rolePreset = value as NoyapConfig["rolePreset"];
    }
    else if (arg === "--lang") {
      const language = parseValue(argv, i++, "--lang");
      if (!languages.includes(language as NoyapConfig["language"])) {
        throw new Error(`Invalid language: ${language}. Use one of: ${languages.join(", ")}`);
      }
      opts.config.language = language as NoyapConfig["language"];
    } else if (arg === "--mode") {
      const mode = parseValue(argv, i++, "--mode");
      if (!modes.includes(mode as NoyapConfig["mode"])) {
        throw new Error(`Invalid mode: ${mode}. Use one of: ${modes.join(", ")}`);
      }
      opts.config.mode = mode as NoyapConfig["mode"];
    } else if (arg === "--thai-technical-terms") {
      const value = parseValue(argv, i++, "--thai-technical-terms");
      if (!thaiTechnicalTermModes.includes(value as NoyapConfig["thaiTechnicalTerms"])) {
        throw new Error(`Invalid Thai technical term mode: ${value}. Use one of: ${thaiTechnicalTermModes.join(", ")}`);
      }
      opts.config.thaiTechnicalTerms = value as NoyapConfig["thaiTechnicalTerms"];
    }
    else if (arg === "--max-explanation-lines") {
      opts.config.maxExplanationLines = Number(parseValue(argv, i++, "--max-explanation-lines"));
    } else if (arg === "--help" || arg === "-h") opts.help = true;
    else if (arg === "--version" || arg === "-v") opts.version = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  opts.config = normalizeConfig(opts.config);
  return opts;
}

function selectedAgents(opts: InitOptions): AgentTarget[] {
  if (opts.all) return agents;
  if (opts.agent) {
    const agent = findAgent(opts.agent);
    if (!agent) throw new Error(`Unknown agent: ${opts.agent}. Use one of: ${agents.map((a) => a.id).join(", ")}`);
    return [agent];
  }
  return [findAgent("codex"), findAgent("claude"), findAgent("cursor")].filter(Boolean) as AgentTarget[];
}

async function writeSafe(file: string, content: string, agent: AgentTarget, opts: InitOptions): Promise<WriteResult> {
  const fullPath = path.join(opts.cwd, file);
  const exists = existsSync(fullPath);

  if (!exists) {
    if (!opts.dryRun) {
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content, "utf8");
    }
    return { agent, status: "created", file };
  }

  const current = await readFile(fullPath, "utf8");
  if (current.includes(sentinel)) return { agent, status: "unchanged", file };

  if (agent.writeMode === "append") {
    const separator = current.endsWith("\n\n") ? "" : current.endsWith("\n") ? "\n" : "\n\n";
    if (!opts.dryRun) await writeFile(fullPath, `${current}${separator}${content}`, "utf8");
    return { agent, status: "appended", file };
  }

  if (!opts.force) return { agent, status: "skipped", file };
  if (!opts.dryRun) await writeFile(fullPath, content, "utf8");
  return { agent, status: "overwritten", file };
}

function separateAgentsMdTarget(agent: AgentTarget): AgentTarget {
  return {
    id: agent.id,
    name: agent.name,
    file: noyapSeparateFile,
    template: agent.template,
    writeMode: "replace",
    notes: `Separate Noyap ${agent.name} rules`
  } as AgentTarget;
}

function agentsMdConflictResults(agent: AgentTarget, warnings: { file: string; message: string }[]): WriteResult[] {
  return warnings.map((warning) => ({
    agent,
    status: "warning" as const,
    file: warning.file,
    message: warning.message
  }));
}

async function writeAgentsMdRules(content: string, agent: AgentTarget, opts: InitOptions): Promise<WriteResult[]> {
  const fullPath = path.join(opts.cwd, agent.file);
  const exists = existsSync(fullPath);
  const chain = await findAgentsMdChain(opts.cwd);
  const warnings = detectAgentsMdConflicts(chain, opts.config);
  const results: WriteResult[] = [...agentsMdConflictResults(agent, warnings)];
  const strategy = opts.force ? "overwrite" : opts.agentsMdStrategy;
  const separateTarget = separateAgentsMdTarget(agent);

  if (!exists) {
    if (strategy === "separate") {
      if (!opts.dryRun) {
        await writeTextFile(opts.cwd, noyapSeparateFile, content);
        await writeTextFile(opts.cwd, agent.file, referenceSeparateAgentsMd(""));
      }
      return [
        ...results,
        { agent: separateTarget, status: "created", file: noyapSeparateFile },
        { agent, status: "created", file: agent.file }
      ];
    }
    if (strategy === "cancel") return [...results, { agent, status: "skipped", file: agent.file, message: "cancelled" }];
    if (!opts.dryRun) await writeTextFile(opts.cwd, agent.file, content);
    return [...results, { agent, status: "created", file: agent.file }];
  }

  const current = await readFile(fullPath, "utf8");
  if (current.includes(sentinel)) return [...results, { agent, status: "unchanged", file: agent.file }];

  if (strategy === "cancel") {
    return [...results, { agent, status: "skipped", file: agent.file, message: "cancelled" }];
  }

  if (strategy === "separate") {
    const separatePath = path.join(opts.cwd, noyapSeparateFile);
    const separateExists = existsSync(separatePath);
    const referenceContent = referenceSeparateAgentsMd(current);
    if (!opts.dryRun) {
      if (!separateExists) await writeTextFile(opts.cwd, noyapSeparateFile, content);
      if (!current.includes(noyapReferenceSentinel) && !current.includes(noyapSeparateFile)) {
        await writeTextFile(opts.cwd, agent.file, referenceContent);
      }
    }
    return [
      ...results,
      { agent: separateTarget, status: separateExists ? "unchanged" : "created", file: noyapSeparateFile },
      {
        agent,
        status: current.includes(noyapReferenceSentinel) || current.includes(noyapSeparateFile) ? "unchanged" : "referenced",
        file: agent.file
      }
    ];
  }

  if (strategy === "overwrite") {
    if (!opts.dryRun) await writeTextFile(opts.cwd, agent.file, content);
    return [...results, { agent, status: "overwritten", file: agent.file }];
  }

  const merged = mergeAgentsMd(current, content);
  if (!opts.dryRun) await writeTextFile(opts.cwd, agent.file, merged);
  return [...results, { agent, status: "merged", file: agent.file }];
}

async function writeConfig(opts: InitOptions): Promise<WriteResult> {
  const agent = {
    id: "codex",
    name: "Noyap",
    file: "noyap.config.json",
    template: "",
    writeMode: "replace",
    notes: "Noyap config"
  } as AgentTarget;

  const body = `${JSON.stringify(opts.config, null, 2)}\n`;
  return writeSafe("noyap.config.json", body, agent, opts);
}

export async function init(opts: InitOptions): Promise<WriteResult[]> {
  const targets = selectedAgents(opts);
  const results: WriteResult[] = [await writeConfig(opts)];

  for (const agent of targets) {
    const template = await loadTemplate(agent.template);
    const content = renderTemplate(template, agent, opts.config);
    if (agent.file === "AGENTS.md") results.push(...await writeAgentsMdRules(content, agent, opts));
    else results.push(await writeSafe(agent.file, content, agent, opts));
  }

  return results;
}

export function helpText(): string {
  return formatHelp();
}

export function formatSummary(results: WriteResult[], dryRun = false): string {
  const icon: Record<WriteResult["status"], string> = {
    created: "✔",
    appended: "✔",
    merged: "✔",
    referenced: "✔",
    overwritten: "✔",
    skipped: "⚠",
    unchanged: "✔",
    warning: "⚠"
  };
  const action: Record<WriteResult["status"], string> = {
    created: "Generated",
    appended: "Updated",
    merged: "Merged",
    referenced: "Referenced",
    overwritten: "Overwrote",
    skipped: "Skipped existing",
    unchanged: "Already configured",
    warning: "Conflict note"
  };
  const label = (result: WriteResult) =>
    result.status === "warning"
      ? result.file
      : result.file === "noyap.config.json"
        ? "noyap.config.json"
        : `${result.agent.name} rule file`;
  const lines = results.map((result) => {
    const suffix = result.message ? ` - ${result.message}` : result.status === "warning" ? ` - ${result.file}` : "";
    return `${icon[result.status]} ${action[result.status]} ${label(result)}${suffix}`;
  });
  const counts = results.reduce<Record<string, number>>((acc, result) => {
    acc[result.status] = (acc[result.status] ?? 0) + 1;
    return acc;
  }, {});

  const configResult = results.find((result) => result.file === "noyap.config.json");
  return [
    `Noyap init${dryRun ? " (dry run)" : ""}`,
    "",
    ...lines,
    configResult?.status === "created" || configResult?.status === "overwritten"
      ? "✔ Thai-native mode enabled"
      : undefined,
    "",
    `Summary: ${Object.entries(counts).map(([status, count]) => `${count} ${status}`).join(", ")}`,
    dryRun ? "No files written." : "Done."
  ].filter((line) => line !== undefined).join("\n");
}
