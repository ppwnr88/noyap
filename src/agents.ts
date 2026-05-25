export type AgentCategory = "terminal" | "ide" | "extension" | "platform";

export interface AgentTarget {
  id: string;
  name: string;
  aliases: string[];
  file: string;
  template: string;
  writeMode: "replace" | "append";
  notes: string;
  category: AgentCategory;
  docsUrl: string;
  detectFiles: string[];
}

export const agents: AgentTarget[] = [
  {
    id: "claude",
    name: "Claude Code",
    aliases: ["claude-code"],
    file: "CLAUDE.md",
    template: "claude.md",
    writeMode: "append",
    notes: "Project memory file",
    category: "terminal",
    docsUrl: "https://docs.anthropic.com/en/docs/claude-code/memory",
    detectFiles: ["CLAUDE.md"]
  },
  {
    id: "codex",
    name: "OpenAI Codex / Codex CLI",
    aliases: ["openai-codex", "codex-cli"],
    file: "AGENTS.md",
    template: "codex.md",
    writeMode: "append",
    notes: "Repo instructions file",
    category: "terminal",
    docsUrl: "https://github.com/openai/codex",
    detectFiles: ["AGENTS.md"]
  },
  {
    id: "cursor",
    name: "Cursor",
    aliases: [],
    file: ".cursor/rules/noyap.mdc",
    template: "cursor.md",
    writeMode: "replace",
    notes: "Always-on Cursor rule",
    category: "ide",
    docsUrl: "https://docs.cursor.com/context/rules",
    detectFiles: [".cursor/rules", ".cursorrules"]
  },
  {
    id: "windsurf",
    name: "Windsurf",
    aliases: [],
    file: ".windsurf/rules/noyap.md",
    template: "windsurf.md",
    writeMode: "replace",
    notes: "Always-on Windsurf rule",
    category: "ide",
    docsUrl: "https://docs.windsurf.com/windsurf/cascade/memories",
    detectFiles: [".windsurf/rules", ".windsurfrules"]
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    aliases: ["github-copilot"],
    file: ".github/copilot-instructions.md",
    template: "copilot.md",
    writeMode: "append",
    notes: "Repository custom instructions",
    category: "extension",
    docsUrl: "https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot",
    detectFiles: [".github/copilot-instructions.md", ".github/instructions"]
  },
  {
    id: "cline",
    name: "Cline",
    aliases: [],
    file: ".clinerules/noyap.md",
    template: "cline.md",
    writeMode: "replace",
    notes: "Project rule file",
    category: "extension",
    docsUrl: "https://docs.cline.bot/improving-your-prompting-skills/custom-instructions-library",
    detectFiles: [".clinerules"]
  },
  {
    id: "continue",
    name: "Continue",
    aliases: [],
    file: ".continue/rules/noyap.md",
    template: "continue.md",
    writeMode: "replace",
    notes: "Project rule file",
    category: "extension",
    docsUrl: "https://docs.continue.dev/customize/deep-dives/rules",
    detectFiles: [".continue/rules"]
  },
  {
    id: "gemini",
    name: "Gemini CLI",
    aliases: ["gemini-cli"],
    file: "GEMINI.md",
    template: "gemini.md",
    writeMode: "append",
    notes: "Project instruction file",
    category: "terminal",
    docsUrl: "https://github.com/google-gemini/gemini-cli",
    detectFiles: ["GEMINI.md"]
  },
  {
    id: "roo",
    name: "Roo Code",
    aliases: ["roo-code"],
    file: ".roo/rules/noyap.md",
    template: "roo.md",
    writeMode: "replace",
    notes: "Project rule file",
    category: "extension",
    docsUrl: "https://docs.roocode.com/features/custom-instructions",
    detectFiles: [".roo/rules", ".roorules"]
  },
  {
    id: "opencode",
    name: "OpenCode",
    aliases: ["open-code"],
    file: "AGENTS.md",
    template: "opencode.md",
    writeMode: "append",
    notes: "Project instructions file",
    category: "terminal",
    docsUrl: "https://opencode.ai/docs/rules",
    detectFiles: ["AGENTS.md", "opencode.json"]
  },
  {
    id: "aider",
    name: "Aider",
    aliases: [],
    file: "CONVENTIONS.md",
    template: "aider.md",
    writeMode: "append",
    notes: "Convention file loaded through .aider.conf.yml or --read",
    category: "terminal",
    docsUrl: "https://aider.chat/docs/usage/conventions.html",
    detectFiles: [".aider.conf.yml", "CONVENTIONS.md"]
  },
  {
    id: "junie",
    name: "JetBrains Junie",
    aliases: ["jetbrains-junie"],
    file: ".junie/AGENTS.md",
    template: "junie.md",
    writeMode: "append",
    notes: "Preferred Junie project guidelines file",
    category: "ide",
    docsUrl: "https://www.jetbrains.com/help/ai-assistant/junie-agent.html",
    detectFiles: [".junie/AGENTS.md", ".junie/guidelines.md", ".junie/guidelines"]
  },
  {
    id: "kiro",
    name: "Amazon Kiro",
    aliases: ["amazon-kiro"],
    file: ".kiro/steering/noyap.md",
    template: "kiro.md",
    writeMode: "replace",
    notes: "Workspace steering file",
    category: "ide",
    docsUrl: "https://kiro.dev/docs/steering/",
    detectFiles: [".kiro/steering", "AGENTS.md"]
  },
  {
    id: "zed",
    name: "Zed AI",
    aliases: ["zed-ai"],
    file: ".rules",
    template: "zed.md",
    writeMode: "append",
    notes: "Project-level Zed Agent Panel rules",
    category: "ide",
    docsUrl: "https://zed.dev/docs/ai/rules",
    detectFiles: [".rules", ".cursorrules", ".windsurfrules"]
  },
  {
    id: "kilo",
    name: "Kilo Code",
    aliases: ["kilo-code", "kilocode"],
    file: ".kilocode/rules/noyap.md",
    template: "kilo.md",
    writeMode: "replace",
    notes: "Project rule file",
    category: "extension",
    docsUrl: "https://kilo.ai/docs/customize/custom-instructions",
    detectFiles: [".kilocode/rules", ".kilocoderules", "AGENTS.md"]
  },
  {
    id: "tabnine",
    name: "Tabnine Agent",
    aliases: ["tabnine-agent"],
    file: ".tabnine/guidelines/noyap.md",
    template: "tabnine.md",
    writeMode: "replace",
    notes: "Project guideline file",
    category: "extension",
    docsUrl: "https://docs.tabnine.com/main/getting-started/tabnine-agent/guidelines",
    detectFiles: [".tabnine/guidelines"]
  },
  {
    id: "amazonq",
    name: "Amazon Q Developer",
    aliases: ["amazon-q", "amazon-q-developer"],
    file: ".amazonq/rules/noyap.md",
    template: "amazonq.md",
    writeMode: "replace",
    notes: "Project rule file",
    category: "extension",
    docsUrl: "https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/context-project-rules.html",
    detectFiles: [".amazonq/rules"]
  },
  {
    id: "devin",
    name: "Devin",
    aliases: ["devin-ai", "devin-terminal"],
    file: ".devin/AGENTS.md",
    template: "devin.md",
    writeMode: "append",
    notes: "Scoped Devin instruction file",
    category: "platform",
    docsUrl: "https://cli.devin.ai/docs/extensibility/rules",
    detectFiles: [".devin/AGENTS.md", "AGENTS.md", "REVIEW.md"]
  },
  {
    id: "void",
    name: "Void",
    aliases: ["void-editor", "void-ai"],
    file: ".voidrules",
    template: "void.md",
    writeMode: "append",
    notes: "Void project rule file",
    category: "ide",
    docsUrl: "https://github.com/voideditor/void",
    detectFiles: [".voidrules"]
  }
];

