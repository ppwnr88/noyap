import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { countTokens } from "gpt-tokenizer";

const cases = JSON.parse(await readFile(new URL("./golden/golden.json", import.meta.url), "utf8"));

function includes(text, term) {
  return text.toLocaleLowerCase().includes(term.toLocaleLowerCase());
}

test("golden examples stay concise, concrete, and safe", () => {
  for (const item of cases) {
    assert.ok(countTokens(item.expected) <= item.maxTokens, `${item.id}: too verbose`);

    for (const term of item.requiredTerms) {
      assert.ok(includes(item.expected, term), `${item.id}: missing required term ${term}`);
    }

    for (const term of item.forbiddenTerms) {
      assert.equal(includes(item.expected, term), false, `${item.id}: contains forbidden term ${term}`);
    }

    for (const warning of item.warnings) {
      assert.ok(includes(item.expected, warning), `${item.id}: missing warning ${warning}`);
    }
  }
});

test("golden warning examples keep warnings explicit", () => {
  const warningCases = cases.filter((item) => item.warnings.length > 0);
  assert.ok(warningCases.length >= 2);

  for (const item of warningCases) {
    const warningHits = item.warnings.filter((warning) => includes(item.expected, warning));
    assert.equal(warningHits.length, item.warnings.length, `${item.id}: warning weakened`);
  }
});
