import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { doctor, init, parseArgs } from "../dist/index.js";

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

test("append-mode files append once", async () => {
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
