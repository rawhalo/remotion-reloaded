import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runRenderPolicy } from "../../packages/create-remotion-reloaded/src/render";

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

const writeFixtureSource = (
  fixtureName: string,
  source: string,
): string => {
  const fixtureDir = mkdtempSync(path.join(tmpdir(), `reloaded-matrix-${fixtureName}-`));
  tempDirs.push(fixtureDir);
  const srcDir = path.join(fixtureDir, "src", "compositions");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(path.join(srcDir, "Scene.tsx"), source, "utf-8");
  return fixtureDir;
};

describe("Three + effects risk matrix", () => {
  it("fx-safe-2d -> single-pass-safe", async () => {
    const fixtureDir = writeFixtureSource(
      "fx-safe-2d",
      `import { Effect } from "@remotion-reloaded/effects";
export const Scene = () => (
  <Effect type="glow">
    <div>safe</div>
  </Effect>
);`,
    );

    const result = await runRenderPolicy({
      cwd: fixtureDir,
      logger: silentLogger,
      compositionId: "fx-safe-2d",
      executeRender: false,
    });

    expect(result.decision).toBe("single-pass-safe");
    expect(result.routedPath).toBe("single-pass");
  });

  it("three-safe-post -> single-pass-safe", async () => {
    const fixtureDir = writeFixtureSource(
      "three-safe-post",
      `import { ThreeCanvas, EffectComposer, Bloom } from "@remotion-reloaded/three";

export const Scene = () => (
  <ThreeCanvas>
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#22d3ee" />
    </mesh>
    <EffectComposer>
      <Bloom intensity={0.4} />
    </EffectComposer>
  </ThreeCanvas>
);`,
    );

    const result = await runRenderPolicy({
      cwd: fixtureDir,
      logger: silentLogger,
      compositionId: "three-safe-post",
      executeRender: false,
    });

    expect(result.decision).toBe("single-pass-safe");
    expect(result.routedPath).toBe("single-pass");
  });

  it("three-risky-webgl -> requires-precomp", async () => {
    const fixtureDir = writeFixtureSource(
      "three-risky-webgl",
      `import { ThreeCanvas } from "@remotion-reloaded/three";
import { Effect } from "@remotion-reloaded/effects";

export const Scene = () => (
  <ThreeCanvas>
    <Effect type="glitch">
      <div>risky</div>
    </Effect>
  </ThreeCanvas>
);`,
    );

    const result = await runRenderPolicy({
      cwd: fixtureDir,
      logger: silentLogger,
      compositionId: "three-risky-webgl",
      executeRender: false,
    });

    expect(result.decision).toBe("requires-precomp");
    expect(result.routedPath).toBe("precomp");
  });

  it("three-risky-override -> deterministic fail when timeout fallback disabled", async () => {
    const fixtureDir = writeFixtureSource(
      "three-risky-override",
      `import { ThreeCanvas } from "@remotion-reloaded/three";
import { Effect } from "@remotion-reloaded/effects";

export const Scene = () => (
  <ThreeCanvas>
    <Effect type="pixelate">
      <div>override</div>
    </Effect>
  </ThreeCanvas>
);`,
    );

    const result = await runRenderPolicy({
      cwd: fixtureDir,
      logger: silentLogger,
      compositionId: "three-risky-override",
      allowUnsafeSinglePass: true,
      fallbackOnTimeout: false,
      executeRender: false,
    });

    expect(result.decision).toBe("requires-precomp");
    expect(result.routedPath).toBe("unsafe-single-pass-failed");
    expect(result.exitCode).toBe(2);
  });
});