export type AgentId = (typeof agents)[number]["id"];

export const agentAliases: Record<string, AgentId> = Object.fromEntries(
  agents.flatMap((agent) => agent.aliases.map((alias) => [alias, agent.id]))
) as Record<string, AgentId>;

export function findAgent(id: string): AgentTarget | undefined {
  const normalized = agentAliases[id] ?? id;
  return agents.find((agent) => agent.id === normalized);
}

export function detectAgents(cwd: string): AgentTarget[] {
  return agents.filter((agent) => agent.detectFiles.some((file) => existsSync(path.join(cwd, file))));
}

export function formatAgentsList(items = agents, json = false): string {
  if (json) return `${JSON.stringify(items, null, 2)}\n`;
  const idWidth = Math.max(...items.map((agent) => agent.id.length), "id".length) + 2;
  const nameWidth = Math.max(...items.map((agent) => agent.name.length), "agent".length) + 2;
  return [
    "Noyap agents",
    "",
    `${"id".padEnd(idWidth)}${"agent".padEnd(nameWidth)}file`,
    `${"-".repeat(2).padEnd(idWidth)}${"-".repeat(5).padEnd(nameWidth)}${"-".repeat(4)}`,
    ...items.map((agent) => `${agent.id.padEnd(idWidth)}${agent.name.padEnd(nameWidth)}${agent.file}`)
  ].join("\n");
}

export function validateAgentRegistry(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const aliases = new Set<string>();

  for (const agent of agents) {
    if (ids.has(agent.id)) errors.push(`duplicate agent id: ${agent.id}`);
    ids.add(agent.id);
    if (!agent.file) errors.push(`${agent.id} missing file`);
    if (!agent.template) errors.push(`${agent.id} missing template`);
    if (!agent.docsUrl) errors.push(`${agent.id} missing docsUrl`);
    for (const alias of agent.aliases) {
      if (ids.has(alias)) errors.push(`alias collides with agent id: ${alias}`);
      if (aliases.has(alias)) errors.push(`duplicate agent alias: ${alias}`);
      aliases.add(alias);
    }
  }

  return errors;
}
import { existsSync } from "node:fs";
import path from "node:path";
