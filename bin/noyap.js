#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import {
  completionMetadata,
  diff,
  doctor,
  doctorFix,
  formatDoctorResult,
  formatSummary,
  helpText,
  init,
  parseArgs,
  remove,
  update
} from "../dist/index.js";

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const color = {
  green: (value) => (useColor ? `\x1b[32m${value}\x1b[0m` : value),
  red: (value) => (useColor ? `\x1b[31m${value}\x1b[0m` : value),
  yellow: (value) => (useColor ? `\x1b[33m${value}\x1b[0m` : value),
  cyan: (value) => (useColor ? `\x1b[36m${value}\x1b[0m` : value),
  bold: (value) => (useColor ? `\x1b[1m${value}\x1b[0m` : value)
};

function colorizeSummary(text) {
  return text
    .replace(/^Noyap init.*/m, (line) => color.bold(color.cyan(line)))
    .replace(/^Noyap doctor.*/m, (line) => color.bold(color.cyan(line)))
    .replace(/^Checks:$/m, (line) => color.bold(line))
    .replace(/^Summary:.*$/gm, (line) => color.bold(line))
    .replace(/^Common usage:$/m, (line) => color.bold(line))
    .replace(/^Examples:$/m, (line) => color.bold(line))
    .replace(/^  ✔ .*/gm, (line) => color.green(line))
    .replace(/^  ⚠ .*/gm, (line) => color.yellow(line))
    .replace(/^  ✖ .*/gm, (line) => color.red(line))
    .replace(/^✔ .*/gm, (line) => color.green(line))
    .replace(/^⚠ .*/gm, (line) => color.yellow(line))
    .replace(/^✖ .*/gm, (line) => color.red(line))
    .replace(/^  \+ .*/gm, (line) => color.green(line))
    .replace(/^  ~ .*/gm, (line) => color.cyan(line))
    .replace(/^  = .*/gm, (line) => color.green(line))
    .replace(/^  ! .*/gm, (line) => color.yellow(line))
    .replace(/^  x .*/gm, (line) => color.red(line))
    .replace(/^  \? .*/gm, (line) => color.yellow(line))
    .replace(/^OK$/m, (line) => color.green(line))
    .replace(/^Issues found$/m, (line) => color.red(line))
    .replace(/^Done\.$/m, (line) => color.green(line));
}

async function askChoice(rl, label, choices, fallback) {
  console.log(color.bold(label));
  choices.forEach((choice, index) => {
    console.log(`  ${index + 1}. ${choice.label}`);
  });
  const answer = (await rl.question(`Choose [${fallback}]: `)).trim();
  const index = Number(answer || fallback) - 1;
  return choices[index]?.value ?? choices[Number(fallback) - 1].value;
}

async function interactiveInitArgs() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log(color.bold(color.cyan("Noyap init")));
    console.log("Configure concise AI-agent rules for this project.\n");

    const agent = await askChoice(
      rl,
      "Agent target",
      [
        { label: "Default: Codex + Claude + Cursor", value: "default" },
        { label: "All supported agents", value: "all" },
        { label: "Claude Code", value: "claude" },
        { label: "OpenAI Codex / Codex CLI", value: "codex" },
        { label: "OpenCode", value: "opencode" },
        { label: "Cursor", value: "cursor" },
        { label: "Windsurf", value: "windsurf" },
        { label: "GitHub Copilot", value: "copilot" },
        { label: "Cline", value: "cline" },
        { label: "Continue", value: "continue" },
        { label: "Gemini CLI", value: "gemini" },
        { label: "Roo Code", value: "roo" }
      ],
      "1"
    );

    const mode = await askChoice(
      rl,
      "\nVerbosity mode",
      [
        { label: "balanced - concise default", value: "balanced" },
        { label: "minimal - very short", value: "minimal" },
        { label: "senior - tradeoffs and caveats", value: "senior" },
        { label: "thai-dev - natural Thai developer style", value: "thai-dev" },
        { label: "bilingual - Thai/English mixed teams", value: "bilingual" },
        { label: "hardcore - extremely terse", value: "hardcore" },
        { label: "hardcore-th - extremely terse Thai dev style", value: "hardcore-th" }
      ],
      "1"
    );

    const language = await askChoice(
      rl,
      "\nLanguage mode",
      [
        { label: "auto - match the user", value: "auto" },
        { label: "en - English", value: "en" },
        { label: "th - Thai", value: "th" }
      ],
      "1"
    );

    const preset = await askChoice(
      rl,
      "\nRole preset",
      [
        { label: "default - general coding", value: "default" },
        { label: "backend - APIs, auth, validation, migrations", value: "backend" },
        { label: "frontend - rendering, state, accessibility", value: "frontend" },
        { label: "devops - deploys, Docker, CI/CD, rollback", value: "devops" },
        { label: "sql - queries, indexes, migrations", value: "sql" },
        { label: "security - auth, secrets, threat model", value: "security" },
        { label: "reviewer - findings first", value: "reviewer" }
      ],
      "1"
    );

    const confirm = (await rl.question("\nGenerate files? [Y/n]: ")).trim().toLowerCase();
    if (confirm === "n" || confirm === "no") {
      console.log("Cancelled.");
      process.exit(0);
    }

    const args = ["init", "--mode", mode, "--lang", language];
    if (preset !== "default") args.push("--preset", preset);
    if (agent === "all") args.push("--all");
    else if (agent !== "default") args.push("--agent", agent);

    if (["default", "all", "codex", "opencode"].includes(agent) && existsSync(join(process.cwd(), "AGENTS.md"))) {
      console.log(color.yellow("\nExisting AGENTS.md found."));
      const codexStrategy = await askChoice(
        rl,
        "What would you like to do?",
        [
          { label: "Merge Noyap rules into existing AGENTS.md (recommended)", value: "merge" },
          { label: "Create separate .noyap/AGENTS.noyap.md and reference it", value: "separate" },
          { label: "Overwrite existing AGENTS.md", value: "overwrite" },
          { label: "Cancel AGENTS.md rule generation", value: "cancel" }
        ],
        "1"
      );
      if (codexStrategy === "overwrite") {
        const overwrite = (await rl.question("Overwrite AGENTS.md? Type overwrite to confirm: ")).trim();
        if (overwrite !== "overwrite") {
          args.push("--agents-md-strategy", "cancel");
        } else {
          args.push("--agents-md-strategy", "overwrite");
        }
      } else {
        args.push("--agents-md-strategy", codexStrategy);
      }
    }
    return args;
  } finally {
    rl.close();
  }
}

