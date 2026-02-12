# Installation Guide

This guide is the fastest path from a fresh machine to agent-assisted editing with Remotion Reloaded.

## 1. Install Remotion and Remotion's Official Skill

Official links:
- Website: https://www.remotion.dev
- GitHub: https://github.com/remotion-dev/remotion
- Skills docs: https://www.remotion.dev/docs/ai/skills
- Skills package: https://github.com/remotion-dev/skills

Create a Remotion project:

```bash
npx create-video@latest my-remotion-project
cd my-remotion-project
npm install
```

Install Remotion's official skill pack:

```bash
npx skills add remotion-dev/skills
```

Start Remotion Studio:

```bash
npm run dev
```

If your template uses a different script, run:

```bash
npm run
```

and use whichever script starts `remotion studio`.

## 2. Install Remotion Reloaded and the Remotion Reloaded Skill

From your Remotion project root:

```bash
npm install remotion-reloaded
npx remotion-reloaded init
npm install
npx remotion-reloaded doctor
```

Install the Remotion Reloaded skill:

```bash
npx skills add rawhalo/remotion-reloaded --skill remotion-reloaded
```

What this gives you:
- Reloaded config patching via `init`
- setup validation via `doctor`
- agent guidance for Reloaded packages and patterns

## 3. Start Agentic Editing

Recommended loop:
1. Keep Remotion Studio running.
2. Ask your coding agent to make focused composition edits.
3. Preview immediately in Studio and iterate.

Example prompts:
- "Create a 6-second logo reveal using `useGSAP` and a cinematic effect preset."
- "Add a Three.js hero shot with smooth camera motion and deterministic timing."
- "Refactor this composition to use Reloaded helpers instead of manual interpolation."

If setup drifts while iterating, rerun:

```bash
npx remotion-reloaded doctor
```

## Troubleshooting

- Missing `preview` script:
  - use `npm run dev`, or
  - run `npx remotion studio src/index.ts`
- Skill install requires repository access:
  - `rawhalo/remotion-reloaded` must be public for no-auth installs
- If npm auth issues appear during publish:
  - use an npm automation token in GitHub environment secrets
