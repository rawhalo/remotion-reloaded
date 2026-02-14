import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { scanProjectRisk } from "../riskScan";

const tempDirs: string[] = [];

afterEach(() => {
  for (const directory of tempDirs.splice(0, tempDirs.length)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("scanProjectRisk", () => {
  it("detects ThreeCanvas and effect backend mix from source files", () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-risk-scan-"));
    tempDirs.push(projectDir);

    const compositionsDir = path.join(projectDir, "src", "compositions");
    mkdirSync(compositionsDir, { recursive: true });

    writeFileSync(
      path.join(compositionsDir, "Combined.tsx"),
      `import { ThreeCanvas } from "@remotion-reloaded/three";
import { Effect } from "@remotion-reloaded/effects";

export const Combined = () => (
  <ThreeCanvas>
    <Effect type="glitch">
      <Effect type="glow">
        <div>Hello</div>
      </Effect>
    </Effect>
  </ThreeCanvas>
);`,
      "utf-8",
    );

    const result = scanProjectRisk(projectDir);

    expect(result.containsThreeCanvas).toBe(true);
    expect(result.effectTypes).toEqual(["glitch", "glow"]);
    expect(result.effectBackends).toEqual(["css", "webgl"]);
    expect(result.effectGraphHash).toMatch(/^eg_[a-f0-9]{8}$/);
    expect(result.sourceFilesScanned).toBe(1);
  });

  it("returns empty safe defaults when no source tree exists", () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), "reloaded-risk-scan-"));
    tempDirs.push(projectDir);

    const result = scanProjectRisk(projectDir);

    expect(result.containsThreeCanvas).toBe(false);
    expect(result.effectTypes).toEqual([]);
    expect(result.effectBackends).toEqual([]);
    expect(result.sourceFilesScanned).toBe(0);
  });
});
