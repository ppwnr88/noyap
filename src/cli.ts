import { agentAliases, agents } from "./agents.js";
import { defaultConfig, languages, modes, rolePresets, thaiTechnicalTermModes } from "./config.js";

export const commandDefinitions = [
  {
    name: "init",
    summary: "Generate config and agent rule files"
  },
  {
    name: "doctor",
    summary: "Verify config and generated rule files"
  }
] as const;

export const optionDefinitions = [
  { flag: "--agent <id>", summary: `Target one agent: ${agents.map((agent) => agent.id).join(", ")}` },
  { flag: "--all", summary: "Generate or verify every supported agent" },
  { flag: "--interactive", summary: "Run guided init flow" },
  { flag: "--completion <shell>", summary: "Reserved for future bash | zsh | fish completion" },
  { flag: "--lang <value>", summary: languages.join(" | ") },
  { flag: "--mode <value>", summary: modes.join(" | ") },
  { flag: "--preset <value>", summary: rolePresets.join(" | ") },
  { flag: "--thai-technical-terms <v>", summary: thaiTechnicalTermModes.join(" | ") },
  { flag: "--preserve-mixed-language", summary: "Keep natural Thai/English mixed style" },
  { flag: "--no-preserve-mixed-language", summary: "Disable mixed-language preservation" },
  { flag: "--natural-thai", summary: "Prefer natural Thai developer language" },
  { flag: "--no-natural-thai", summary: "Disable natural Thai preference" },
  { flag: "--max-explanation-lines <n>", summary: `Default: ${defaultConfig.maxExplanationLines}` },
  { flag: "--force", summary: "Overwrite existing replace-mode rule files" },
  { flag: "--dry-run", summary: "Preview without writing files" },
  { flag: "-h, --help", summary: "Show help" },
  { flag: "-v, --version", summary: "Show version" }
] as const;

export const quickStartExamples = [
  "npx noyap init --interactive",
  "npx noyap init --all --mode balanced",
  "npx noyap init --lang th --mode thai-dev",
  "npx noyap doctor"
] as const;

export const commonExamples = [
  "npx noyap init --agent claude",
  "npx noyap init --agent cursor --preset frontend",
  "npx noyap init --mode thai-dev",
  "npx noyap init --preset backend",
  "npx noyap init --all --dry-run",
  "npx noyap doctor --agent codex"
] as const;

export const completionMetadata = {
  commands: commandDefinitions.map((command) => command.name),
  agents: agents.map((agent) => agent.id),
  aliases: Object.keys(agentAliases),
  languages,
  modes,
  rolePresets,
  thaiTechnicalTermModes
} as const;

export function formatHelp(): string {
  const optionWidth = Math.max(...optionDefinitions.map((option) => option.flag.length)) + 4;
  const commandWidth = Math.max(...commandDefinitions.map((command) => command.name.length)) + 4;

  return [
    "Noyap - less yap, more code.",
    "",
    "Usage:",
    "  npx noyap <command> [options]",
    "",
    "Common usage:",
    ...quickStartExamples.map((example) => `  ${example}`),
    "",
    "Commands:",
    ...commandDefinitions.map((command) => `  ${command.name.padEnd(commandWidth)}${command.summary}`),
    "",
    "Options:",
    ...optionDefinitions.map((option) => `  ${option.flag.padEnd(optionWidth)}${option.summary}`),
    "",
    "Aliases:",
    `  ${Object.keys(agentAliases).join(", ")}`,
    "",
    "Examples:",
    ...commonExamples.map((example) => `  ${example}`),
    ""
  ].join("\n");
}
