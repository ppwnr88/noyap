export type DetectedLanguage = "en" | "th" | "mixed" | "unknown";

export interface StyleDetection {
  language: DetectedLanguage;
  hasThai: boolean;
  hasEnglish: boolean;
  hasCodeBlock: boolean;
  hasStackTrace: boolean;
  hasCliOutput: boolean;
  hasMixedDeveloperPattern: boolean;
  technicalTerms: string[];
  recommendation: string;
}

export const thaiTechnicalTerms = [
  "API",
  "endpoint",
  "deploy",
  "build",
  "Docker",
  "cache",
  "token",
  "commit",
  "branch",
  "merge",
  "config",
  "env",
  "bug",
  "log",
  "middleware",
  "hook",
  "render",
  "rerender",
  "query",
  "migration",
  "rollback",
  "auth",
  "proxy",
  "nginx",
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "SQL",
  "Redis"
] as const;

const thaiPattern = /[\u0E00-\u0E7F]/;
const englishPattern = /[A-Za-z]/;
const codeFencePattern = /```|`[^`]+`/;
const stackTracePattern = /(Error:|Exception|Traceback|at\s+[\w.$<>]+\s*\(|\w+Error:|Cannot find module|TypeError|ReferenceError)/;
const cliOutputPattern = /(^|\n)\s*(\$|>|npm ERR!|pnpm|yarn|docker|kubectl|git|tsc|vite|next build|prisma)\b/im;
const mixedDeveloperPattern = new RegExp(
  [
    "deploy\\s*ยังไง",
    "cache\\s*ค้าง",
    "build\\s*fail",
    "docker\\s*พัง",
    "nginx\\s*rewrite",
    "query\\s*ช้า",
    "token\\s*หมด",
    "route\\s*ชน",
    "component\\s*rerender",
    "include\\s*ดึง",
    "build\\s*ช้า"
  ].join("|"),
  "i"
);

export function detectLanguage(text: string): DetectedLanguage {
  const hasThai = thaiPattern.test(text);
  const hasEnglish = englishPattern.test(text);

  if (hasThai && hasEnglish) return "mixed";
  if (hasThai) return "th";
  if (hasEnglish) return "en";
  return "unknown";
}

export function findThaiTechnicalTerms(text: string): string[] {
  const found = thaiTechnicalTerms.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^A-Za-z0-9_.-])${escaped}([^A-Za-z0-9_.-]|$)`, "i").test(text);
  });
  return [...new Set(found)];
}

export function detectStyle(text: string): StyleDetection {
  const language = detectLanguage(text);
  const hasThai = thaiPattern.test(text);
  const hasEnglish = englishPattern.test(text);
  const hasStackTrace = stackTracePattern.test(text);
  const hasCliOutput = cliOutputPattern.test(text);
  const hasMixedDeveloperPattern = mixedDeveloperPattern.test(text);

  return {
    language,
    hasThai,
    hasEnglish,
    hasCodeBlock: codeFencePattern.test(text),
    hasStackTrace,
    hasCliOutput,
    hasMixedDeveloperPattern,
    technicalTerms: findThaiTechnicalTerms(text),
    recommendation: getResponseStyleRecommendation({ language, hasStackTrace, hasCliOutput, hasMixedDeveloperPattern })
  };
}

export function shouldPreserveTerm(term: string): boolean {
  return thaiTechnicalTerms.some((known) => known.toLocaleLowerCase() === term.toLocaleLowerCase());
}

function getResponseStyleRecommendation(input: {
  language: DetectedLanguage;
  hasStackTrace: boolean;
  hasCliOutput: boolean;
  hasMixedDeveloperPattern: boolean;
}): string {
  if (input.language === "th") {
    return "ตอบไทยแบบ dev ไทย สั้น ตรง เก็บ technical terms และ raw errors เป็น English";
  }

  if (input.language === "mixed" || input.hasMixedDeveloperPattern) {
    return "ตอบปนไทย/English แบบธรรมชาติ ไม่ force translation และเก็บ dev terms เป็น English";
  }

  if (input.hasStackTrace || input.hasCliOutput) {
    return "Explain concisely in the user's language and keep logs, commands, and stack traces unchanged";
  }

  if (input.language === "en") {
    return "Reply in concise English";
  }

  return "Match the user's language and keep technical terms unchanged";
}
