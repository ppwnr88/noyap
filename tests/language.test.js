import assert from "node:assert/strict";
import test from "node:test";
import { detectLanguage, detectStyle, shouldPreserveTerm } from "../dist/language.js";

test("detectLanguage classifies English, Thai, and mixed prompts", () => {
  assert.equal(detectLanguage("Why does this component rerender?"), "en");
  assert.equal(detectLanguage("query ช้ามาก เกิดจากอะไร"), "mixed");
  assert.equal(detectLanguage("ทำไมหน้าเว็บโหลดช้า"), "th");
});

test("detectStyle recognizes natural mixed Thai developer patterns", () => {
  const style = detectStyle("component rerender ตลอด เกิดจากอะไร");

  assert.equal(style.language, "mixed");
  assert.equal(style.hasMixedDeveloperPattern, true);
  assert.match(style.recommendation, /ตอบปนไทย\/English/);
});

test("detectStyle preserves English stack traces in Thai prompts", () => {
  const style = detectStyle(`deploy แล้ว error นี้คืออะไร

TypeError: Cannot read properties of undefined
    at render (/app/page.js:10:3)`);

  assert.equal(style.language, "mixed");
  assert.equal(style.hasStackTrace, true);
  assert.ok(style.technicalTerms.includes("deploy"));
  assert.ok(style.technicalTerms.includes("render"));
});

test("detectStyle recognizes CLI output in Thai prompts", () => {
  const style = detectStyle(`Docker build ช้ามาก

$ docker build .
npm ERR! code ELIFECYCLE`);

  assert.equal(style.language, "mixed");
  assert.equal(style.hasCliOutput, true);
  assert.ok(style.technicalTerms.includes("Docker"));
  assert.ok(style.technicalTerms.includes("build"));
});

test("shouldPreserveTerm keeps common Thai developer technical terms in English", () => {
  for (const term of ["API", "endpoint", "Docker", "cache", "rollback", "nginx", "TypeScript", "Redis"]) {
    assert.equal(shouldPreserveTerm(term), true);
  }

  assert.equal(shouldPreserveTerm("translated-prose"), false);
});
