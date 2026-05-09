export const languages = ["auto", "en", "th"] as const;
export const modes = ["minimal", "balanced", "senior", "thai-dev", "bilingual", "hardcore", "hardcore-th"] as const;
export const thaiTechnicalTermModes = ["preserve", "translate"] as const;
export const rolePresets = ["default", "backend", "frontend", "devops", "sql", "security", "reviewer"] as const;

export type NoyapLanguage = (typeof languages)[number];
export type NoyapMode = (typeof modes)[number];
export type ThaiTechnicalTermMode = (typeof thaiTechnicalTermModes)[number];
export type RolePreset = (typeof rolePresets)[number];

export interface NoyapConfig {
  language: NoyapLanguage;
  mode: NoyapMode;
  preserveWarnings: boolean;
  codeFirst: boolean;
  maxExplanationLines: number;
  preserveMixedLanguage: boolean;
  thaiTechnicalTerms: ThaiTechnicalTermMode;
  naturalThaiMode: boolean;
  rolePreset: RolePreset;
}

export const defaultConfig: NoyapConfig = {
  language: "auto",
  mode: "balanced",
  preserveWarnings: true,
  codeFirst: true,
  maxExplanationLines: 4,
  preserveMixedLanguage: true,
  thaiTechnicalTerms: "preserve",
  naturalThaiMode: true,
  rolePreset: "default"
};

export function normalizeConfig(input: Partial<NoyapConfig> = {}): NoyapConfig {
  return {
    ...defaultConfig,
    ...input,
    language: languages.includes(input.language as NoyapLanguage) ? input.language! : defaultConfig.language,
    mode: modes.includes(input.mode as NoyapMode) ? input.mode! : defaultConfig.mode,
    rolePreset: rolePresets.includes(input.rolePreset as RolePreset) ? input.rolePreset! : defaultConfig.rolePreset,
    thaiTechnicalTerms: thaiTechnicalTermModes.includes(input.thaiTechnicalTerms as ThaiTechnicalTermMode)
      ? input.thaiTechnicalTerms!
      : defaultConfig.thaiTechnicalTerms,
    maxExplanationLines: Number.isFinite(input.maxExplanationLines)
      ? Math.max(0, Math.floor(input.maxExplanationLines!))
      : defaultConfig.maxExplanationLines
  };
}
