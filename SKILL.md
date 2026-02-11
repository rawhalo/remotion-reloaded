# Remotion Reloaded Skill (Compatibility Shim)

This repository now uses a single canonical skills directory:

- Canonical entry point: `skills/SKILL.md`
- Canonical rules: `skills/rules/*.md`
- Canonical examples: `skills/examples/*.tsx`

This root file is retained only for backward compatibility with tooling that expects `./SKILL.md`.

## Use This Instead

Open and follow:

- `skills/SKILL.md`

## Directory Contract

```text
skills/
├── SKILL.md
├── rules/
└── examples/
```

## Compatibility Note

If a tool still reads `./SKILL.md`, treat it as a pointer to `skills/SKILL.md` and do not duplicate rule content here.
