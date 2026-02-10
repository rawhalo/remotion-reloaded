import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { defaultLogger, type Logger } from "./logger";

const REMOTION_CONFIG_FILES = [
  "remotion.config.ts",
  "remotion.config.js",
  "remotion.config.mjs",
  "remotion.config.cjs",
] as const;

const HELLO_RELOADED_TEMPLATE = `import { AbsoluteFill } from "remotion";
import { EffectPreset } from "@remotion-reloaded/effects";

export const HelloReloaded = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050816",
        color: "#f8fafc",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
      }}
    >
      <EffectPreset name="cinematic" intensity={0.8}>
        <div style={{ textAlign: "center", padding: 48 }}>
          <h1 style={{ fontSize: 96, margin: 0 }}>Remotion Reloaded</h1>
          <p style={{ marginTop: 20, fontSize: 34, opacity: 0.85 }}>
            GSAP + Effects + Three.js in one stack
          </p>
        </div>
      </EffectPreset>
    </AbsoluteFill>
  );
};
`;

const CURSOR_RULES_TEMPLATE = `# Remotion Reloaded project defaults
- Prefer deterministic frame-based animation.
- Avoid runtime-only browser APIs in composition code.
- Use @remotion-reloaded/* helpers instead of ad-hoc animation utilities when possible.
`;

const CLAUDE_TEMPLATE = `# Project Agent Notes

This project was initialized with Remotion Reloaded.

## Quick commands
- npm run preview
- npm run build
- npm run render

## Guidance
- Keep animation deterministic across frame seeks.
- Favor Remotion Reloaded abstractions for GSAP/effects/Three integrations.
`;

export interface InitProjectOptions {
  cwd?: string;
  logger?: Logger;
}

export interface InitProjectResult {
  updatedFiles: string[];
  createdFiles: string[];
}

interface ProjectPackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: unknown;
}

const sortRecord = (record: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => left.localeCompare(right)),
  );

const ensureDependency = (
  pkg: ProjectPackageJson,
  name: string,
  version: string,
): boolean => {
  if (pkg.dependencies?.[name] || pkg.devDependencies?.[name] || pkg.peerDependencies?.[name]) {
    return false;
  }

  pkg.dependencies = {
    ...(pkg.dependencies ?? {}),
    [name]: version,
  };
  pkg.dependencies = sortRecord(pkg.dependencies);

  return true;
};

const findRemotionConfigPath = (cwd: string): string | null => {
  for (const candidate of REMOTION_CONFIG_FILES) {
    const candidatePath = path.join(cwd, candidate);
    if (existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return null;
};

export const patchRemotionConfigSource = (source: string): string => {
  let content = source;

  if (!content.includes("withReloaded")) {
    content = `import { withReloaded } from "remotion-reloaded/config";\n${content}`;
  }

  if (content.includes("export default withReloaded(")) {
    return content;
  }

  if (/export\s+default\s+\{/.test(content)) {
    const wrapped = content.replace(
      /export\s+default\s+\{/,
      "export default withReloaded({",
    );

    if (/}\s*;?\s*$/.test(wrapped)) {
      return wrapped.replace(/}\s*;?\s*$/, "});\n");
    }

    return `${wrapped}\nexport default withReloaded({});\n`;
  }

  if (/export\s+default\s+[^\n;]+;?/.test(content)) {
    return content.replace(
      /export\s+default\s+([^\n;]+);?/,
      (_match, expression: string) =>
        `export default withReloaded(${expression.trim()});`,
    );
  }

  return `${content.trimEnd()}\n\nexport default withReloaded({});\n`;
};

const writeJson = (filePath: string, value: unknown): void => {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
};

const ensureTextFile = (
  filePath: string,
  contents: string,
  cwd: string,
  createdFiles: string[],
): void => {
  if (existsSync(filePath)) {
    return;
  }

  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents, "utf-8");
  createdFiles.push(path.relative(cwd, filePath));
};

export async function initProject(
  options: InitProjectOptions = {},
): Promise<InitProjectResult> {
  const logger = options.logger ?? defaultLogger;
  const cwd = options.cwd ?? process.cwd();
  const updatedFiles: string[] = [];
  const createdFiles: string[] = [];

  const packageJsonPath = path.join(cwd, "package.json");
  if (!existsSync(packageJsonPath)) {
    throw new Error("No package.json found. Run this command in an existing Remotion project.");
  }

  const packageJson = JSON.parse(
    readFileSync(packageJsonPath, "utf-8"),
  ) as ProjectPackageJson;

  const dependencyUpdates = [
    ensureDependency(packageJson, "remotion-reloaded", "latest"),
    ensureDependency(packageJson, "gsap", "^3.12.0"),
  ];

  if (dependencyUpdates.some(Boolean)) {
    writeJson(packageJsonPath, packageJson);
    updatedFiles.push(path.relative(cwd, packageJsonPath));
  }

  const existingConfigPath = findRemotionConfigPath(cwd);
  if (existingConfigPath) {
    const original = readFileSync(existingConfigPath, "utf-8");
    const patched = patchRemotionConfigSource(original);

    if (patched !== original) {
      writeFileSync(existingConfigPath, patched, "utf-8");
      updatedFiles.push(path.relative(cwd, existingConfigPath));
    }
  } else {
    const remotionConfigPath = path.join(cwd, "remotion.config.ts");
    const defaultConfig = `import { withReloaded } from "remotion-reloaded/config";

export default withReloaded({
  webgpu: true,
});
`;

    writeFileSync(remotionConfigPath, defaultConfig, "utf-8");
    createdFiles.push(path.relative(cwd, remotionConfigPath));
  }

  ensureTextFile(
    path.join(cwd, "src", "compositions", "HelloReloaded.tsx"),
    HELLO_RELOADED_TEMPLATE,
    cwd,
    createdFiles,
  );
  ensureTextFile(path.join(cwd, ".cursorrules"), CURSOR_RULES_TEMPLATE, cwd, createdFiles);
  ensureTextFile(path.join(cwd, "CLAUDE.md"), CLAUDE_TEMPLATE, cwd, createdFiles);

  logger.log("[remotion-reloaded] Initialization complete.");

  return {
    updatedFiles,
    createdFiles,
  };
}
