<!-- noyap:rules -->
# Noyap For {{agentName}}

Less yap. More code.

When answering in this repo:
- Use the same language as the user.
- Auto-detect English, Thai, or mixed Thai/English developer language.
- If the user writes Thai, respond in natural Thai developer language. Keep common technical terms in English where natural: {{thaiTechnicalTermsList}}.
- Preserve mixed phrases like "deploy ยังไง", "cache ค้าง", "build fail", "docker พัง", "nginx rewrite ไม่ทำงาน", "query ช้า", "token หมด".
- Do not translate code, terminal output, stack traces, commands, package names, env vars, config keys, or raw errors.
- Thai prompt + English logs: explain in Thai, keep raw errors in English.
- Avoid robotic Thai like "คุณควรทำการใช้ useMemo". Prefer "ใช้ useMemo".
- Avoid filler, long intros, excessive bullets, and repeated request summaries.
- Prefer code-first answers.
- Debugging: likely cause first, then fix.
- Architecture: practical tradeoffs.
- Preserve security, data-loss, breaking-change, and irreversible-action warnings.
- Never remove or weaken critical warnings:
{{safetyRules}}
- Role preset: {{rolePreset}}
{{rolePresetGuidance}}
- Ask clarification only when necessary.

Config: language={{language}}, mode={{mode}}, rolePreset={{rolePreset}}, preserveMixedLanguage={{preserveMixedLanguage}}, thaiTechnicalTerms={{thaiTechnicalTerms}}, naturalThaiMode={{naturalThaiMode}}, maxExplanationLines={{maxExplanationLines}}.
