import { agentAliases, agents } from "./agents.js";
import { defaultConfig, languages, modes, rolePresets, thaiTechnicalTermModes } from "./config.js";

export const commandDefinitions = [
  {
    name: "init",
    summary: "Generate config and agent rule files"
  },
  {
    name: "diff",
    summary: "Preview generated file changes as a unified diff"
  },
  {
    name: "update",
    summary: "Refresh existing Noyap config and rule files"
  },
  {
    name: "remove",
    summary: "Remove Noyap config and generated rule sections"
  },
  {
    name: "doctor",
    summary: "Verify config and generated rule files"
  },
  {
    name: "completion",
    summary: "Print shell completion for bash, zsh, or fish"
  }
] as const;

export const optionDefinitions = [
  { flag: "--agent <id>", summary: `Target one agent: ${agents.map((agent) => agent.id).join(", ")}` },
  { flag: "--all", summary: "Generate or verify every supported agent" },
  { flag: "--interactive", summary: "Run guided init flow" },
  { flag: "--completion <shell>", summary: "Alias for completion bash | zsh | fish" },
  { flag: "--lang <value>", summary: languages.join(" | ") },
  { flag: "--mode <value>", summary: modes.join(" | ") },
  { flag: "--preset <value>", summary: rolePresets.join(" | ") },
  { flag: "--agents-md-strategy <value>", summary: "merge | separate | overwrite | cancel" },
  { flag: "--codex-strategy <value>", summary: "Alias for --agents-md-strategy" },
  { flag: "--thai-technical-terms <v>", summary: thaiTechnicalTermModes.join(" | ") },
  { flag: "--preserve-mixed-language", summary: "Keep natural Thai/English mixed style" },
  { flag: "--no-preserve-mixed-language", summary: "Disable mixed-language preservation" },
  { flag: "--natural-thai", summary: "Prefer natural Thai developer language" },
  { flag: "--no-natural-thai", summary: "Disable natural Thai preference" },
  { flag: "--max-explanation-lines <n>", summary: `Default: ${defaultConfig.maxExplanationLines}` },
  { flag: "--fix", summary: "With doctor, create missing Noyap files" },
  { flag: "--force", summary: "Overwrite existing replace-mode rule files" },
  { flag: "--dry-run", summary: "Preview without writing files" },
  { flag: "-h, --help", summary: "Show help" },
  { flag: "-v, --version", summary: "Show version" }
] as const;

export const quickStartExamples = [
  "npx @ppwnr88/noyap init --interactive",
  "npx @ppwnr88/noyap init --all --mode balanced",
  "npx @ppwnr88/noyap init --lang th --mode thai-dev",
  "npx @ppwnr88/noyap diff --all",
  "npx @ppwnr88/noyap doctor"
] as const;

export const commonExamples = [
  "npx @ppwnr88/noyap init --agent claude",
  "npx @ppwnr88/noyap init --agent codex --agents-md-strategy separate",
  "npx @ppwnr88/noyap init --agent opencode",
  "npx @ppwnr88/noyap init --agent cursor --preset frontend",
  "npx @ppwnr88/noyap init --mode thai-dev",
  "npx @ppwnr88/noyap init --preset backend",
  "npx @ppwnr88/noyap init --all --dry-run",
  "npx @ppwnr88/noyap diff --agent cursor",
  "npx @ppwnr88/noyap update --all",
  "npx @ppwnr88/noyap remove --agent cursor",
  "npx @ppwnr88/noyap doctor --agent codex --fix",
  "npx @ppwnr88/noyap completion zsh"
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

export function completionScript(shell: string): string {
  const commands = completionMetadata.commands.join(" ");
  const agents = [...completionMetadata.agents, ...completionMetadata.aliases].join(" ");
  const modes = completionMetadata.modes.join(" ");
  const languages = completionMetadata.languages.join(" ");
  const presets = completionMetadata.rolePresets.join(" ");
  const agentsMdStrategies = "merge separate overwrite cancel";

  if (shell === "zsh") {
    return `#compdef noyap
_noyap() {
  local -a commands agents modes languages presets agents_md_strategies
  commands=(${commands})
  agents=(${agents})
  modes=(${modes})
  languages=(${languages})
  presets=(${presets})
  agents_md_strategies=(${agentsMdStrategies})
  _arguments \\
    '1:command:(${commands})' \\
    '--agent[Target agent]:agent:(${agents})' \\
    '--mode[Verbosity mode]:mode:(${modes})' \\
    '--lang[Language mode]:language:(${languages})' \\
    '--preset[Role preset]:preset:(${presets})' \\
    '--agents-md-strategy[AGENTS.md strategy]:agents-md-strategy:(${agentsMdStrategies})' \\
    '--codex-strategy[Alias for --agents-md-strategy]:codex-strategy:(${agentsMdStrategies})' \\
    '--all[All supported agents]' \\
    '--interactive[Guided init flow]' \\
    '--dry-run[Preview only]' \\
    '--fix[Fix doctor issues]' \\
    '--force[Overwrite replace-mode files]' \\
    '--help[Show help]' \\
    '--version[Show version]'
}
_noyap
`;
  }

  if (shell === "bash") {
    return `_noyap_complete() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local words="${commands} --agent --mode --lang --preset --agents-md-strategy --codex-strategy --all --interactive --dry-run --fix --force --help --version"
  COMPREPLY=( $(compgen -W "$words" -- "$cur") )
}
complete -F _noyap_complete noyap
`;
  }

  if (shell === "fish") {
    return [
      "complete -c noyap -f",
      ...completionMetadata.commands.map((command) => `complete -c noyap -n '__fish_use_subcommand' -a '${command}'`),
      `complete -c noyap -l agent -a '${agents}'`,
      `complete -c noyap -l mode -a '${modes}'`,
      `complete -c noyap -l lang -a '${languages}'`,
      `complete -c noyap -l preset -a '${presets}'`,
      `complete -c noyap -l agents-md-strategy -a '${agentsMdStrategies}'`,
      `complete -c noyap -l codex-strategy -a '${agentsMdStrategies}'`,
      "complete -c noyap -l all",
      "complete -c noyap -l interactive",
      "complete -c noyap -l dry-run",
      "complete -c noyap -l fix",
      "complete -c noyap -l force"
    ].join("\n") + "\n";
  }

  throw new Error("Unsupported shell. Use one of: bash, zsh, fish");
}

export function formatHelp(): string {
  const optionWidth = Math.max(...optionDefinitions.map((option) => option.flag.length)) + 4;
  const commandWidth = Math.max(...commandDefinitions.map((command) => command.name.length)) + 4;

  return [
    "Noyap - less yap, more code.",
    "",
    "Usage:",
    "  npx @ppwnr88/noyap <command> [options]",
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
