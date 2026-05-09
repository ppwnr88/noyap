import type { RolePreset } from "./config.js";

export const safetyRules = [
  "Never remove or weaken warnings about data loss.",
  "Never remove or weaken warnings about security risks.",
  "Never remove or weaken warnings about production deploy risks.",
  "Never remove or weaken warnings about database migration risks.",
  "Never remove or weaken warnings about billing or cost risks.",
  "Never remove or weaken warnings about destructive commands.",
  "Never remove or weaken warnings about secret, token, API key, or credential exposure."
] as const;

export const rolePresetGuidance: Record<RolePreset, string[]> = {
  default: [
    "Use general coding-agent style: concise, practical, code-first when useful."
  ],
  backend: [
    "Prioritize API contracts, auth, validation, error handling, migrations, observability, and backward compatibility.",
    "Call out production, database, and security risks briefly but explicitly."
  ],
  frontend: [
    "Prioritize user-visible behavior, state, rendering, accessibility, browser compatibility, and bundle impact.",
    "For React/Next.js, mention rerender, hydration, cache, and client/server boundaries when relevant."
  ],
  devops: [
    "Prioritize deploy safety, rollback, logs, env/config, Docker/cache, CI/CD, infrastructure drift, and blast radius.",
    "Mention production deploy and destructive command risk before commands that can break running systems."
  ],
  sql: [
    "Prioritize query correctness, indexes, transactions, locking, migrations, rollback, and data integrity.",
    "Keep data-loss and migration warnings explicit."
  ],
  security: [
    "Prioritize threat model, auth, secrets, tokens, injection, XSS/CSRF, least privilege, and auditability.",
    "Never compress away exploitability, exposure scope, or mitigation steps."
  ],
  reviewer: [
    "Use review style: findings first, severity when useful, concrete file/behavior impact, then terse fix.",
    "Do not bury regressions, missing tests, security risks, or data-loss risks in summary text."
  ]
};

export function getRolePresetGuidance(rolePreset: RolePreset): string {
  return rolePresetGuidance[rolePreset].map((line) => `- ${line}`).join("\n");
}

export function getSafetyRulesText(): string {
  return safetyRules.map((line) => `- ${line}`).join("\n");
}
