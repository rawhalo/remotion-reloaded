# Phase 1 Release Checklist

Use this checklist to publish the first `1.0.0` release.

## 1. Auth and Scope Preflight

```bash
npm whoami
npm view @remotion-reloaded/config version
```

- `npm whoami` must return your npm username.
- `npm view @remotion-reloaded/config version` should return `404` before first publish.
- Confirm you have publish rights to the `@remotion-reloaded` scope (organization or user-owned scope).

## 2. Local Verification

```bash
pnpm release:check
pnpm release:check:full   # optional integration render suite
```

## 3. Versioning

```bash
pnpm release:version   # skip if versions/changelogs are already committed
pnpm install --lockfile-only
git add .
git commit -m "release: phase 1 1.0.0"
```

## 4. Publish

```bash
pnpm release:publish
```

## 5. Post-publish Smoke Test

```bash
npx create-remotion-reloaded@latest my-video-project
cd my-video-project
npm install
npm run typecheck
npm run build
npm run render
```

## 6. GitHub Actions Automation (Optional)

To publish via CI:
- Add `NPM_TOKEN` as an environment secret in your release environment.
- If your environment is not named `release`, set repository variable `RELEASE_ENVIRONMENT` to that name.
- Push to `main`.
- If package versions are already bumped, the workflow publishes directly.
- If you only added `.changeset/*`, the workflow opens a version PR first, then publishes after merge.
