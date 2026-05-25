import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
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
import { doctor } from "./doctor.js";
import { loadTemplate, renderTemplate, sentinel } from "./templates.js";
import { completionScript, formatHelp } from "./cli.js";
export { doctor, formatDoctorResult, type DoctorCheck, type DoctorOptions, type DoctorResult } from "./doctor.js";
export { getRolePresetGuidance, getSafetyRulesText, rolePresetGuidance, safetyRules } from "./presets.js";
export { commandDefinitions, commonExamples, completionMetadata, completionScript, optionDefinitions, quickStartExamples } from "./cli.js";
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
  command: "init" | "diff" | "update" | "remove" | "doctor" | "completion";
  cwd: string;
  agent?: string;
  all: boolean;
  force: boolean;
  fix: boolean;
  dryRun: boolean;
  interactive: boolean;
  agentsMdStrategy: AgentsMdStrategy;
  codexStrategy: CodexMergeStrategy;
  config: NoyapConfig;
}

export interface WriteResult {
  agent: AgentTarget;
  status:
    | "created"
    | "appended"
    | "merged"
    | "referenced"
    | "updated"
    | "removed"
    | "overwritten"
    | "skipped"
    | "unchanged"
    | "missing"
    | "warning";
  file: string;
  message?: string;
}

function parseValue(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} needs a value`);
  return value;
}

export function parseArgs(argv: string[], cwd = process.cwd()): InitOptions & { help: boolean; version: boolean } {
  const command = argv[0];
  const opts = {
    command: command && !command.startsWith("-") ? command : "init",
    cwd,
    all: false,
    force: false,
    fix: false,
    dryRun: false,
    interactive: false,
    agentsMdStrategy: "merge",
    codexStrategy: "merge",
    config: { ...defaultConfig },
    help: false,
    version: false
  } as InitOptions & { help: boolean; version: boolean };

  if (!command || command === "--help" || command === "-h") opts.help = true;
  if (command === "--version" || command === "-v") opts.version = true;
  if (
    command &&
    !["init", "diff", "update", "remove", "doctor", "completion"].includes(command) &&
    !command.startsWith("-")
  ) {
    throw new Error(`Unknown command: ${command}`);
  }

  for (let i = command && !command.startsWith("-") ? 1 : 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--agent") opts.agent = parseValue(argv, i++, "--agent");
    else if (arg === "--all") opts.all = true;
    else if (arg === "--force" || arg === "-f") opts.force = true;
    else if (arg === "--fix") opts.fix = true;
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

function configTarget(): AgentTarget {
  return {
    id: "codex",
    name: "Noyap",
    file: "noyap.config.json",
    template: "",
    writeMode: "replace",
    notes: "Noyap config"
  } as AgentTarget;
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

async function optionsWithExistingConfig(opts: InitOptions): Promise<InitOptions> {
  if (JSON.stringify(opts.config) !== JSON.stringify(defaultConfig)) return opts;
  const configPath = path.join(opts.cwd, "noyap.config.json");
  if (!existsSync(configPath)) return opts;

  try {
    const current = JSON.parse(await readFile(configPath, "utf8")) as Partial<NoyapConfig>;
    return { ...opts, config: normalizeConfig(current) };
  } catch {
    return opts;
  }
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

async function updateSafe(file: string, content: string, agent: AgentTarget, opts: InitOptions): Promise<WriteResult> {
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
  if (!current.includes(sentinel) && file !== "noyap.config.json" && !opts.force) {
    return { agent, status: "skipped", file, message: "no Noyap marker" };
  }
  if (current === content) return { agent, status: "unchanged", file };
  if (!opts.dryRun) await writeFile(fullPath, content, "utf8");
  return { agent, status: current.includes(sentinel) || file === "noyap.config.json" ? "updated" : "overwritten", file };
}

function replaceNoyapSection(current: string, content: string): string {
  const index = current.indexOf(sentinel);
  if (index === -1) return mergeAgentsMd(current, content);
  const prefix = current.slice(0, index).trimEnd();
  return prefix ? `${prefix}\n\n${content}` : content;
}

function removeNoyapSection(current: string): string {
  const index = current.indexOf(sentinel);
  if (index === -1) return current;
  return `${current.slice(0, index).trimEnd()}\n`;
}

function removeNoyapReference(current: string): string {
  const index = current.indexOf(noyapReferenceSentinel);
  if (index === -1) return current;
  return `${current.slice(0, index).trimEnd()}\n`;
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

async function updateAgentsMdRules(content: string, agent: AgentTarget, opts: InitOptions): Promise<WriteResult[]> {
  const fullPath = path.join(opts.cwd, agent.file);
  const exists = existsSync(fullPath);
  const chain = await findAgentsMdChain(opts.cwd);
  const warnings = detectAgentsMdConflicts(chain, opts.config);
  const results: WriteResult[] = [...agentsMdConflictResults(agent, warnings)];
  const strategy = opts.force ? "overwrite" : opts.agentsMdStrategy;

  if (strategy === "separate") {
    const separateTarget = separateAgentsMdTarget(agent);
    const separatePath = path.join(opts.cwd, noyapSeparateFile);
    const separateExists = existsSync(separatePath);
    if (!opts.dryRun) await writeTextFile(opts.cwd, noyapSeparateFile, content);
    results.push({ agent: separateTarget, status: separateExists ? "updated" : "created", file: noyapSeparateFile });

    const current = exists ? await readFile(fullPath, "utf8") : "";
    const referenced = referenceSeparateAgentsMd(current);
    if (!opts.dryRun) await writeTextFile(opts.cwd, agent.file, referenced);
    results.push({ agent, status: exists && current === referenced ? "unchanged" : exists ? "referenced" : "created", file: agent.file });
    return results;
  }

  if (!exists) {
    if (!opts.dryRun) await writeTextFile(opts.cwd, agent.file, content);
    return [...results, { agent, status: "created", file: agent.file }];
  }

  const current = await readFile(fullPath, "utf8");
  const next = strategy === "overwrite" ? content : replaceNoyapSection(current, content);
  if (current === next) return [...results, { agent, status: "unchanged", file: agent.file }];
  if (!opts.dryRun) await writeTextFile(opts.cwd, agent.file, next);
  return [...results, { agent, status: current.includes(sentinel) ? "updated" : strategy === "overwrite" ? "overwritten" : "merged", file: agent.file }];
}

async function writeConfig(opts: InitOptions): Promise<WriteResult> {
  const body = `${JSON.stringify(opts.config, null, 2)}\n`;
  return writeSafe("noyap.config.json", body, configTarget(), opts);
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

export async function update(opts: InitOptions): Promise<WriteResult[]> {
  const effectiveOpts = await optionsWithExistingConfig(opts);
  const targets = selectedAgents(effectiveOpts);
  const results: WriteResult[] = [
    await updateSafe("noyap.config.json", `${JSON.stringify(effectiveOpts.config, null, 2)}\n`, configTarget(), effectiveOpts)
  ];

  for (const agent of targets) {
    const template = await loadTemplate(agent.template);
    const content = renderTemplate(template, agent, effectiveOpts.config);
    if (agent.file === "AGENTS.md") results.push(...await updateAgentsMdRules(content, agent, effectiveOpts));
    else results.push(await updateSafe(agent.file, content, agent, effectiveOpts));
  }

  return results;
}

async function removeConfig(opts: InitOptions): Promise<WriteResult> {
  const file = "noyap.config.json";
  const fullPath = path.join(opts.cwd, file);
  if (!existsSync(fullPath)) return { agent: configTarget(), status: "missing", file };
  if (!opts.dryRun) await rm(fullPath, { force: true });
  return { agent: configTarget(), status: "removed", file };
}

async function removeAgentRules(agent: AgentTarget, opts: InitOptions): Promise<WriteResult[]> {
  const fullPath = path.join(opts.cwd, agent.file);
  if (!existsSync(fullPath)) return [{ agent, status: "missing", file: agent.file }];

  const current = await readFile(fullPath, "utf8");
  const results: WriteResult[] = [];

  if (agent.file === "AGENTS.md" && (current.includes(noyapReferenceSentinel) || current.includes(noyapSeparateFile))) {
    const separatePath = path.join(opts.cwd, noyapSeparateFile);
    if (existsSync(separatePath)) {
      const separate = await readFile(separatePath, "utf8");
      if (separate.includes(sentinel)) {
        if (!opts.dryRun) await rm(separatePath, { force: true });
        results.push({ agent: separateAgentsMdTarget(agent), status: "removed", file: noyapSeparateFile });
      }
    }

    const next = removeNoyapReference(current);
    if (next !== current) {
      if (!opts.dryRun) await writeTextFile(opts.cwd, agent.file, next);
      results.push({ agent, status: "removed", file: agent.file, message: "reference removed" });
      return results;
    }
  }

  if (!current.includes(sentinel)) return [{ agent, status: "skipped", file: agent.file, message: "no Noyap marker" }];

  if (agent.writeMode === "replace" && agent.file !== "AGENTS.md") {
    if (!opts.dryRun) await rm(fullPath, { force: true });
    return [{ agent, status: "removed", file: agent.file }];
  }

  const next = removeNoyapSection(current);
  if (!opts.dryRun) await writeTextFile(opts.cwd, agent.file, next);
  return [{ agent, status: "removed", file: agent.file }];
}

export async function remove(opts: InitOptions): Promise<WriteResult[]> {
  const results: WriteResult[] = [];
  if (opts.all || !opts.agent) results.push(await removeConfig(opts));
  for (const agent of selectedAgents(opts)) results.push(...await removeAgentRules(agent, opts));
  return results;
}

export interface FileDiff {
  file: string;
  before: string;
  after: string;
}

function unifiedDiff(file: string, before: string, after: string): string {
  if (before === after) return "";
  const beforeLines = before ? before.split("\n") : [];
  const afterLines = after ? after.split("\n") : [];
  return [
    `--- a/${file}`,
    `+++ b/${file}`,
    `@@ -1,${beforeLines.length} +1,${afterLines.length} @@`,
    ...beforeLines.filter((line, index) => line !== afterLines[index]).map((line) => `-${line}`),
    ...afterLines.filter((line, index) => line !== beforeLines[index]).map((line) => `+${line}`)
  ].join("\n");
}

async function readOptional(cwd: string, file: string): Promise<string> {
  const fullPath = path.join(cwd, file);
  return existsSync(fullPath) ? readFile(fullPath, "utf8") : "";
}

export async function diff(opts: InitOptions): Promise<string> {
  const effectiveOpts = await optionsWithExistingConfig(opts);
  const preview = await update({ ...effectiveOpts, dryRun: true });
  const files = [...new Set(preview.filter((result) => result.status !== "unchanged" && result.status !== "warning").map((result) => result.file))];
  const diffs: string[] = [];

  for (const file of files) {
    const before = await readOptional(effectiveOpts.cwd, file);
    let after = before;
    if (file === "noyap.config.json") {
      after = `${JSON.stringify(effectiveOpts.config, null, 2)}\n`;
    } else {
      const agent = selectedAgents(effectiveOpts).find((item) => item.file === file || (file === noyapSeparateFile && item.file === "AGENTS.md"));
      if (!agent) continue;
      const content = renderTemplate(await loadTemplate(agent.template), agent, effectiveOpts.config);
      if (file === noyapSeparateFile) after = content;
      else if (agent.file === "AGENTS.md") after = before ? replaceNoyapSection(before, content) : content;
      else after = content;
    }
    const rendered = unifiedDiff(file, before, after);
    if (rendered) diffs.push(rendered);
  }

  return diffs.length ? diffs.join("\n\n") : "No changes.";
}

export async function doctorFix(opts: InitOptions): Promise<WriteResult[]> {
  const result = await doctor({ cwd: opts.cwd, agent: opts.agent, all: opts.all });
  if (result.ok) return [];
  const effectiveOpts = await optionsWithExistingConfig(opts);
  return init({ ...effectiveOpts, command: "init", dryRun: false });
}

export function helpText(): string {
  return formatHelp();
}

export function formatSummary(results: WriteResult[], dryRun = false, title = "Noyap init"): string {
  const icon: Record<WriteResult["status"], string> = {
    created: "✔",
    appended: "✔",
    merged: "✔",
    referenced: "✔",
    updated: "✔",
    removed: "✔",
    overwritten: "✔",
    skipped: "⚠",
    unchanged: "✔",
    missing: "⚠",
    warning: "⚠"
  };
  const action: Record<WriteResult["status"], string> = {
    created: "Generated",
    appended: "Updated",
    merged: "Merged",
    referenced: "Referenced",
    updated: "Updated",
    removed: "Removed",
    overwritten: "Overwrote",
    skipped: "Skipped existing",
    unchanged: "Already configured",
    missing: "Missing",
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
    `${title}${dryRun ? " (dry run)" : ""}`,
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
