import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NoyapConfig } from "./config.js";
import type { AgentTarget } from "./agents.js";
import { thaiTechnicalTerms } from "./language.js";
import { getRolePresetGuidance, getSafetyRulesText } from "./presets.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");

export const sentinel = "<!-- noyap:rules -->";

export async function loadTemplate(templateName: string): Promise<string> {
  return readFile(path.join(packageRoot, "templates", templateName), "utf8");
}

export function renderTemplate(template: string, agent: AgentTarget, config: NoyapConfig): string {
  const replacements: Record<string, string> = {
    agentName: agent.name,
    language: config.language,
    mode: config.mode,
    preserveWarnings: String(config.preserveWarnings),
    codeFirst: String(config.codeFirst),
    maxExplanationLines: String(config.maxExplanationLines),
    preserveMixedLanguage: String(config.preserveMixedLanguage),
    thaiTechnicalTerms: config.thaiTechnicalTerms,
    naturalThaiMode: String(config.naturalThaiMode),
    thaiTechnicalTermsList: thaiTechnicalTerms.join(", "),
    rolePreset: config.rolePreset,
    rolePresetGuidance: getRolePresetGuidance(config.rolePreset),
    safetyRules: getSafetyRulesText()
  };

  return Object.entries(replacements).reduce(
    (body, [key, value]) => body.replaceAll(`{{${key}}}`, value),
    template
  );
}
