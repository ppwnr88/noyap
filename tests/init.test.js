import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { detectAgentsMdConflicts, doctor, findAgentsMdChain, init, parseArgs } from "../dist/index.js";

async function tempDir() {
  return mkdtemp(path.join(os.tmpdir(), "noyap-"));
}

test("parseArgs supports requested init flags", () => {
  const opts = parseArgs(
    [
      "init",
      "--agent",
      "cursor",
      "--lang",
      "th",
      "--mode",
      "thai-dev",
      "--preset",
      "backend",
      "--thai-technical-terms",
      "preserve",
      "--preserve-mixed-language",
      "--natural-thai"
    ],
    "/tmp/project"
  );

  assert.equal(opts.agent, "cursor");
  assert.equal(opts.config.language, "th");
  assert.equal(opts.config.mode, "thai-dev");
  assert.equal(opts.config.rolePreset, "backend");
  assert.equal(opts.config.thaiTechnicalTerms, "preserve");
  assert.equal(opts.config.preserveMixedLanguage, true);
  assert.equal(opts.config.naturalThaiMode, true);
  assert.equal(opts.cwd, "/tmp/project");
});

test("parseArgs supports role presets", () => {
  assert.equal(parseArgs(["init", "--preset", "frontend"]).config.rolePreset, "frontend");
  assert.equal(parseArgs(["init", "--role", "security"]).config.rolePreset, "security");
  assert.equal(parseArgs(["init", "--interactive"]).interactive, true);
  assert.throws(() => parseArgs(["init", "--preset", "poetry"]), /Invalid role preset/);
});

test("parseArgs supports bilingual and hardcore-th modes", () => {
  assert.equal(parseArgs(["init", "--mode", "bilingual"]).config.mode, "bilingual");
  assert.equal(parseArgs(["init", "--mode", "hardcore-th"]).config.mode, "hardcore-th");
  assert.equal(parseArgs(["init", "--agent", "codex", "--codex-strategy", "separate"]).codexStrategy, "separate");
  assert.equal(parseArgs(["init", "--agent", "opencode", "--agents-md-strategy", "separate"]).agentsMdStrategy, "separate");
  assert.equal(parseArgs(["init", "--agent", "opencode"]).agent, "opencode");
});

