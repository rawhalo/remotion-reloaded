import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCli } from "../index";

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

describe("runCli", () => {
  it("accepts --resolve-composition-metadata on dry-run render", async () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-cli-"));
    tempDirs.push(projectDir);

    const srcDir = path.join(projectDir, "src");
    mkdirSync(srcDir, { recursive: true });
    writeFileSync(
      path.join(srcDir, "Scene.tsx"),
      `export const Scene = () => <div>safe</div>;`,
      "utf-8",
    );

    const exitCode = await runCli(
      ["render", "--composition-id", "Scene", "--dry-run", "--resolve-composition-metadata"],
      {
        cwd: projectDir,
        invokedAs: "remotion-reloaded",
        logger: silentLogger,
      },
    );

    expect(exitCode).toBe(0);
  });

  it("runs render command and routes risky combo through policy", async () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-cli-"));
    tempDirs.push(projectDir);

    const srcDir = path.join(projectDir, "src");
    mkdirSync(srcDir, { recursive: true });
    writeFileSync(
      path.join(srcDir, "Scene.tsx"),
      `import { ThreeCanvas } from "@remotion-reloaded/three";
import { Effect } from "@remotion-reloaded/effects";
export const Scene = () => <ThreeCanvas><Effect type="glitch"><div /></Effect></ThreeCanvas>;`,
      "utf-8",
    );

    const exitCode = await runCli(
      ["render", "--composition-id", "Scene", "--dry-run"],
      {
        cwd: projectDir,
        invokedAs: "remotion-reloaded",
        logger: silentLogger,
      },
    );

    expect(exitCode).toBe(0);
  });

  it("runs precomp clean command without failing", async () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-cli-"));
    tempDirs.push(projectDir);

    const exitCode = await runCli(
      ["precomp", "clean", "--retention-days", "1"],
      {
        cwd: projectDir,
        invokedAs: "remotion-reloaded",
        logger: silentLogger,
      },
    );

    expect(exitCode).toBe(0);
  });
});
