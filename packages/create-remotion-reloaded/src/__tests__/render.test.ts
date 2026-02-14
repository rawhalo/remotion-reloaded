import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runRenderPolicy } from "../render";

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

const writeSource = (projectDir: string, source: string): void => {
  const compositionsDir = path.join(projectDir, "src", "compositions");
  mkdirSync(compositionsDir, { recursive: true });
  writeFileSync(path.join(compositionsDir, "Scene.tsx"), source, "utf-8");
};

describe("runRenderPolicy", () => {
  it("routes risky combos to pre-comp by default", async () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-render-policy-"));
    tempDirs.push(projectDir);

    writeSource(
      projectDir,
      `import { ThreeCanvas } from "@remotion-reloaded/three";
import { Effect } from "@remotion-reloaded/effects";

export const Scene = () => (
  <ThreeCanvas>
    <Effect type="pixelate">
      <div>Hello</div>
    </Effect>
  </ThreeCanvas>
);`,
    );

    const result = await runRenderPolicy({
      cwd: projectDir,
      logger: silentLogger,
      compositionId: "Scene",
      executeRender: false,
    });

    expect(result.decision).toBe("requires-precomp");
    expect(result.routedPath).toBe("precomp");
    expect(result.exitCode).toBe(0);
    expect(result.precomp).toBeDefined();
  });

  it("fails fast when unsafe override disables timeout fallback", async () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-render-policy-"));
    tempDirs.push(projectDir);

    writeSource(
      projectDir,
      `import { ThreeCanvas } from "@remotion-reloaded/three";
import { Effect } from "@remotion-reloaded/effects";
export const Scene = () => <ThreeCanvas><Effect type="glitch"><div /></Effect></ThreeCanvas>;`,
    );

    const result = await runRenderPolicy({
      cwd: projectDir,
      logger: silentLogger,
      compositionId: "Scene",
      allowUnsafeSinglePass: true,
      fallbackOnTimeout: false,
      executeRender: false,
    });

    expect(result.decision).toBe("requires-precomp");
    expect(result.routedPath).toBe("unsafe-single-pass-failed");
    expect(result.exitCode).toBe(2);
  });

  it("keeps safe combinations on single-pass path", async () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-render-policy-"));
    tempDirs.push(projectDir);

    writeSource(
      projectDir,
      `import { Effect } from "@remotion-reloaded/effects";
export const Scene = () => <Effect type="glow"><div /></Effect>;`,
    );

    const result = await runRenderPolicy({
      cwd: projectDir,
      logger: silentLogger,
      compositionId: "Scene",
      executeRender: false,
    });

    expect(result.decision).toBe("single-pass-safe");
    expect(result.routedPath).toBe("single-pass");
    expect(result.exitCode).toBe(0);
  });

  it("routes override attempts to pre-comp when timeout fallback is enabled", async () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-render-policy-"));
    tempDirs.push(projectDir);

    writeSource(
      projectDir,
      `import { ThreeCanvas } from "@remotion-reloaded/three";
import { Effect } from "@remotion-reloaded/effects";
export const Scene = () => <ThreeCanvas><Effect type="pixelate"><div /></Effect></ThreeCanvas>;`,
    );

    const result = await runRenderPolicy({
      cwd: projectDir,
      logger: silentLogger,
      compositionId: "Scene",
      allowUnsafeSinglePass: true,
      fallbackOnTimeout: true,
      executeRender: false,
    });

    expect(result.decision).toBe("requires-precomp");
    expect(result.routedPath).toBe("precomp");
    expect(result.exitCode).toBe(0);
  });
});
