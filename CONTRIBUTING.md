# Contributing

Thanks for contributing to Remotion Reloaded.

## Project Scope

This repository is a monorepo with publishable packages under `packages/` and product/spec documentation at the root.

Please:
- Keep changes focused and small.
- Follow existing naming conventions and folder structure.
- Avoid adding ad-hoc top-level directories.

## Local Setup

```bash
pnpm install
```

## Validation Before PR

Run the standard checks locally:

```bash
pnpm typecheck
pnpm build
pnpm test
```

For release-level validation:

```bash
pnpm release:check:full
```

## Pull Requests

Include the following in each PR:
- Summary of what changed.
- Files or packages touched.
- Any behavior changes and migration notes.
- How you verified the change (commands/results).

Use concise, imperative commit messages, for example:

```text
docs: clarify existing-project setup
fix: handle missing remotion config in init
```

## Security

Do not commit secrets, tokens, private keys, or proprietary assets.

If you discover a security issue, follow `SECURITY.md`.