test("init creates config and selected agent file", async () => {
  const cwd = await tempDir();
  try {
    const opts = parseArgs(["init", "--agent", "cursor"], cwd);
    const results = await init(opts);

    assert.equal(results.length, 2);
    assert.ok(existsSync(path.join(cwd, "noyap.config.json")));
    assert.ok(existsSync(path.join(cwd, ".cursor/rules/noyap.mdc")));

    const rule = await readFile(path.join(cwd, ".cursor/rules/noyap.mdc"), "utf8");
    assert.match(rule, /Less yap\. More code\./);
    assert.match(rule, /Thai/);
    assert.match(rule, /preserveMixedLanguage/);
    assert.match(rule, /deploy ยังไง/);
    assert.match(rule, /Never remove or weaken critical warnings/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("doctor verifies config and selected agent rule", async () => {
  const cwd = await tempDir();
  try {
    await init(parseArgs(["init", "--agent", "cursor", "--preset", "devops"], cwd));

    const result = await doctor({ cwd, agent: "cursor", all: false });
    assert.equal(result.ok, true);
    assert.ok(result.checks.some((check) => check.name === "config-valid" && check.status === "pass"));
    assert.ok(result.checks.some((check) => check.name === "agent:cursor" && check.status === "pass"));
    assert.equal(result.summary.config, "pass");
    assert.equal(result.summary.templates, "pass");
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("doctor fails on missing expected agent rule", async () => {
  const cwd = await tempDir();
  try {
    await init(parseArgs(["init", "--agent", "codex"], cwd));

    const result = await doctor({ cwd, agent: "cursor", all: false });
    assert.equal(result.ok, false);
    assert.ok(result.checks.some((check) => check.name === "agent:cursor" && check.status === "fail"));
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("replace-mode files are not overwritten without force", async () => {
  const cwd = await tempDir();
  try {
    const target = path.join(cwd, ".cursor/rules");
    await import("node:fs/promises").then((fs) => fs.mkdir(target, { recursive: true }));
    await writeFile(path.join(target, "noyap.mdc"), "custom", "utf8");

    const results = await init(parseArgs(["init", "--agent", "cursor"], cwd));
    assert.equal(results.find((result) => result.file.endsWith("noyap.mdc"))?.status, "skipped");
    assert.equal(await readFile(path.join(target, "noyap.mdc"), "utf8"), "custom");
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("codex merge preserves existing AGENTS.md and appends once", async () => {
  const cwd = await tempDir();
  try {
    await writeFile(path.join(cwd, "AGENTS.md"), "# Existing\n", "utf8");

    await init(parseArgs(["init", "--agent", "codex"], cwd));
    await init(parseArgs(["init", "--agent", "codex"], cwd));

    const content = await readFile(path.join(cwd, "AGENTS.md"), "utf8");
    assert.equal((content.match(/noyap:rules/g) ?? []).length, 1);
    assert.match(content, /^# Existing/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("codex separate strategy writes .noyap file and references it", async () => {
  const cwd = await tempDir();
  try {
    await writeFile(path.join(cwd, "AGENTS.md"), "# Project Rules\n\n- Use pnpm\n", "utf8");

    const results = await init(parseArgs(["init", "--agent", "codex", "--codex-strategy", "separate"], cwd));
    const agents = await readFile(path.join(cwd, "AGENTS.md"), "utf8");
    const separate = await readFile(path.join(cwd, ".noyap/AGENTS.noyap.md"), "utf8");

    assert.equal(results.some((result) => result.status === "referenced" && result.file === "AGENTS.md"), true);
    assert.match(agents, /Use pnpm/);
    assert.match(agents, /\.noyap\/AGENTS\.noyap\.md/);
    assert.match(separate, /noyap:rules/);

    const check = await doctor({ cwd, agent: "codex", all: false });
    assert.equal(check.ok, true);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("codex overwrite requires force or explicit overwrite strategy", async () => {
  const cwd = await tempDir();
  try {
    await writeFile(path.join(cwd, "AGENTS.md"), "# Existing\n\n- Keep this\n", "utf8");

    await init(parseArgs(["init", "--agent", "codex", "--force"], cwd));
    const content = await readFile(path.join(cwd, "AGENTS.md"), "utf8");

    assert.doesNotMatch(content, /Keep this/);
    assert.match(content, /noyap:rules/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("codex cancel strategy skips existing AGENTS.md", async () => {
  const cwd = await tempDir();
  try {
    await writeFile(path.join(cwd, "AGENTS.md"), "# Existing\n", "utf8");

    const results = await init(parseArgs(["init", "--agent", "codex", "--codex-strategy", "cancel"], cwd));
    const content = await readFile(path.join(cwd, "AGENTS.md"), "utf8");

    assert.equal(results.some((result) => result.status === "skipped" && result.file === "AGENTS.md"), true);
    assert.equal(content, "# Existing\n");
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("codex monorepo chain and conflict warnings respect nested AGENTS.md", async () => {
  const root = await tempDir();
  try {
    await mkdir(path.join(root, ".git"));
    await mkdir(path.join(root, "services/api"), { recursive: true });
    await writeFile(path.join(root, "AGENTS.md"), "# Root\n\n- Always explain architectural decisions in detail.\n", "utf8");
    await writeFile(path.join(root, "services/api/AGENTS.md"), "# API\n\n- Security explanations must be detailed.\n", "utf8");

    const cwd = path.join(root, "services/api");
    const opts = parseArgs(["init", "--agent", "codex", "--mode", "hardcore"], cwd);
    const chain = await findAgentsMdChain(cwd);
    const warnings = detectAgentsMdConflicts(chain, opts.config);
    const results = await init(opts);

    assert.deepEqual(chain.map((doc) => doc.file), ["../../AGENTS.md", "AGENTS.md"]);
    assert.equal(warnings.length >= 2, true);
    assert.equal(results.some((result) => result.status === "warning"), true);

    const nested = await readFile(path.join(cwd, "AGENTS.md"), "utf8");
    assert.match(nested, /Security explanations must be detailed/);
    assert.match(nested, /noyap:rules/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("opencode generates AGENTS.md rules", async () => {
  const cwd = await tempDir();
  try {
    const results = await init(parseArgs(["init", "--agent", "opencode"], cwd));
    const content = await readFile(path.join(cwd, "AGENTS.md"), "utf8");

    assert.equal(results.some((result) => result.agent.id === "opencode" && result.status === "created"), true);
    assert.match(content, /Noyap For OpenCode/);
    assert.match(content, /project instructions for OpenCode/);
    assert.match(content, /Match the user's language/);
    assert.match(content, /Never remove or weaken critical warnings/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("opencode merge preserves existing AGENTS.md", async () => {
  const cwd = await tempDir();
  try {
    await writeFile(path.join(cwd, "AGENTS.md"), "# Project Rules\n\n- Use bun.\n", "utf8");

    const results = await init(parseArgs(["init", "--agent", "opencode"], cwd));
    const content = await readFile(path.join(cwd, "AGENTS.md"), "utf8");

    assert.equal(results.some((result) => result.agent.id === "opencode" && result.status === "merged"), true);
    assert.match(content, /^# Project Rules/);
    assert.match(content, /Use bun/);
    assert.match(content, /Noyap For OpenCode/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("opencode separate strategy writes .noyap file and doctor accepts it", async () => {
  const cwd = await tempDir();
  try {
    await writeFile(path.join(cwd, "AGENTS.md"), "# OpenCode Project\n\n- Keep existing guidance.\n", "utf8");

    const results = await init(parseArgs(["init", "--agent", "opencode", "--agents-md-strategy", "separate"], cwd));
    const agents = await readFile(path.join(cwd, "AGENTS.md"), "utf8");
    const separate = await readFile(path.join(cwd, ".noyap/AGENTS.noyap.md"), "utf8");

    assert.equal(results.some((result) => result.agent.id === "opencode" && result.status === "referenced"), true);
    assert.match(agents, /Keep existing guidance/);
    assert.match(agents, /\.noyap\/AGENTS\.noyap\.md/);
    assert.match(separate, /Noyap For OpenCode/);

    const check = await doctor({ cwd, agent: "opencode", all: false });
    assert.equal(check.ok, true);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("opencode separate strategy creates AGENTS.md reference when missing", async () => {
  const cwd = await tempDir();
  try {
    const results = await init(parseArgs(["init", "--agent", "opencode", "--agents-md-strategy", "separate"], cwd));
    const agents = await readFile(path.join(cwd, "AGENTS.md"), "utf8");
    const separate = await readFile(path.join(cwd, ".noyap/AGENTS.noyap.md"), "utf8");

    assert.equal(results.some((result) => result.file === "AGENTS.md" && result.status === "created"), true);
    assert.match(agents, /\.noyap\/AGENTS\.noyap\.md/);
    assert.match(separate, /Noyap For OpenCode/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
