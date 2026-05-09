#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { countTokens } from "gpt-tokenizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const casesPath = path.join(__dirname, "cases.json");
const resultsDir = path.join(__dirname, "results");
const jsonPath = path.join(resultsDir, "results.json");
const markdownPath = path.join(resultsDir, "summary.md");
const modes = ["minimal", "balanced", "senior", "thai-dev", "bilingual", "hardcore", "hardcore-th"];

function lineCount(text) {
  if (!text.trim()) return 0;
  return text.trim().split(/\r?\n/).length;
}

function reduction(baseline, value) {
  if (baseline === 0) return 0;
  return Number((((baseline - value) / baseline) * 100).toFixed(2));
}

function includesTerm(text, term) {
  return text.toLocaleLowerCase().includes(term.toLocaleLowerCase());
}

function scoreMeaning(text, requiredTerms) {
  if (!requiredTerms.length) return 1;
  const matched = requiredTerms.filter((term) => includesTerm(text, term));
  return {
    score: Number((matched.length / requiredTerms.length).toFixed(4)),
    matched,
    missing: requiredTerms.filter((term) => !matched.includes(term))
  };
}

function scoreWarnings(text, warningTerms) {
  if (!warningTerms.length) return { score: 1, matched: [], missing: [] };
  const matched = warningTerms.filter((term) => includesTerm(text, term));
  return {
    score: Number((matched.length / warningTerms.length).toFixed(4)),
    matched,
    missing: warningTerms.filter((term) => !matched.includes(term))
  };
}

function containsThai(text) {
  return /[\u0E00-\u0E7F]/.test(text);
}

function containsEnglish(text) {
  return /[A-Za-z]/.test(text);
}

function thaiQuality(text, expectedLanguage) {
  if (expectedLanguage === "en") return { score: 1, flags: [] };

  const flags = [];
  if (!containsThai(text)) flags.push("missing-thai");
  if (/ครับผม|ยินดีครับ|แน่นอนครับ|ขออนุญาต/i.test(text)) flags.push("polite-filler");
  if (/คุณควรทำการ|สามารถที่จะ|ดังกล่าว|ประการแรก/.test(text)) flags.push("formal-or-translated-tone");
  if (expectedLanguage === "mixed" && !containsEnglish(text)) flags.push("missing-english-dev-terms");

  return {
    score: Number(Math.max(0, 1 - flags.length * 0.25).toFixed(4)),
    flags
  };
}

