# Changelog

All notable changes to Noyap will be documented here.

This project follows semantic versioning.

## 0.3.0 - Expanded agent registry

- Expand the agent registry with Aider, JetBrains Junie, Amazon Kiro, Zed AI, Kilo Code, Tabnine Agent, Amazon Q Developer, Devin, and Void.
- Add richer agent metadata with aliases, categories, docs links, and detection paths.
- Add `noyap agents` with text and JSON output.
- Add `--detected` and `--exclude <ids>` for agent selection.
- Add registry validation and coverage for new agent templates.

## 0.2.1 - Lifecycle CLI commands

- Add `noyap diff` to preview generated config and rule file changes.
- Add `noyap update` to refresh existing Noyap-managed files.
- Add `noyap remove` to remove generated Noyap config and rule sections.
- Add `noyap completion <bash|zsh|fish>` as the primary shell completion command.
- Add `noyap doctor --fix` to create missing config and selected rule files.

## 0.2.0 - OpenCode and safer AGENTS.md support

- Add OpenCode as a first-class supported agent.
- Add `templates/opencode.md`.
- Add safe AGENTS.md merge, separate-file, overwrite, and cancel strategies.
- Add `--agents-md-strategy` for Codex/OpenCode AGENTS.md handling.
- Preserve existing project AGENTS.md rules and warn on obvious verbosity conflicts.
- Add nested AGENTS.md chain detection for monorepo workflows.
- Add tests for OpenCode generation, merge, separate-file setup, and AGENTS.md preservation.

## 0.1.0 - Initial public release

- Add `noyap init` CLI.
- Add `noyap doctor`.
- Add rule templates for Claude Code, Codex, Cursor, Windsurf, GitHub Copilot, Cline, Continue, Gemini CLI, and Roo Code.
- Add English, Thai, and mixed Thai/English behavior rules.
- Add verbosity modes: `minimal`, `balanced`, `senior`, `thai-dev`, `bilingual`, `hardcore`, `hardcore-th`.
- Add role presets: `backend`, `frontend`, `devops`, `sql`, `security`, `reviewer`.
- Add safety rules for data loss, security, production deploys, migrations, billing/cost, destructive commands, and secrets.
- Add benchmark suite and golden tests.
