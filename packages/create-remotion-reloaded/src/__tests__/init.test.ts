import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../init";

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

describe("initProject", () => {
  it("patches package dependencies and remotion config", async () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-init-"));
    tempDirs.push(projectDir);

    writeFileSync(
      path.join(projectDir, "package.json"),
      JSON.stringify(
        {
          name: "existing-project",
          private: true,
          dependencies: {
            remotion: "^4.0.0",
            react: "^19.0.0",
            "react-dom": "^19.0.0",
          },
        },
        null,
        2,
      ),
      "utf-8",
    );
    writeFileSync(path.join(projectDir, "remotion.config.ts"), "export default {};\n", "utf-8");

    const result = await initProject({ cwd: projectDir, logger: silentLogger });

    expect(result.updatedFiles).toContain("package.json");
    expect(result.updatedFiles).toContain("remotion.config.ts");

    const packageJson = JSON.parse(
      readFileSync(path.join(projectDir, "package.json"), "utf-8"),
    ) as { dependencies: Record<string, string> };

    expect(packageJson.dependencies["remotion-reloaded"]).toBeDefined();
    expect(packageJson.dependencies.gsap).toBeDefined();

    const remotionConfig = readFileSync(
      path.join(projectDir, "remotion.config.ts"),
      "utf-8",
    );

    expect(remotionConfig).toContain("withReloaded");
    expect(remotionConfig).toContain("export default withReloaded({});");

    expect(existsSync(path.join(projectDir, "src", "compositions", "HelloReloaded.tsx"))).toBe(true);
    expect(existsSync(path.join(projectDir, ".cursorrules"))).toBe(true);
    expect(existsSync(path.join(projectDir, "CLAUDE.md"))).toBe(true);
  });

  it("is idempotent when run multiple times", async () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-init-"));
    tempDirs.push(projectDir);

    mkdirSync(path.join(projectDir, "src"), { recursive: true });
    writeFileSync(
      path.join(projectDir, "package.json"),
      JSON.stringify(
        {
          name: "existing-project",
          private: true,
          dependencies: {
            remotion: "^4.0.0",
          },
        },
        null,
        2,
      ),
      "utf-8",
    );
    writeFileSync(path.join(projectDir, "remotion.config.ts"), "export default {};\n", "utf-8");

    await initProject({ cwd: projectDir, logger: silentLogger });
    await initProject({ cwd: projectDir, logger: silentLogger });

    const remotionConfig = readFileSync(
      path.join(projectDir, "remotion.config.ts"),
      "utf-8",
    );

    expect(remotionConfig.match(/withReloaded/g)?.length).toBe(2);
  });
});
