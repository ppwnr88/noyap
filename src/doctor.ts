import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { agents, findAgent, type AgentTarget } from "./agents.js";
import { languages, modes, normalizeConfig, rolePresets, thaiTechnicalTermModes, type NoyapConfig } from "./config.js";
import { sentinel } from "./templates.js";
import { noyapReferenceSentinel, noyapSeparateFile } from "./agents-md.js";

export interface DoctorOptions {
  cwd: string;
  agent?: string;
  all: boolean;
}

export interface DoctorCheck {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

export interface DoctorResult {
  ok: boolean;
  checks: DoctorCheck[];
  summary: {
    config: "pass" | "fail" | "warn";
    templates: "pass" | "fail" | "warn";
    package: "pass" | "fail" | "warn";
  };
}

function targets(opts: DoctorOptions): AgentTarget[] {
  if (opts.all) return agents;
  if (opts.agent) {
    const agent = findAgent(opts.agent);
    if (!agent) throw new Error(`Unknown agent: ${opts.agent}. Use one of: ${agents.map((item) => item.id).join(", ")}`);
    return [agent];
  }
  return [findAgent("codex"), findAgent("claude"), findAgent("cursor")].filter(Boolean) as AgentTarget[];
}

function validateConfigShape(raw: Partial<NoyapConfig>): string[] {
  const errors: string[] = [];
  if (raw.language && !languages.includes(raw.language)) errors.push(`invalid language: ${raw.language}`);
  if (raw.mode && !modes.includes(raw.mode)) errors.push(`invalid mode: ${raw.mode}`);
  if (raw.rolePreset && !rolePresets.includes(raw.rolePreset)) errors.push(`invalid rolePreset: ${raw.rolePreset}`);
  if (raw.thaiTechnicalTerms && !thaiTechnicalTermModes.includes(raw.thaiTechnicalTerms)) {
    errors.push(`invalid thaiTechnicalTerms: ${raw.thaiTechnicalTerms}`);
  }
  if (raw.maxExplanationLines !== undefined && !Number.isFinite(raw.maxExplanationLines)) {
    errors.push("maxExplanationLines must be a number");
  }
  return errors;
}

export async function doctor(opts: DoctorOptions): Promise<DoctorResult> {
  const checks: DoctorCheck[] = [];
  const configPath = path.join(opts.cwd, "noyap.config.json");

  if (!existsSync(configPath)) {
    checks.push({ name: "config", status: "fail", message: "noyap.config.json not found" });
  } else {
    checks.push({ name: "config", status: "pass", message: "noyap.config.json exists" });
    try {
      const raw = JSON.parse(await readFile(configPath, "utf8")) as Partial<NoyapConfig>;
      const errors = validateConfigShape(raw);
      if (errors.length) {
        checks.push({ name: "config-valid", status: "fail", message: errors.join("; ") });
      } else {
        const normalized = normalizeConfig(raw);
        checks.push({
          name: "config-valid",
          status: "pass",
          message: `language=${normalized.language}, mode=${normalized.mode}, rolePreset=${normalized.rolePreset}`
        });
      }
    } catch (error) {
      checks.push({ name: "config-valid", status: "fail", message: `invalid JSON: ${(error as Error).message}` });
    }
  }

  for (const agent of targets(opts)) {
    const filePath = path.join(opts.cwd, agent.file);
    if (!existsSync(filePath)) {
      checks.push({ name: `agent:${agent.id}`, status: "fail", message: `${agent.file} not found` });
      continue;
    }

    const content = await readFile(filePath, "utf8");
    if (!content.includes(sentinel)) {
      if (agent.file === "AGENTS.md" && (content.includes(noyapReferenceSentinel) || content.includes(noyapSeparateFile))) {
        const separatePath = path.join(opts.cwd, noyapSeparateFile);
        if (existsSync(separatePath) && (await readFile(separatePath, "utf8")).includes(sentinel)) {
          checks.push({ name: `agent:${agent.id}`, status: "pass", message: `${agent.file} references ${noyapSeparateFile}` });
          continue;
        }
      }
      checks.push({ name: `agent:${agent.id}`, status: "warn", message: `${agent.file} exists but has no Noyap marker` });
    } else {
      checks.push({ name: `agent:${agent.id}`, status: "pass", message: `${agent.file} exists with Noyap rules` });
    }
  }

  const configChecks = checks.filter((check) => check.name.startsWith("config"));
  const templateChecks = checks.filter((check) => check.name.startsWith("agent:"));
  const statusFor = (items: DoctorCheck[]): DoctorCheck["status"] => {
    if (items.some((item) => item.status === "fail")) return "fail";
    if (items.some((item) => item.status === "warn")) return "warn";
    return "pass";
  };

  const summary = {
    config: statusFor(configChecks),
    templates: statusFor(templateChecks),
    package: "pass" as const
  };

  return {
    ok: checks.every((check) => check.status !== "fail"),
    checks,
    summary
  };
}

export function formatDoctorResult(result: DoctorResult): string {
  const icon = { pass: "✔", warn: "⚠", fail: "✖" } as const;
  const detailLabel = (check: DoctorCheck) => {
    if (check.name === "config") return check.status === "pass" ? "Config file found" : "Config file missing";
    if (check.name === "config-valid") return check.status === "pass" ? "Config valid" : "Config invalid";
    if (check.name.startsWith("agent:")) {
      const agent = check.name.replace("agent:", "");
      if (check.status === "pass") return `${agent} rule file found`;
      if (check.status === "warn") return `${agent} rule file missing Noyap marker`;
      return `Missing ${agent} rule file`;
    }
    return check.name;
  };

  return [
    "Noyap doctor",
    "",
    "Checks:",
    ...result.checks.map((check) => `  ${icon[check.status]} ${detailLabel(check)} - ${check.message}`),
    "",
    "Summary:",
    `  ${icon[result.summary.config]} Config: ${result.summary.config}`,
    `  ${icon[result.summary.templates]} Templates: ${result.summary.templates}`,
    `  ${icon[result.summary.package]} Package: ${result.summary.package}`,
    "",
    result.ok ? "OK" : "Issues found"
  ].join("\n");
}
