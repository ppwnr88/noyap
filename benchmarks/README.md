# Noyap Benchmarks

Run:

```bash
npm run benchmark
```

Outputs:

- `benchmarks/results/summary.md`
- `benchmarks/results/results.json`

What it measures:

- Token reduction percentage
- Character reduction percentage
- Line reduction percentage
- Required technical meaning coverage
- Warning preservation
- Thai language quality
- English language quality

The suite is deterministic. It compares fixed baseline responses against fixed Noyap responses for each mode:

- `minimal`
- `balanced`
- `senior`
- `thai-dev`
- `bilingual`
- `hardcore`
- `hardcore-th`

## Scoring Rubric

Automated checks are useful but not proof of semantic equivalence. Treat flagged cases as review prompts.

Meaning preservation:

- Each case defines `requiredTerms`.
- Score = required terms present / required terms total.
- Cases below `minMeaningScore` are flagged as `meaning-risk`.

Warning preservation:

- Security and data-loss cases define `warningTerms`.
- Missing warning terms are flagged as `warning-missing`.
- Warnings must remain explicit even in terse modes.

Thai quality:

- Thai or mixed-language cases must contain Thai.
- Mixed-language cases should keep normal English dev terms.
- Overly polite or formal translated phrases are flagged.

English quality:

- English or mixed-language cases must contain English.
- Common filler phrases are flagged.
- Very long answers are flagged.

Too short:

- Each case defines `minTokens`.
- Responses below that value are flagged as `possibly-too-short`.

Manual review checklist:

- Does the answer keep the concrete fix or recommendation?
- Are required technical constraints still present?
- Are security, data-loss, breaking-change, and irreversible-action warnings still explicit?
- Is Thai natural developer Thai, not formal translated prose?
- Are common Thai dev terms kept in English when that is more natural?
- Is the answer short but still clear enough to act on?
