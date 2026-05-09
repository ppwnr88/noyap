export type AgentId =
  | "claude"
  | "codex"
  | "cursor"
  | "windsurf"
  | "copilot"
  | "cline"
  | "continue"
  | "gemini"
  | "roo";

export interface AgentTarget {
  id: AgentId;
  name: string;
  file: string;
  template: string;
  writeMode: "replace" | "append";
  notes: string;
}

export const agentAliases: Record<string, AgentId> = {
  "claude-code": "claude",
  "openai-codex": "codex",
  "codex-cli": "codex",
  "github-copilot": "copilot",
  "gemini-cli": "gemini",
  "roo-code": "roo"
};

export const agents: AgentTarget[] = [
  {
    id: "claude",
    name: "Claude Code",
    file: "CLAUDE.md",
    template: "claude.md",
    writeMode: "append",
    notes: "Project memory file"
  },
  {
    id: "codex",
    name: "OpenAI Codex / Codex CLI",
    file: "AGENTS.md",
    template: "codex.md",
    writeMode: "append",
    notes: "Repo instructions file"
  },
  {
    id: "cursor",
    name: "Cursor",
    file: ".cursor/rules/noyap.mdc",
    template: "cursor.md",
    writeMode: "replace",
    notes: "Always-on Cursor rule"
  },
  {
    id: "windsurf",
    name: "Windsurf",
    file: ".windsurf/rules/noyap.md",
    template: "windsurf.md",
    writeMode: "replace",
    notes: "Always-on Windsurf rule"
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    file: ".github/copilot-instructions.md",
    template: "copilot.md",
    writeMode: "append",
    notes: "Repository custom instructions"
  },
  {
    id: "cline",
    name: "Cline",
    file: ".clinerules/noyap.md",
    template: "cline.md",
    writeMode: "replace",
    notes: "Project rule file"
  },
  {
    id: "continue",
    name: "Continue",
    file: ".continue/rules/noyap.md",
    template: "continue.md",
    writeMode: "replace",
    notes: "Project rule file"
  },
  {
    id: "gemini",
    name: "Gemini CLI",
    file: "GEMINI.md",
    template: "gemini.md",
    writeMode: "append",
    notes: "Project instruction file"
  },
  {
    id: "roo",
    name: "Roo Code",
    file: ".roo/rules/noyap.md",
    template: "roo.md",
    writeMode: "replace",
    notes: "Project rule file"
  }
];

export function findAgent(id: string): AgentTarget | undefined {
  const normalized = agentAliases[id] ?? id;
  return agents.find((agent) => agent.id === normalized);
}
