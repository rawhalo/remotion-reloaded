import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { defaultLogger, type Logger } from "./logger";

const REMOTION_CONFIG_FILES = [
  "remotion.config.ts",
  "remotion.config.js",
  "remotion.config.mjs",
  "remotion.config.cjs",
] as const;

type CheckStatus = "pass" | "warn" | "fail";

export interface DoctorCheck {
  name: string;
  status: CheckStatus;
  message: string;
}

export interface DoctorResult {
  checks: DoctorCheck[];
  failed: number;
  warned: number;
  exitCode: number;
}

export interface DoctorOptions {
  cwd?: string;
  logger?: Logger;
}

interface ProjectPackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const findDependencyVersion = (
  pkg: ProjectPackageJson,
  name: string,
): string | null => {
  return (
    pkg.dependencies?.[name] ??
    pkg.devDependencies?.[name] ??
    pkg.peerDependencies?.[name] ??
    null
  );
};

const parseMajor = (range: string): number | null => {
  const match = range.match(/(\d+)/);
  if (!match) {
    return null;
  }

  const major = Number(match[1]);
  return Number.isFinite(major) ? major : null;
};

const hasReloadedInstallation = (pkg: ProjectPackageJson): boolean => {
  const required = [
    "remotion-reloaded",
    "@remotion-reloaded/config",
    "@remotion-reloaded/gsap",
    "@remotion-reloaded/effects",
    "@remotion-reloaded/three",
  ];

  return required.some((dep) => Boolean(findDependencyVersion(pkg, dep)));
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

const summarizeCheck = (check: DoctorCheck): string => {
  const symbol = check.status === "pass" ? "✓" : check.status === "warn" ? "⚠" : "✖";
  return `${symbol} ${check.name}: ${check.message}`;
};

export async function runDoctor(
  options: DoctorOptions = {},
): Promise<DoctorResult> {
  const cwd = options.cwd ?? process.cwd();
  const logger = options.logger ?? defaultLogger;
  const checks: DoctorCheck[] = [];

  const packageJsonPath = path.join(cwd, "package.json");
  if (!existsSync(packageJsonPath)) {
    checks.push({
      name: "package.json",
      status: "fail",
      message: "package.json was not found in the current directory.",
    });

    const result: DoctorResult = {
      checks,
      failed: 1,
      warned: 0,
      exitCode: 1,
    };

    for (const check of checks) {
      logger.log(summarizeCheck(check));
    }

    return result;
  }

  const packageJson = JSON.parse(
    readFileSync(packageJsonPath, "utf-8"),
  ) as ProjectPackageJson;

  const remotionVersion = findDependencyVersion(packageJson, "remotion");
  if (!remotionVersion) {
    checks.push({
      name: "Remotion",
      status: "fail",
      message: "remotion dependency is missing.",
    });
  } else {
    const major = parseMajor(remotionVersion);
    if (major === 4) {
      checks.push({
        name: "Remotion",
        status: "pass",
        message: `Detected remotion@${remotionVersion}.`,
      });
    } else {
      checks.push({
        name: "Remotion",
        status: "warn",
        message: `Expected Remotion 4.x but found ${remotionVersion}.`,
      });
    }
  }

  checks.push({
    name: "Remotion Reloaded",
    status: hasReloadedInstallation(packageJson) ? "pass" : "fail",
    message: hasReloadedInstallation(packageJson)
      ? "Remotion Reloaded dependencies are present."
      : "No remotion-reloaded packages detected.",
  });

  const gsapVersion = findDependencyVersion(packageJson, "gsap");
  checks.push({
    name: "GSAP",
    status: gsapVersion ? "pass" : "warn",
    message: gsapVersion
      ? `Detected gsap@${gsapVersion}.`
      : "GSAP is not installed (needed for @remotion-reloaded/gsap).",
  });

  const configPath = findRemotionConfigPath(cwd);
  if (!configPath) {
    checks.push({
      name: "remotion.config",
      status: "fail",
      message: "No remotion.config.ts/js/mjs/cjs file found.",
    });
  } else {
    const configContents = readFileSync(configPath, "utf-8");
    if (configContents.includes("withReloaded")) {
      checks.push({
        name: "remotion.config",
        status: "pass",
        message: `${path.basename(configPath)} is using withReloaded().`,
      });
    } else if (configContents.includes("gl") && configContents.includes("angle")) {
      checks.push({
        name: "remotion.config",
        status: "warn",
        message: `${path.basename(configPath)} configures angle manually; consider withReloaded() for defaults.`,
      });
    } else {
      checks.push({
        name: "remotion.config",
        status: "warn",
        message: `${path.basename(configPath)} does not include withReloaded().`,
      });
    }
  }

  checks.push({
    name: ".cursorrules",
    status: existsSync(path.join(cwd, ".cursorrules")) ? "pass" : "warn",
    message: existsSync(path.join(cwd, ".cursorrules"))
      ? "AI rules file found."
      : "AI rules file is missing.",
  });

  checks.push({
    name: "CLAUDE.md",
    status: existsSync(path.join(cwd, "CLAUDE.md")) ? "pass" : "warn",
    message: existsSync(path.join(cwd, "CLAUDE.md"))
      ? "Claude guidance file found."
      : "Claude guidance file is missing.",
  });

  const helloCompositionPath = path.join(cwd, "src", "compositions", "HelloReloaded.tsx");
  checks.push({
    name: "Starter composition",
    status: existsSync(helloCompositionPath) ? "pass" : "warn",
    message: existsSync(helloCompositionPath)
      ? "HelloReloaded starter composition found."
      : "HelloReloaded starter composition is missing.",
  });

  for (const check of checks) {
    logger.log(summarizeCheck(check));
  }

  const failed = checks.filter((check) => check.status === "fail").length;
  const warned = checks.filter((check) => check.status === "warn").length;

  if (failed > 0) {
    logger.error(`[remotion-reloaded] Doctor found ${failed} blocking issue(s).`);
  } else if (warned > 0) {
    logger.warn(`[remotion-reloaded] Doctor completed with ${warned} warning(s).`);
  } else {
    logger.log("[remotion-reloaded] Doctor completed successfully.");
  }

  return {
    checks,
    failed,
    warned,
    exitCode: failed > 0 ? 1 : 0,
  };
}
