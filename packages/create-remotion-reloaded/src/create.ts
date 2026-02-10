import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defaultLogger, type Logger } from "./logger";

const PROJECT_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/;

export type PackageManager = "npm" | "pnpm" | "yarn";

export interface CreateProjectOptions {
  projectName: string;
  cwd?: string;
  template?: string;
  skipInstall?: boolean;
  packageManager?: PackageManager;
  logger?: Logger;
}

export interface CreateProjectResult {
  projectName: string;
  projectDir: string;
  template: string;
  createdFiles: string[];
  installedDependencies: boolean;
  packageManager: PackageManager;
}

export const detectPackageManager = (
  userAgent = process.env.npm_config_user_agent,
): PackageManager => {
  if (!userAgent) {
    return "npm";
  }

  if (userAgent.startsWith("pnpm/")) {
    return "pnpm";
  }

  if (userAgent.startsWith("yarn/")) {
    return "yarn";
  }

  return "npm";
};

const assertSafeProjectName = (projectName: string): void => {
  if (!projectName.trim()) {
    throw new Error("Project name is required.");
  }

  if (projectName.includes("/") || projectName.includes("\\")) {
    throw new Error(
      'Project name must be a single directory name (for example: "my-project").',
    );
  }

  if (!PROJECT_NAME_PATTERN.test(projectName)) {
    throw new Error(
      'Project name can include letters, numbers, dashes, and underscores, and must start with a letter or number.',
    );
  }
};

const sanitizePackageName = (projectName: string): string =>
  projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-");

const resolveTemplateRoot = (): string =>
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "templates");

const resolveTemplateDir = (template: string): string => {
  const templateDir = path.join(resolveTemplateRoot(), template);

  if (!existsSync(templateDir) || !statSync(templateDir).isDirectory()) {
    throw new Error(
      `Unknown template "${template}". Available templates are directories in templates/.`,
    );
  }

  return templateDir;
};

const replaceTemplateVariables = (
  contents: string,
  variables: Record<string, string>,
): string => {
  let next = contents;

  for (const [key, value] of Object.entries(variables)) {
    next = next.split(key).join(value);
  }

  return next;
};

const ensureDirectoryIsEmpty = (directory: string): void => {
  if (!existsSync(directory)) {
    return;
  }

  const existing = readdirSync(directory);
  if (existing.length > 0) {
    throw new Error(
      `Target directory already exists and is not empty: ${directory}`,
    );
  }
};

const copyTemplateTree = (
  fromDir: string,
  toDir: string,
  variables: Record<string, string>,
  projectRoot: string,
  createdFiles: string[],
): void => {
  const entries = readdirSync(fromDir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const entry of entries) {
    const sourcePath = path.join(fromDir, entry.name);
    const targetName = entry.name.endsWith(".tmpl")
      ? entry.name.slice(0, -".tmpl".length)
      : entry.name;
    const destinationPath = path.join(toDir, targetName);

    if (entry.isDirectory()) {
      mkdirSync(destinationPath, { recursive: true });
      copyTemplateTree(sourcePath, destinationPath, variables, projectRoot, createdFiles);
      continue;
    }

    if (entry.name.endsWith(".tmpl")) {
      const rawTemplate = readFileSync(sourcePath, "utf-8");
      const rendered = replaceTemplateVariables(rawTemplate, variables);
      writeFileSync(destinationPath, rendered, "utf-8");
    } else {
      copyFileSync(sourcePath, destinationPath);
    }

    createdFiles.push(path.relative(projectRoot, destinationPath));
  }
};

const installDependencies = (
  projectDir: string,
  packageManager: PackageManager,
  logger: Logger,
): void => {
  const installArgs = packageManager === "yarn" ? [] : ["install"];
  const result = spawnSync(packageManager, installArgs, {
    cwd: projectDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    logger.warn(
      `[create-remotion-reloaded] Dependency install failed. Run \`${packageManager} install\` manually in ${projectDir}.`,
    );
  }
};

export async function createProject(
  options: CreateProjectOptions,
): Promise<CreateProjectResult> {
  const logger = options.logger ?? defaultLogger;
  const projectName = options.projectName.trim();
  const template = options.template ?? "default";
  const cwd = options.cwd ?? process.cwd();
  const packageManager = options.packageManager ?? detectPackageManager();
  const skipInstall = options.skipInstall ?? false;

  assertSafeProjectName(projectName);

  const projectDir = path.resolve(cwd, projectName);
  ensureDirectoryIsEmpty(projectDir);
  mkdirSync(projectDir, { recursive: true });

  const templateDir = resolveTemplateDir(template);
  const createdFiles: string[] = [];

  copyTemplateTree(
    templateDir,
    projectDir,
    {
      "__PROJECT_NAME__": sanitizePackageName(projectName),
    },
    projectDir,
    createdFiles,
  );

  if (!skipInstall) {
    logger.log(`[create-remotion-reloaded] Installing dependencies with ${packageManager}...`);
    installDependencies(projectDir, packageManager, logger);
  }

  return {
    projectName,
    projectDir,
    template,
    createdFiles,
    installedDependencies: !skipInstall,
    packageManager,
  };
}
