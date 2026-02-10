import path from "node:path";
import {
  createProject,
  detectPackageManager,
  type CreateProjectResult,
} from "./create";
import { runDoctor } from "./doctor";
import { initProject } from "./init";
import { defaultLogger, type Logger } from "./logger";

const CLI_VERSION = "0.0.1";

interface ParsedCreateArgs {
  projectName: string;
  template: string;
  skipInstall: boolean;
}

export interface RunCliOptions {
  cwd?: string;
  invokedAs?: string;
  logger?: Logger;
}

const printHelp = (logger: Logger, invokedAs: string): void => {
  const isRemotionCommand = invokedAs === "remotion-reloaded";

  if (isRemotionCommand) {
    logger.log(`remotion-reloaded ${CLI_VERSION}

Usage:
  remotion-reloaded init
  remotion-reloaded doctor
  remotion-reloaded create <project-name> [options]

Options:
  --template <name>   Scaffold template (default: default)
  --skip-install      Skip dependency installation
  -h, --help          Show help
  -v, --version       Show version
`);
    return;
  }

  logger.log(`create-remotion-reloaded ${CLI_VERSION}

Usage:
  create-remotion-reloaded <project-name> [options]
  create-remotion-reloaded init
  create-remotion-reloaded doctor

Options:
  --template <name>   Scaffold template (default: default)
  --skip-install      Skip dependency installation
  -h, --help          Show help
  -v, --version       Show version
`);
};

const parseCreateArgs = (args: readonly string[]): ParsedCreateArgs => {
  let projectName = "";
  let template = "default";
  let skipInstall = false;

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (token === "--template") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("Missing value for --template.");
      }

      template = value;
      index += 1;
      continue;
    }

    if (token === "--skip-install") {
      skipInstall = true;
      continue;
    }

    if (token.startsWith("-")) {
      throw new Error(`Unknown option: ${token}`);
    }

    if (!projectName) {
      projectName = token;
      continue;
    }

    throw new Error(`Unexpected argument: ${token}`);
  }

  if (!projectName) {
    throw new Error("Project name is required.");
  }

  return {
    projectName,
    template,
    skipInstall,
  };
};

const renderCreateSuccessMessage = (
  logger: Logger,
  result: CreateProjectResult,
): void => {
  const relativeProjectDir = path.relative(process.cwd(), result.projectDir) || result.projectDir;

  logger.log(`\n[create-remotion-reloaded] Created project in ${relativeProjectDir}`);

  if (result.installedDependencies) {
    logger.log("\nNext steps:");
    logger.log(`  cd ${relativeProjectDir}`);
    logger.log("  npm run preview");
    return;
  }

  logger.log("\nNext steps:");
  logger.log(`  cd ${relativeProjectDir}`);
  logger.log(`  ${result.packageManager} install`);
  logger.log("  npm run preview");
};

const runCreateCommand = async (
  args: readonly string[],
  options: RunCliOptions,
  logger: Logger,
): Promise<number> => {
  const parsed = parseCreateArgs(args);
  const result = await createProject({
    cwd: options.cwd,
    logger,
    packageManager: detectPackageManager(),
    projectName: parsed.projectName,
    skipInstall: parsed.skipInstall,
    template: parsed.template,
  });

  renderCreateSuccessMessage(logger, result);
  return 0;
};

const runInitCommand = async (
  options: RunCliOptions,
  logger: Logger,
): Promise<number> => {
  await initProject({ cwd: options.cwd, logger });
  logger.log("[remotion-reloaded] Run your package manager install command if dependencies changed.");
  return 0;
};

const runDoctorCommand = async (
  options: RunCliOptions,
  logger: Logger,
): Promise<number> => {
  const result = await runDoctor({ cwd: options.cwd, logger });
  return result.exitCode;
};

export async function runCli(
  argv: readonly string[] = process.argv.slice(2),
  options: RunCliOptions = {},
): Promise<number> {
  const logger = options.logger ?? defaultLogger;
  const invokedAs = options.invokedAs ?? path.basename(process.argv[1] ?? "create-remotion-reloaded");

  if (argv.includes("-h") || argv.includes("--help")) {
    printHelp(logger, invokedAs);
    return 0;
  }

  if (argv.includes("-v") || argv.includes("--version")) {
    logger.log(CLI_VERSION);
    return 0;
  }

  try {
    if (invokedAs === "remotion-reloaded") {
      const subcommand = argv[0];

      if (!subcommand) {
        printHelp(logger, invokedAs);
        return 1;
      }

      if (subcommand === "init") {
        return runInitCommand(options, logger);
      }

      if (subcommand === "doctor") {
        return runDoctorCommand(options, logger);
      }

      if (subcommand === "create") {
        return runCreateCommand(argv.slice(1), options, logger);
      }

      throw new Error(`Unknown command: ${subcommand}`);
    }

    const command = argv[0];
    if (command === "init") {
      return runInitCommand(options, logger);
    }

    if (command === "doctor") {
      return runDoctorCommand(options, logger);
    }

    if (command === "create") {
      return runCreateCommand(argv.slice(1), options, logger);
    }

    return runCreateCommand(argv, options, logger);
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Unexpected error while running CLI.",
    );
    return 1;
  }
}

export {
  createProject,
  detectPackageManager,
  initProject,
  runDoctor,
};

export type {
  CreateProjectOptions,
  CreateProjectResult,
  PackageManager,
} from "./create";
export type { InitProjectOptions, InitProjectResult } from "./init";
export type { DoctorCheck, DoctorOptions, DoctorResult } from "./doctor";