function selfDoctor() {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const checks = [
    ["package name", pkg.name === "@ppwnr88/noyap"],
    ["version", Boolean(pkg.version)],
    ["bin.noyap", pkg.bin?.noyap === "bin/noyap.js" || pkg.bin?.noyap === "./bin/noyap.js"],
    ["repository", pkg.repository?.url?.includes("github.com/ppwnr88/noyap")],
    ["license", pkg.license === "MIT"]
  ];

  console.log(colorizeSummary("Noyap doctor\n"));
  for (const [name, ok] of checks) {
    console.log(ok ? color.green(`  + ${name}`) : color.red(`  x ${name}`));
  }
  const ok = checks.every(([, passed]) => passed);
  console.log("");
  console.log(ok ? color.green("OK") : color.red("Issues found"));
  if (!ok) process.exitCode = 1;
}

function completionScript(shell) {
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

async function main() {
  const rawArgs = process.argv.slice(2);

  const completionIndex = rawArgs.indexOf("--completion");
  if (completionIndex !== -1) {
    const shell = rawArgs[completionIndex + 1];
    console.log(completionScript(shell));
    return;
  }

  if (rawArgs[0] === "completion") {
    console.log(completionScript(rawArgs[1]));
    return;
  }

  if (rawArgs[0] === "doctor" && rawArgs.includes("--self")) {
    selfDoctor();
    return;
  }

  const args =
    rawArgs[0] === "init" &&
    (rawArgs.length === 1 || rawArgs.includes("--interactive")) &&
    process.stdin.isTTY &&
    process.stdout.isTTY
      ? await interactiveInitArgs()
      : rawArgs.filter((arg) => arg !== "--interactive");

  const opts = parseArgs(args);
  if (opts.help) {
    console.log(helpText());
    return;
  }
  if (opts.version) {
    const root = dirname(dirname(fileURLToPath(import.meta.url)));
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    console.log(pkg.version);
    return;
  }

  if (args[0] === "doctor") {
    const result = await doctor({ cwd: opts.cwd, agent: opts.agent, all: opts.all });
    console.log(colorizeSummary(formatDoctorResult(result)));
    if (!result.ok && opts.fix) {
      console.log("");
      console.log(colorizeSummary(formatSummary(await doctorFix(opts), false, "Noyap doctor --fix")));
    } else if (!result.ok) {
      process.exitCode = 1;
    }
    return;
  }

  if (args[0] === "diff") {
    console.log(await diff(opts));
    return;
  }

  const results =
    args[0] === "update"
      ? await update(opts)
      : args[0] === "remove"
        ? await remove(opts)
        : await init(opts);
  const title = args[0] === "update" ? "Noyap update" : args[0] === "remove" ? "Noyap remove" : "Noyap init";
  console.log(colorizeSummary(formatSummary(results, opts.dryRun, title)));
}

main().catch((error) => {
  console.error(color.red(`Error: ${error.message}`));
  process.exitCode = 1;
});