function englishQuality(text, expectedLanguage) {
  if (expectedLanguage === "th") return { score: 1, flags: [] };

  const flags = [];
  if (!containsEnglish(text)) flags.push("missing-english");
  if (/certainly|sure[,!]?|i'?d be happy to|hope this helps|great question/i.test(text)) flags.push("english-filler");
  if (text.split(/\s+/).length > 90) flags.push("too-long");

  return {
    score: Number(Math.max(0, 1 - flags.length * 0.25).toFixed(4)),
    flags
  };
}

function measure(text) {
  return {
    tokens: countTokens(text),
    characters: Array.from(text).length,
    lines: lineCount(text)
  };
}

function analyzeCase(testCase, mode, response) {
  const baseline = measure(testCase.baseline);
  const current = measure(response);
  const meaning = scoreMeaning(response, testCase.requiredTerms);
  const warnings = scoreWarnings(response, testCase.warningTerms);
  const thai = thaiQuality(response, testCase.language);
  const english = englishQuality(response, testCase.language);

  const flags = [];
  if (meaning.score < testCase.minMeaningScore) flags.push("meaning-risk");
  if (warnings.score < 1) flags.push("warning-missing");
  if (thai.flags.length) flags.push(...thai.flags);
  if (english.flags.length) flags.push(...english.flags);
  if (current.tokens < testCase.minTokens) flags.push("possibly-too-short");

  return {
    id: testCase.id,
    category: testCase.category,
    language: testCase.language,
    mode,
    baseline,
    current,
    reductions: {
      tokens: reduction(baseline.tokens, current.tokens),
      characters: reduction(baseline.characters, current.characters),
      lines: reduction(baseline.lines, current.lines)
    },
    meaning,
    warnings,
    thaiQuality: thai,
    englishQuality: english,
    flags
  };
}

function average(values) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function summarize(results) {
  return modes.map((mode) => {
    const rows = results.filter((result) => result.mode === mode);
    const warningRows = rows.filter((row) => row.warnings.matched.length || row.warnings.missing.length);
    return {
      mode,
      tokenReduction: average(rows.map((row) => row.reductions.tokens)),
      characterReduction: average(rows.map((row) => row.reductions.characters)),
      lineReduction: average(rows.map((row) => row.reductions.lines)),
      meaningPreserved: average(rows.map((row) => row.meaning.score * 100)),
      warningPreserved: warningRows.length ? average(warningRows.map((row) => row.warnings.score * 100)) : 100,
      thaiQuality: average(rows.map((row) => row.thaiQuality.score * 100)),
      englishQuality: average(rows.map((row) => row.englishQuality.score * 100)),
      flaggedCases: rows.filter((row) => row.flags.length).length
    };
  });
}

function renderMarkdown(cases, results, summary) {
  const lines = [
    "# Noyap Benchmark Report",
    "",
    "Generated by `npm run benchmark`.",
    "",
    "This benchmark uses fixed baseline and Noyap-mode responses. Token counts use `gpt-tokenizer`. Meaning, warning, and language checks are heuristic; flagged rows need human review.",
    "",
    "## Summary By Mode",
    "",
    "| Mode | Token reduction | Character reduction | Line reduction | Meaning preserved | Warning preserved | Thai quality | English quality | Flagged cases |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...summary.map((row) =>
      `| ${row.mode} | ${row.tokenReduction}% | ${row.characterReduction}% | ${row.lineReduction}% | ${row.meaningPreserved}% | ${row.warningPreserved}% | ${row.thaiQuality}% | ${row.englishQuality}% | ${row.flaggedCases} |`
    ),
    "",
    "Example:",
    "",
    "```text",
    `Mode: balanced`,
    `Token reduction: ${summary.find((row) => row.mode === "balanced").tokenReduction}%`,
    `Character reduction: ${summary.find((row) => row.mode === "balanced").characterReduction}%`,
    `Warning preserved: ${summary.find((row) => row.mode === "balanced").warningPreserved}%`,
    `Meaning preserved: ${summary.find((row) => row.mode === "balanced").meaningPreserved}%`,
    "```",
    "",
    "## Per-Test-Case Results",
    "",
    "| Case | Category | Mode | Token reduction | Character reduction | Line reduction | Meaning | Warnings | Flags |",
    "|---|---|---|---:|---:|---:|---:|---:|---|",
    ...results.map((row) =>
      `| ${row.id} | ${row.category} | ${row.mode} | ${row.reductions.tokens}% | ${row.reductions.characters}% | ${row.reductions.lines}% | ${(row.meaning.score * 100).toFixed(0)}% | ${(row.warnings.score * 100).toFixed(0)}% | ${row.flags.join(", ") || "-"} |`
    ),
    "",
    "## Manual Review Checklist",
    "",
    "Use this checklist for any flagged case:",
    "",
    "- Does the answer keep the concrete fix or recommendation?",
    "- Are required technical constraints still present?",
    "- Are security, data-loss, breaking-change, and irreversible-action warnings still explicit?",
    "- Is Thai natural developer Thai, not formal translated prose?",
    "- Are common Thai dev terms kept in English when that is more natural?",
    "- Is the answer short but still clear enough to act on?",
    "",
    "## Fixture Coverage",
    "",
    ...cases.map((testCase) => `- ${testCase.id}: ${testCase.category}`)
  ];

  return `${lines.join("\n")}\n`;
}

const cases = JSON.parse(await readFile(casesPath, "utf8"));
const results = [];

for (const testCase of cases) {
  for (const mode of modes) {
    results.push(analyzeCase(testCase, mode, testCase.responses[mode]));
  }
}

const summary = summarize(results);
const report = {
  generatedAt: new Date().toISOString(),
  tokenizer: "gpt-tokenizer",
  caseCount: cases.length,
  modes,
  summary,
  results
};

await mkdir(resultsDir, { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(markdownPath, renderMarkdown(cases, results, summary), "utf8");

console.log(`Wrote ${path.relative(process.cwd(), markdownPath)}`);
console.log(`Wrote ${path.relative(process.cwd(), jsonPath)}`);
for (const row of summary) {
  console.log(
    `${row.mode}: tokens ${row.tokenReduction}%, chars ${row.characterReduction}%, warnings ${row.warningPreserved}%, meaning ${row.meaningPreserved}%`
  );
}
