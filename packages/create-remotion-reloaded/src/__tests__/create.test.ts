import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createProject } from "../create";

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

describe("createProject", () => {
  it("scaffolds the default template", async () => {
    const workspaceDir = mkdtempSync(path.join(tmpdir(), "reloaded-create-"));
    tempDirs.push(workspaceDir);

    const result = await createProject({
      projectName: "demo-project",
      cwd: workspaceDir,
      skipInstall: true,
      logger: silentLogger,
    });

    const projectDir = path.join(workspaceDir, "demo-project");
    expect(result.projectDir).toBe(projectDir);
    expect(result.template).toBe("default");
    expect(existsSync(path.join(projectDir, "src", "Root.tsx"))).toBe(true);
    expect(existsSync(path.join(projectDir, "remotion.config.ts"))).toBe(true);

    const packageJson = JSON.parse(
      readFileSync(path.join(projectDir, "package.json"), "utf-8"),
    ) as { name: string; scripts: Record<string, string> };

    expect(packageJson.name).toBe("demo-project");
    expect(packageJson.scripts.preview).toContain("remotion studio");

    const rootFile = readFileSync(path.join(projectDir, "src", "Root.tsx"), "utf-8");
    expect(rootFile).toContain("HelloReloaded");
    expect(rootFile).toContain("ParticleDemo");
  });

  it("rejects path traversal style project names", async () => {
    const workspaceDir = mkdtempSync(path.join(tmpdir(), "reloaded-create-"));
    tempDirs.push(workspaceDir);

    await expect(
      createProject({
        projectName: "../escape",
        cwd: workspaceDir,
        skipInstall: true,
        logger: silentLogger,
      }),
    ).rejects.toThrow("single directory name");
  });
});
