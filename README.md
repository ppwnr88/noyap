# Noyap

AI coding-agent replies with less filler and more signal.

[![npm](https://img.shields.io/npm/v/%40ppwnr88%2Fnoyap?color=111827)](https://www.npmjs.com/package/@ppwnr88/noyap)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Thai supported](https://img.shields.io/badge/Thai-supported-16a34a)](README.th.md)

Noyap installs communication rules for Claude Code, Codex, OpenCode, Cursor, Windsurf, Copilot, Cline, Continue, Gemini CLI, and Roo Code.

It keeps answers short, code-first, and practical while preserving technical meaning, warnings, and natural language style.

> ภาษาไทย: อ่านเอกสารเต็มได้ที่ [README.th.md](README.th.md)

## Quick Example

```text
Before
"Certainly! The issue appears to be that your object is recreated on every render,
which may cause unnecessary re-renders. You should consider wrapping it with useMemo."

After
"Object recreated every render. Wrap it with useMemo."
```

```bash
npx @ppwnr88/noyap init --all --mode balanced
```

## Why Noyap?

AI coding agents are useful. Their default communication is often not.

Noyap removes the parts that slow developers down:

- long introductions
- repeated summaries of your request
- "Sure, I can help with that"
- over-explaining obvious fixes
- translating Thai into awkward formal prose

It keeps the parts that matter:

- concrete fixes
- commands and code
- debugging cause -> fix
- architecture tradeoffs
- security and data-loss warnings
- natural English, Thai, or mixed Thai/English developer language

Less yap. More code.

## Before / After

### English

| Before                                                                                                                                                                                                                                                           | After                                                                                       |
| --- | --- |
| "Sure! The problem is most likely caused by the fact that your `options` object is recreated every time the component renders. React compares object props by reference, so this can trigger unnecessary child renders. You should use `useMemo` to memoize it." | "`options` is recreated every render. React compares by reference. Wrap it with `useMemo`." |

### Thai

| Before                                                                                                                                                                    | After                                                                                    |
| --- | --- |
| "ปัญหานี้น่าจะเกิดจาก request ที่ส่งไปยัง API ไม่มี Authorization header หรือ token หมดอายุแล้วครับ ลองตรวจสอบก่อนว่า frontend แนบ Bearer token ไปกับทุก request หรือไม่" | "น่าจะขาด `Authorization` header หรือ token หมดอายุ. เช็คว่า frontend ส่ง Bearer token." |

### Mixed Thai/English

| Before                                                                                                                                                                          | After                                                                              |
| --- | --- |
| "ปัญหานี้อาจเกิดจาก cache ของ Next.js หรือ CDN ยังถือ response เก่าอยู่หลัง deploy ครับ คุณควรตรวจสอบ revalidate setting, cache-control header และ purge CDN cache หลัง deploy" | "น่าจะ cache ค้างหลัง deploy. เช็ค `revalidate`, `cache-control`, แล้ว purge CDN." |

Noyap is not "translate and shorten." Thai output should sound like Thai developers actually talk: `API`, `endpoint`, `deploy`, `build`, `bug`, `config`, `token`, `commit`, `branch`, `error`, `log`, `cache`, `Docker`, and `Nginx` can stay in English when natural.

## Features

- One command installs agent rule files.
- English and Thai are first-class.
- Mixed Thai/English stays mixed when that is the natural developer style.
- Configurable verbosity modes, including `bilingual` and `hardcore-th`.
- Safe CLI: no overwrite unless `--force`.
- Code-first answers by default.
- Warning preservation for security, breaking changes, and data loss.
- Benchmark suite with token, character, line, meaning, warning, and language checks.

## Supported Agents

| Agent                    | Generated file                    | Default action        |
| --- | --- | --- |
| Claude Code              | `CLAUDE.md`                       | Append Noyap section  |
| OpenAI Codex / Codex CLI | `AGENTS.md`, `.noyap/AGENTS.noyap.md` | Merge or separate safe rules |
| OpenCode                 | `AGENTS.md`, `.noyap/AGENTS.noyap.md` | Merge or separate safe rules |
| Cursor                   | `.cursor/rules/noyap.mdc`         | Create always-on rule |
| Windsurf                 | `.windsurf/rules/noyap.md`        | Create always-on rule |
| GitHub Copilot           | `.github/copilot-instructions.md` | Append Noyap section  |
| Cline                    | `.clinerules/noyap.md`            | Create project rule   |
| Continue                 | `.continue/rules/noyap.md`        | Create project rule   |
| Gemini CLI               | `GEMINI.md`                       | Append Noyap section  |
| Roo Code                 | `.roo/rules/noyap.md`             | Create project rule   |

## Installation

Run inside your project:

```bash
npx @ppwnr88/noyap init --interactive
```

Install for every supported agent:

```bash
npx @ppwnr88/noyap init --all
```

Global install keeps the CLI command as `noyap`:

```bash
npm install -g @ppwnr88/noyap
noyap init
noyap doctor
```

Install for one agent:

```bash
npx @ppwnr88/noyap init --agent claude
npx @ppwnr88/noyap init --agent codex
npx @ppwnr88/noyap init --agent opencode
npx @ppwnr88/noyap init --agent codex --agents-md-strategy separate
npx @ppwnr88/noyap init --agent opencode --agents-md-strategy separate
npx @ppwnr88/noyap init --agent cursor
```

Preview without writing:

```bash
npx @ppwnr88/noyap init --all --dry-run
npx @ppwnr88/noyap diff --all
```

Overwrite existing replace-mode rule files:

```bash
npx @ppwnr88/noyap init --agent cursor --force
```

Refresh existing Noyap files:

```bash
npx @ppwnr88/noyap update --all
```

Remove generated Noyap rules:

```bash
npx @ppwnr88/noyap remove --all
```

Fix missing config or rule files found by doctor:

```bash
npx @ppwnr88/noyap doctor --all --fix
```

Shell completion:

```bash
npx @ppwnr88/noyap completion zsh
npx @ppwnr88/noyap completion bash
npx @ppwnr88/noyap completion fish
```

## Existing AGENTS.md

Noyap treats `AGENTS.md` as project guidance, not a disposable prompt file. This applies to Codex and OpenCode.

If `AGENTS.md` already exists, Noyap defaults to a safe merge:

- preserves existing project rules and formatting
- appends one Noyap section with a marker
- avoids duplicate Noyap sections on later runs
- warns when terse modes may conflict with project rules that require detailed explanations

Interactive setup shows merge options:

```text
Existing AGENTS.md found.

What would you like to do?
  1. Merge Noyap rules into existing AGENTS.md (recommended)
  2. Create separate .noyap/AGENTS.noyap.md and reference it
  3. Overwrite existing AGENTS.md
  4. Cancel AGENTS.md rule generation
```

Use a separate file when teams want the main `AGENTS.md` to stay focused:

```bash
npx @ppwnr88/noyap init --agent opencode --agents-md-strategy separate
```

This creates `.noyap/AGENTS.noyap.md` and adds a short reference in `AGENTS.md`.

`--force` can overwrite, but it is explicit. Noyap will not silently replace existing AGENTS.md instructions.

### Directory-Scoped AGENTS.md Rules

Codex and OpenCode both use `AGENTS.md` for project instructions. Noyap respects root and nested project guidance instead of assuming one global instruction file.

Noyap respects that model:

- run from the repo root to add root-level communication rules
- run from a package/service directory to add scoped rules for that workspace
- conflict checks consider the active `AGENTS.md` chain from root to current directory
- existing rules about architecture detail, security, migrations, deploy risk, and warnings stay authoritative

OpenCode also supports `opencode.json` instruction files. Noyap stays AGENTS.md-first for now to keep setup lightweight; use `--agents-md-strategy separate` when you want the Noyap layer isolated.

## Quick Start

```bash
npx @ppwnr88/noyap init --all --mode balanced
```

Terminal output:

```text
Noyap init

✔ Generated noyap.config.json
✔ Generated Claude Code rule file
✔ Generated OpenAI Codex / Codex CLI rule file
✔ Generated Cursor rule file
✔ Generated Windsurf rule file
✔ Generated GitHub Copilot rule file
✔ Generated Cline rule file
✔ Generated Continue rule file
✔ Generated Gemini CLI rule file
✔ Generated Roo Code rule file
✔ Already configured OpenCode rule file
✔ Thai-native mode enabled

Summary: 10 created, 1 unchanged
Done.
```

Help output:

```text
$ npx @ppwnr88/noyap --help
Noyap - less yap, more code.

Usage:
  npx @ppwnr88/noyap <command> [options]

Common usage:
  npx @ppwnr88/noyap init --interactive
  npx @ppwnr88/noyap init --all --mode balanced
  npx @ppwnr88/noyap init --lang th --mode thai-dev
  npx @ppwnr88/noyap doctor
```

Interactive mode:

```bash
npx @ppwnr88/noyap init --interactive
```

It asks for agent, verbosity mode, language mode, role preset, then confirms generation.

Thai-first setup:

```bash
npx @ppwnr88/noyap init --all --lang th --mode thai-dev
```

## Configuration

Noyap writes `noyap.config.json`:

```json
{
  "language": "auto",
  "mode": "balanced",
  "preserveWarnings": true,
  "codeFirst": true,
  "maxExplanationLines": 4,
  "preserveMixedLanguage": true,
  "thaiTechnicalTerms": "preserve",
  "naturalThaiMode": true,
  "rolePreset": "default"
}
```

CLI examples:

```bash
npx @ppwnr88/noyap init --lang auto --mode balanced
npx @ppwnr88/noyap init --lang th --mode thai-dev
npx @ppwnr88/noyap init --mode bilingual
npx @ppwnr88/noyap init --preset backend
npx @ppwnr88/noyap init --preset security --mode senior
npx @ppwnr88/noyap init --agent opencode
npx @ppwnr88/noyap init --agent opencode --agents-md-strategy separate
npx @ppwnr88/noyap init --mode hardcore-th
npx @ppwnr88/noyap init --mode hardcore --max-explanation-lines 1
```

| Option                  | Values                                                                              | Notes                                                        |
| --- | --- | --- |
| `language`              | `auto`, `en`, `th`                                                                  | `auto` follows the user's language                           |
| `mode`                  | `minimal`, `balanced`, `senior`, `thai-dev`, `bilingual`, `hardcore`, `hardcore-th` | Controls response density                                    |
| `rolePreset`            | `default`, `backend`, `frontend`, `devops`, `sql`, `security`, `reviewer`           | Adds role-specific priorities without changing language/mode |
| `preserveWarnings`      | `true`, `false`                                                                     | Keep important warnings visible                              |
| `codeFirst`             | `true`, `false`                                                                     | Put code or commands first when useful                       |
| `maxExplanationLines`   | number                                                                              | Soft limit for extra explanation                             |
| `preserveMixedLanguage` | `true`, `false`                                                                     | Keep Thai/English developer style mixed when natural         |
| `thaiTechnicalTerms`    | `preserve`, `translate`                                                             | Default keeps common dev terms in English                    |
| `naturalThaiMode`       | `true`, `false`                                                                     | Avoid formal translated Thai                                 |
| `agentsMdStrategy`      | `merge`, `separate`, `overwrite`, `cancel`                                          | CLI-only option for existing `AGENTS.md` handling            |

## Role Presets

Presets slightly shift what the agent prioritizes while keeping the selected language and verbosity mode.

| Preset     | Adds emphasis on                                                  |
| --- | --- |
| `backend`  | API contracts, auth, validation, migrations, observability        |
| `frontend` | rendering, state, accessibility, hydration, bundle impact         |
| `devops`   | deploy safety, rollback, logs, env/config, Docker, CI/CD          |
| `sql`      | query correctness, indexes, transactions, locking, data integrity |
| `security` | threat model, auth, secrets, tokens, injection, XSS/CSRF          |
| `reviewer` | findings first, severity, regressions, missing tests              |

Example:

```bash
npx @ppwnr88/noyap init --all --mode senior --preset reviewer
```

## Safety Rules

Noyap tells agents to keep critical warnings even when answers are short. It must not remove or weaken warnings about:

- data loss
- security risks
- production deploy risks
- database migration risks
- billing or cost risks
- destructive commands
- secret, token, API key, or credential exposure

## Doctor

Check that Noyap is installed correctly:

```bash
npx @ppwnr88/noyap doctor
npx @ppwnr88/noyap doctor --agent cursor
npx @ppwnr88/noyap doctor --all
```

Example:

```text
Noyap doctor

Checks:
  ✔ Config file found - noyap.config.json exists
  ✔ Config valid - language=auto, mode=balanced, rolePreset=frontend
  ✔ cursor rule file found - .cursor/rules/noyap.mdc exists with Noyap rules

Summary:
  ✔ Config: pass
  ✔ Templates: pass
  ✔ Package: pass

OK
```

Doctor verifies:

- `noyap.config.json` exists
- language, mode, role preset, and Thai term config are valid
- selected agent rule files exist in expected paths
- generated rule files contain the Noyap marker

## Verbosity Modes

| Mode          | Best for                             | Style                                              |
| --- | --- | --- |
| `minimal`     | Simple fixes, CLI commands           | Very short, enough context to act                  |
| `balanced`    | Daily coding-agent use               | Concise but still clear                            |
| `senior`      | Architecture, reviews, risky changes | Short tradeoffs and caveats                        |
| `thai-dev`    | Thai developer workflow              | Natural Thai plus common English dev terms         |
| `bilingual`   | Thai/English teams                   | Preserves mixed-language style aggressively        |
| `hardcore`    | Tiny answers, obvious fixes          | Maximum compression, highest risk of losing nuance |
| `hardcore-th` | Obvious Thai dev prompts             | Very terse Thai with English technical terms       |

Recommended defaults:

- Most projects: `balanced`
- Code review and architecture: `senior`
- Thai-first teams: `thai-dev`
- Thai/English teams: `bilingual`
- Low-risk command snippets: `minimal`

## Thai Language Support

Thai is not an afterthought.

Noyap tells agents to:

- auto-detect English, Thai, or mixed Thai/English
- answer Thai prompts in Thai
- keep mixed Thai/English when the user writes that way
- avoid robotic formal Thai
- avoid polite filler like "ครับผม", "ยินดีครับ", "แน่นอนครับ" unless it is actually useful
- keep common developer terms in English when natural
- preserve code, CLI output, stack traces, commands, env vars, and raw errors

Example:

```text
User:
API ยิงแล้วได้ 401 ทั้งที่ login แล้ว น่าจะเช็คตรงไหน

Noyap:
น่าจะขาด `Authorization` header หรือ token หมดอายุ.
เช็คว่า frontend ส่ง Bearer token และ backend อ่าน header ถูก.
```

Mixed-language examples:

| Input                                    | Output                                                                      |
| --- | --- |
| `component rerender ตลอด เกิดจากอะไร`    | `น่าจะมี object/function ถูกสร้างใหม่ทุก render. เช็ค useMemo/useCallback.` |
| `sequelize include ดึง latest row ยังไง` | `include ไม่ guarantee latest row. ใช้ separate + limit/order.`             |
| `nextjs build fail ตอน deploy`           | `เช็ค version mismatch กับ env ก่อน. โดยเฉพาะ Next/MUI.`                    |
| `Docker build ช้ามาก`                    | `Layer cache น่าจะ miss. เช็ค COPY order กับ .dockerignore.`                |

Thai prompt with English logs:

```text
User:
deploy แล้วเจอ error นี้คืออะไร

TypeError: Cannot read properties of undefined (reading 'map')
    at render (/app/page.js:10:3)

Noyap:
`.map` ถูกเรียกบน `undefined`.
ใส่ default array หรือ guard ก่อน render.
เก็บ stack trace เดิมไว้ debug.
```

Noyap is different from simple shortening tools because it does not force a single output language. It follows real developer communication patterns: `cache ค้าง`, `build fail`, `token หมด`, `query ช้า`, `nginx rewrite ไม่ทำงาน`.

## Benchmarks

Run:

```bash
npm run benchmark
```

Current fixture results:

| Mode          | Token reduction | Character reduction | Meaning preserved | Warning preserved |
| --- | --- | --- | --- | --- |
| `minimal`     | 67.53%          | 70.96%              | 93.75%            | 100%              |
| `balanced`    | 54.12%          | 58.23%              | 95.83%            | 100%              |
| `senior`      | 43.28%          | 47.12%              | 97.92%            | 100%              |
| `thai-dev`    | 52.07%          | 58.12%              | 100%              | 100%              |
| `bilingual`   | 59.5%           | 63.35%              | 95.83%            | 100%              |
| `hardcore`    | 74.83%          | 79.16%              | 87.5%             | 100%              |
| `hardcore-th` | 75.96%          | 80.68%              | 81.25%            | 100%              |

Reports:

- [Markdown summary](benchmarks/results/summary.md)
- [JSON results](benchmarks/results/results.json)
- [Benchmark methodology](benchmarks/README.md)

The benchmark uses fixed baseline and Noyap responses, counts tokens with `gpt-tokenizer`, and checks required technical terms, warnings, Thai quality, and English quality. Meaning preservation is heuristic, so the benchmark includes a manual review checklist.

## Inspiration

[Caveman](https://github.com/juliusbrussee/caveman), created by [Julius Brussee](https://github.com/juliusbrussee), demonstrated that AI coding agents can communicate with dramatically fewer tokens while preserving technical meaning.

Noyap builds on that idea with a broader, production-oriented focus:

- Thai-native developer communication
- automatic language detection
- mixed Thai/English support
- multi-agent rule generation
- smart warning preservation
- configurable verbosity modes

Noyap is not a clone of Caveman. It expands the same core insight for multilingual teams, especially developers who work naturally across English and Thai.

## Examples

More examples:

- [English before/after](examples/before-after.en.md)
- [Thai before/after](examples/before-after.th.md)
- [Example config](examples/noyap.config.json)

## Roadmap

- More benchmark fixtures from real coding-agent tasks
- Optional model-based semantic review
- More agent-specific install targets
- CI workflow for benchmark regression tracking
- More role presets from real team workflows

## Contributing

Good contributions:

- realistic before/after examples
- Thai developer language improvements
- new agent templates
- benchmark cases that catch meaning loss
- safer warning-preservation checks

Run locally:

```bash
npm install
npm run lint
npm test
npm run benchmark
npm run doctor
```

Release check:

```bash
npm pack
npm publish --dry-run --access public
npm publish --access public
```

Noyap is published as the scoped package `@ppwnr88/noyap`, so public npm releases must include `--access public`.

## License

MIT
