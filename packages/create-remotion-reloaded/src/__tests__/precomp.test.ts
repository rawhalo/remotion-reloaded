import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  utimesSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildDefaultPrecompCacheInput,
  cleanPrecompCache,
  createPrecompCacheKey,
  runPrecomp,
} from "../precomp";

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

describe("precomp cache contract", () => {
  it("writes metadata and reuses cache when inputs do not change", async () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-precomp-"));
    tempDirs.push(projectDir);

    const cacheInput = buildDefaultPrecompCacheInput(projectDir, {
      compositionId: "DemoComp",
      effectGraphHash: "eg_abc12345",
      inputPropsHash: "props_abc12345",
    });

    const first = await runPrecomp({
      cwd: projectDir,
      logger: silentLogger,
      sourceCompositionId: "DemoComp",
      executeRender: false,
      cacheInput,
    });
    const second = await runPrecomp({
      cwd: projectDir,
      logger: silentLogger,
      sourceCompositionId: "DemoComp",
      executeRender: false,
      cacheInput,
    });

    expect(first.cacheHit).toBe(false);
    expect(second.cacheHit).toBe(true);
    expect(first.cacheKey).toBe(second.cacheKey);
    expect(existsSync(path.join(first.pass1Dir, "frames", "frame-000000.png"))).toBe(
      true,
    );

    const metadata = JSON.parse(readFileSync(first.pass1MetadataPath, "utf-8")) as {
      cacheKey: string;
      compositionId: string;
    };
    expect(metadata.cacheKey).toBe(first.cacheKey);
    expect(metadata.compositionId).toBe("DemoComp");
  });

  it("changes cache key when normalized cache input changes", () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-precomp-"));
    tempDirs.push(projectDir);

    const baseInput = buildDefaultPrecompCacheInput(projectDir, {
      compositionId: "DemoComp",
      effectGraphHash: "eg_abc12345",
      inputPropsHash: "props_abc12345",
    });

    const keyA = createPrecompCacheKey(baseInput);
    const keyB = createPrecompCacheKey({
      ...baseInput,
      durationInFrames: baseInput.durationInFrames + 1,
    });

    expect(keyA).not.toBe(keyB);
  });

  it("removes stale cache directories with cleanPrecompCache", async () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-precomp-"));
    tempDirs.push(projectDir);

    const first = await runPrecomp({
      cwd: projectDir,
      logger: silentLogger,
      sourceCompositionId: "DemoComp",
      executeRender: false,
      cacheInput: buildDefaultPrecompCacheInput(projectDir, {
        compositionId: "DemoComp",
      }),
    });

    const staleDate = new Date("2020-01-01T00:00:00.000Z");
    utimesSync(first.pass1Dir, staleDate, staleDate);

    const cleaned = cleanPrecompCache({
      cwd: projectDir,
      logger: silentLogger,
      retentionDays: 1,
    });

    expect(cleaned.scannedCacheDirectories).toBeGreaterThan(0);
    expect(cleaned.deletedPaths).toContain(first.pass1Dir);
    expect(existsSync(first.pass1Dir)).toBe(false);
  });
});
