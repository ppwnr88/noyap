# Noyap

ทำให้ AI coding agent ตอบสั้นลง ชัดขึ้น และเข้าเรื่องกว่าเดิม

[![npm](https://img.shields.io/npm/v/%40ppwnr88%2Fnoyap?color=111827)](https://www.npmjs.com/package/@ppwnr88/noyap)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![English README](https://img.shields.io/badge/README-English-2563eb)](README.md)

Noyap ติดตั้ง rule/instruction ให้ AI coding agent หลายตัว เช่น Claude Code, Codex, Cursor, Windsurf, Copilot, Cline, Continue, Gemini CLI และ Roo Code

เป้าหมายง่ายๆ:

> Less yap. More code.

ไม่ใช่แค่แปลไทยแล้วตัดให้สั้น แต่พยายามให้ agent ตอบแบบที่ dev ไทยอ่านแล้วไม่สะดุด: สั้น ตรง ใช้ศัพท์ technical แบบธรรมชาติ และไม่ทิ้ง warning สำคัญ

## ตัวอย่างเร็วๆ

```text
ก่อนใช้ Noyap
"ปัญหานี้น่าจะเกิดจาก request ที่ส่งไปยัง API ไม่มี Authorization header
หรือ token หมดอายุแล้วครับ ลองตรวจสอบก่อนว่า frontend แนบ Bearer token
ไปกับทุก request หรือไม่"

หลังใช้ Noyap
"น่าจะขาด `Authorization` header หรือ token หมดอายุ.
เช็คว่า frontend ส่ง Bearer token."
```

ติดตั้ง:

```bash
npx @ppwnr88/noyap init --interactive
```

## ทำไมต้อง Noyap?

AI coding agent เก่งขึ้นเยอะ แต่หลายครั้งยังตอบยาวเกินงาน:

- เกริ่นนาน
- พูดซ้ำคำถาม
- ใส่ "แน่นอนครับ" ทุกครั้ง
- อธิบายสิ่งที่ dev รู้อยู่แล้ว
- แปลศัพท์ technical เป็นไทยจนอ่านแปลก

Noyap ช่วยบอก agent ให้:

- ตอบภาษาเดียวกับ user
- ถ้า user พิมพ์ไทย ให้ตอบไทยแบบ dev ไทย
- ถ้าพิมพ์ปนไทย/English ก็ปนกลับได้แบบธรรมชาติ
- เอา code/command ขึ้นก่อนเมื่อเหมาะ
- debug แบบบอก cause ก่อน แล้วค่อย fix
- architecture ให้ tradeoff สั้นๆ
- warning เรื่อง security, breaking change, data loss ต้องอยู่ครบ

## Before / After

### ภาษาไทย

| ก่อน                                                                                                                                                                 | หลัง                                            |
| --- | --- |
| "ปัญหานี้น่าจะเกิดจากการที่ object ถูกสร้างใหม่ทุกครั้งที่ component render ซึ่งอาจทำให้เกิดการ render ซ้ำโดยไม่จำเป็น แนะนำให้ใช้ useMemo เพื่อช่วยแก้ปัญหานี้ครับ" | "Object ถูกสร้างใหม่ทุก render. ใช้ `useMemo`." |

### ไทย + English แบบ dev ใช้จริง

| ก่อน                                                                                                                                                                            | หลัง                                                                               |
| --- | --- |
| "ปัญหานี้อาจเกิดจาก cache ของ Next.js หรือ CDN ยังถือ response เก่าอยู่หลัง deploy ครับ คุณควรตรวจสอบ revalidate setting, cache-control header และ purge CDN cache หลัง deploy" | "น่าจะ cache ค้างหลัง deploy. เช็ค `revalidate`, `cache-control`, แล้ว purge CDN." |

### English

| Before                                                                                                                                                                    | After                                                    |
| --- | --- |
| "Certainly! The issue appears to be that your object is recreated on every render, which may cause unnecessary re-renders. You should consider wrapping it with useMemo." | "Object recreated every render. Wrap it with `useMemo`." |

## เหมาะกับอะไร

- ใช้ Cursor แล้วไม่อยากอ่านคำตอบยาวๆ
- ใช้ Claude Code/Codex ให้ช่วยแก้ code แต่ไม่อยากได้ lecture
- ทีมไทยที่คุยกับ AI เป็นไทยปน English
- repo ที่อยากให้ agent ทุกตัวตอบ style เดียวกัน
- งาน debug ที่ต้องการ cause + fix เร็วๆ
- งาน review ที่ยังต้องเก็บ warning สำคัญ

## Supported Agents

| Agent                    | File ที่สร้าง                     | พฤติกรรม                    |
| --- | --- | --- |
| Claude Code              | `CLAUDE.md`                       | append section ของ Noyap    |
| OpenAI Codex / Codex CLI | `AGENTS.md`                       | append repo instructions    |
| Cursor                   | `.cursor/rules/noyap.mdc`         | always-on rule              |
| Windsurf                 | `.windsurf/rules/noyap.md`        | always-on rule              |
| GitHub Copilot           | `.github/copilot-instructions.md` | append custom instructions  |
| Cline                    | `.clinerules/noyap.md`            | project rule                |
| Continue                 | `.continue/rules/noyap.md`        | project rule                |
| Gemini CLI               | `GEMINI.md`                       | append project instructions |
| Roo Code                 | `.roo/rules/noyap.md`             | project rule                |

## ติดตั้ง

ติดตั้ง default:

```bash
npx @ppwnr88/noyap init
```

ติดตั้งทุก agent ที่รองรับ:

```bash
npx @ppwnr88/noyap init --all
```

ถ้าติดตั้งแบบ global คำสั่ง CLI ยังเป็น `noyap`:

```bash
npm install -g @ppwnr88/noyap
noyap init
noyap doctor
```

ติดตั้งเฉพาะ agent:

```bash
npx @ppwnr88/noyap init --agent claude
npx @ppwnr88/noyap init --agent codex
npx @ppwnr88/noyap init --agent cursor
```

ตั้งค่าให้เหมาะกับทีมไทย:

```bash
npx @ppwnr88/noyap init --all --lang th --mode thai-dev
```

ลองดูก่อน ยังไม่เขียนไฟล์:

```bash
npx @ppwnr88/noyap init --all --dry-run
```

ถ้าไฟล์ rule มีอยู่แล้วและอยากเขียนทับ:

```bash
npx @ppwnr88/noyap init --agent cursor --force
```

CLI ปลอดภัยโดย default:

- ไฟล์แบบ append เช่น `AGENTS.md`, `CLAUDE.md` จะเพิ่ม section ของ Noyap แค่ครั้งเดียว
- ไฟล์ rule ที่ควร replace จะไม่ overwrite ถ้าไม่ส่ง `--force`
- มี `--dry-run` ให้ preview ก่อน

## Quick Start

```bash
npx @ppwnr88/noyap init --all --lang th --mode thai-dev
```

ตัวอย่าง terminal output:

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
✔ Thai-native mode enabled

Summary: 10 created
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

CLI จะถาม agent, verbosity mode, language mode, role preset แล้วให้ confirm ก่อน generate ไฟล์

## Config

Noyap สร้าง `noyap.config.json`:

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

ตัวอย่าง:

```bash
npx @ppwnr88/noyap init --lang auto --mode balanced
npx @ppwnr88/noyap init --lang th --mode thai-dev
npx @ppwnr88/noyap init --mode bilingual
npx @ppwnr88/noyap init --preset backend
npx @ppwnr88/noyap init --preset security --mode senior
npx @ppwnr88/noyap init --mode hardcore-th
npx @ppwnr88/noyap init --mode hardcore --max-explanation-lines 1
```

| Option                  | ค่า                                                                                 | อธิบาย                                         |
| --- | --- | --- |
| `language`              | `auto`, `en`, `th`                                                                  | `auto` ให้ตอบตามภาษาของ user                   |
| `mode`                  | `minimal`, `balanced`, `senior`, `thai-dev`, `bilingual`, `hardcore`, `hardcore-th` | คุมความสั้น/ละเอียด                            |
| `rolePreset`            | `default`, `backend`, `frontend`, `devops`, `sql`, `security`, `reviewer`           | ปรับ priority ตามงาน แต่ยังใช้ภาษา/mode เดิม   |
| `preserveWarnings`      | `true`, `false`                                                                     | เก็บ warning สำคัญไว้                          |
| `codeFirst`             | `true`, `false`                                                                     | งาน code ให้ขึ้น code/command ก่อน             |
| `maxExplanationLines`   | number                                                                              | จำกัดคำอธิบายเพิ่มแบบคร่าวๆ                    |
| `preserveMixedLanguage` | `true`, `false`                                                                     | รักษา style ไทย/English ปนกันเมื่อเป็นธรรมชาติ |
| `thaiTechnicalTerms`    | `preserve`, `translate`                                                             | default คือเก็บศัพท์ dev เป็น English          |
| `naturalThaiMode`       | `true`, `false`                                                                     | เลี่ยงภาษาไทยที่ฟังเหมือนแปล                   |

## Role Presets

Preset จะปรับน้ำหนักคำตอบนิดหน่อย โดยไม่เปลี่ยนภาษาและ verbosity mode ที่เลือกไว้

| Preset     | เน้นเรื่อง                                                     |
| --- | --- |
| `backend`  | API contract, auth, validation, migration, observability       |
| `frontend` | render, state, accessibility, hydration, bundle impact         |
| `devops`   | deploy safety, rollback, logs, env/config, Docker, CI/CD       |
| `sql`      | query correctness, index, transaction, locking, data integrity |
| `security` | threat model, auth, secret, token, injection, XSS/CSRF         |
| `reviewer` | finding ก่อน, severity, regression, missing tests              |

ตัวอย่าง:

```bash
npx @ppwnr88/noyap init --all --mode senior --preset reviewer
```

## Safety Rules

Noyap สั่ง agent ว่าห้ามตัดหรือทำให้ warning สำคัญอ่อนลง แม้จะตอบสั้นมาก

ต้องเก็บ warning เกี่ยวกับ:

- data loss
- security risks
- production deploy risks
- database migration risks
- billing/cost risks
- destructive commands
- secret, token, API key, credential exposure

## Doctor

เช็คว่า Noyap ติดตั้งถูกไหม:

```bash
npx @ppwnr88/noyap doctor
npx @ppwnr88/noyap doctor --agent cursor
npx @ppwnr88/noyap doctor --all
```

ตัวอย่าง:

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

Doctor จะเช็ค:

- มี `noyap.config.json`
- config ภาษา, mode, role preset, Thai term ถูกต้อง
- rule file ของ agent อยู่ path ที่ควรอยู่
- rule file มี marker ของ Noyap

## Verbosity Modes

| Mode          | เหมาะกับ                           | Style                                    |
| --- | --- | --- |
| `minimal`     | command ง่ายๆ, fix เล็กๆ           | สั้นมาก แต่ยังพอทำตามได้                 |
| `balanced`    | ใช้งานทั่วไป                       | สั้น ชัด ไม่ห้วนเกิน                     |
| `senior`      | architecture, review, risky change | มี tradeoff/caveat แต่ไม่ยาว             |
| `thai-dev`    | ทีมไทยหรือ prompt ภาษาไทย          | ไทยธรรมชาติ + technical terms ภาษาอังกฤษ |
| `bilingual`   | ทีมที่คุยไทย/English ปนกัน         | รักษา mixed-language style ชัดที่สุด     |
| `hardcore`    | งาน obvious มากๆ                   | สั้นสุด แต่เสี่ยงตก nuance               |
| `hardcore-th` | prompt ไทยที่ชัดมาก                | ไทยสั้นมาก + technical terms ภาษาอังกฤษ  |

แนะนำ:

- ใช้ทั่วไป: `balanced`
- งาน architecture/review: `senior`
- ทีมไทย: `thai-dev`
- ทีมไทย/English ปนกัน: `bilingual`
- command สั้นๆ: `minimal`

## ภาษาไทยใน Noyap

Noyap ตั้งใจ support ภาษาไทยแบบจริงจัง

Rule หลัก:

- user เขียนไทย -> ตอบไทย
- user เขียน English -> ตอบ English
- user เขียนปน -> ตอบปนแบบธรรมชาติ
- ไม่ต้องแปล technical terms ถ้าคำอังกฤษอ่านง่ายกว่า
- ไม่แปล code, terminal output, stack traces, command, env var, raw error
- ไม่ใช้ภาษาทางการเกิน เช่น "ดังกล่าว", "สามารถที่จะ", "คุณควรทำการ"
- ไม่ใส่ filler สุภาพเกินจำเป็น เช่น "ครับผม", "ยินดีครับ", "แน่นอนครับ"

คำที่มักปล่อยเป็น English ได้:

`API`, `endpoint`, `deploy`, `build`, `Docker`, `cache`, `token`, `commit`, `branch`, `merge`, `config`, `env`, `bug`, `log`, `middleware`, `hook`, `render`, `rerender`, `query`, `migration`, `rollback`, `auth`, `proxy`, `nginx`, `React`, `Next.js`, `Node.js`, `TypeScript`, `SQL`, `Redis`

ตัวอย่าง:

```text
User:
ใช้ prisma migrate reset บน production ได้ไหม

Noyap:
อย่าใช้ `prisma migrate reset` บน production.
มัน drop DB/schema แล้วทำให้ข้อมูลหาย/Data loss.
ทำ migration ใหม่, เช็ค backup, ทดสอบ staging ก่อน.
```

ตัวอย่าง mixed-language ที่ควรรักษา style:

| User                                     | Noyap                                                                       |
| --- | --- |
| `component rerender ตลอด เกิดจากอะไร`    | `น่าจะมี object/function ถูกสร้างใหม่ทุก render. เช็ค useMemo/useCallback.` |
| `sequelize include ดึง latest row ยังไง` | `include ไม่ guarantee latest row. ใช้ separate + limit/order.`             |
| `nextjs build fail ตอน deploy`           | `เช็ค version mismatch กับ env ก่อน. โดยเฉพาะ Next/MUI.`                    |
| `Docker build ช้ามาก`                    | `Layer cache น่าจะ miss. เช็ค COPY order กับ .dockerignore.`                |

ถ้า user พิมพ์ไทยแต่ paste error/log ภาษาอังกฤษ:

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

## Benchmarks

รัน benchmark:

```bash
npm run benchmark
```

ผลล่าสุดจาก fixture:

| Mode          | Token reduction | Character reduction | Meaning preserved | Warning preserved |
| --- | --- | --- | --- | --- |
| `minimal`     | 67.53%          | 70.96%              | 93.75%            | 100%              |
| `balanced`    | 54.12%          | 58.23%              | 95.83%            | 100%              |
| `senior`      | 43.28%          | 47.12%              | 97.92%            | 100%              |
| `thai-dev`    | 52.07%          | 58.12%              | 100%              | 100%              |
| `bilingual`   | 59.5%           | 63.35%              | 95.83%            | 100%              |
| `hardcore`    | 74.83%          | 79.16%              | 87.5%             | 100%              |
| `hardcore-th` | 75.96%          | 80.68%              | 81.25%            | 100%              |

ไฟล์ report:

- [Markdown summary](benchmarks/results/summary.md)
- [JSON results](benchmarks/results/results.json)
- [Benchmark methodology](benchmarks/README.md)

หมายเหตุ: meaning preservation วัดด้วย heuristic จาก required technical terms ไม่ใช่ proof ว่าความหมายเหมือน 100% ทุกกรณี เลยมี manual review checklist สำหรับ case ที่เสี่ยง

## Inspiration

[Caveman](https://github.com/juliusbrussee/caveman) โดย [Julius Brussee](https://github.com/juliusbrussee) แสดงให้เห็นชัดว่า AI coding agent สามารถตอบสั้นลงมาก โดยยังเก็บ technical meaning สำคัญไว้ได้

Noyap ต่อยอดจากไอเดียนั้นในทิศทางที่กว้างขึ้น:

- รองรับภาษาไทยแบบ dev ไทยจริงๆ
- auto language detection
- รองรับ Thai/English mixed style
- รองรับหลาย AI coding agents
- เก็บ warning สำคัญแบบไม่ตัดทิ้ง
- มี verbosity modes ให้เลือก

Noyap ไม่ใช่ clone ของ Caveman แต่เป็นการขยายแนวคิดเดียวกันให้เหมาะกับทีม multilingual โดยเฉพาะ dev ที่ทำงานปน English/Thai เป็นปกติ

## ตัวอย่างเพิ่ม

- [English before/after](examples/before-after.en.md)
- [Thai before/after](examples/before-after.th.md)
- [Example config](examples/noyap.config.json)

## Roadmap

- เพิ่ม benchmark fixtures จากงานจริง
- optional semantic review ด้วย model
- support agent เพิ่ม
- CI สำหรับ benchmark regression
- role preset เพิ่มจาก workflow จริง

## Contributing

สิ่งที่ช่วย project ได้มาก:

- เพิ่มตัวอย่างภาษาไทยที่ฟังเป็น dev จริง
- เพิ่ม benchmark case ที่จับ meaning loss ได้
- เพิ่ม template ของ agent ใหม่
- ปรับ warning checks ให้แม่นขึ้น
- เจอคำไทยที่ robotic ให้แก้ได้เลย

รัน locally:

```bash
npm install
npm run lint
npm test
npm run benchmark
npm run doctor
```

เช็คก่อน release:

```bash
npm pack
npm publish --dry-run --access public
npm publish --access public
```

Noyap publish เป็น scoped package `@ppwnr88/noyap` ดังนั้นตอน publish จริงต้องใส่ `--access public`.

## License

MIT
