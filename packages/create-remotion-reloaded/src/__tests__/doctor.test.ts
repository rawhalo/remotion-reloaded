import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createProject } from "../create";
import { runDoctor } from "../doctor";

const tempDirs: string[] = [];

const silentLogger = {
  log: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

afterEach(() => {
  for (const directory of tempDirs.splice(0, tempDirs.length)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("runDoctor", () => {
  it("reports success for a scaffolded project", async () => {
    const workspaceDir = mkdtempSync(path.join(tmpdir(), "reloaded-doctor-"));
    tempDirs.push(workspaceDir);

    const project = await createProject({
      projectName: "healthy-project",
      cwd: workspaceDir,
      skipInstall: true,
      logger: silentLogger,
    });

    const packageJsonPath = path.join(project.projectDir, "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as {
      dependencies: Record<string, string>;
    };

    // Simulate init-style installation where remotion-reloaded is present.
    packageJson.dependencies["remotion-reloaded"] = "latest";
    packageJson.dependencies.gsap = "^3.12.0";
    writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf-8");

    const result = await runDoctor({ cwd: project.projectDir, logger: silentLogger });

    expect(result.failed).toBe(0);
    expect(result.exitCode).toBe(0);
    expect(result.checks.some((check) => check.status === "pass")).toBe(true);
  });

  it("returns non-zero when package.json is missing", async () => {
    const emptyDir = mkdtempSync(path.join(tmpdir(), "reloaded-doctor-"));
    tempDirs.push(emptyDir);

    const result = await runDoctor({ cwd: emptyDir, logger: silentLogger });

    expect(result.failed).toBeGreaterThan(0);
    expect(result.exitCode).toBe(1);
  });
});
