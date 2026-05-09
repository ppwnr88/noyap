# Contributing

Thanks for helping improve Noyap.

Good contributions:

- realistic before/after examples
- Thai developer language improvements
- new agent templates
- benchmark cases that catch meaning loss
- safer warning-preservation checks
- CLI usability improvements

## Development

```bash
npm install
npm run lint
npm test
npm run benchmark
```

## Pull Requests

- Keep changes focused.
- Add or update tests for behavior changes.
- Update `README.md` and `README.th.md` when user-facing behavior changes.
- Keep Thai examples natural. Avoid formal translated Thai unless the example needs it.
- Preserve warnings about security, data loss, production deploys, migrations, destructive commands, billing/cost, and secrets.

## Benchmarks

Run:

```bash
npm run benchmark
```

Benchmark scores are heuristic. If a case is subtle, add a note or golden test so future changes do not make Noyap vague, verbose, or unsafe.
