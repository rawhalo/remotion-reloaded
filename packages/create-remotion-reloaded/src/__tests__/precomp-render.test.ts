import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildDefaultPrecompCacheInput,
  runPrecomp,
} from "../precomp";

const tempDirs: string[] = [];

const silentLogger = {
  log: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

const isEnvironmentBrowserLaunchError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return [
    "trying to connect to the browser",
    "timed out after",
    "failed to launch the browser process",
    "mach_port_rendezvous",
    "machportrendezvous",
    "permission denied (1100)",
    "no usable sandbox",
    "/dev/shm",
  ].some((marker) => message.includes(marker));
};

afterEach(() => {
  for (const directory of tempDirs.splice(0, tempDirs.length)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

const writeFixtureProject = (projectDir: string): void => {
  const srcDir = path.join(projectDir, "src");
  mkdirSync(srcDir, { recursive: true });

  writeFileSync(
    path.join(projectDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          jsx: "react-jsx",
        },
      },
      null,
      2,
    ),
    "utf-8",
  );

  writeFileSync(
    path.join(srcDir, "index.ts"),
    `import { registerRoot } from "remotion";
import { Root } from "./Root";
registerRoot(Root);
`,
    "utf-8",
  );

  writeFileSync(
    path.join(srcDir, "Root.tsx"),
    `import { AbsoluteFill, Composition } from "remotion";

const SourceComp = () => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      backgroundColor: "#0f172a",
      color: "#f8fafc",
      justifyContent: "center",
      fontFamily: "sans-serif",
      fontSize: 42,
    }}
  >
    PASS 1
  </AbsoluteFill>
);

type EffectsProps = {
  pass1MediaPath?: string;
};

const EffectsComp: React.FC<EffectsProps> = ({ pass1MediaPath }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      backgroundColor: "#111827",
      color: "#22d3ee",
      justifyContent: "center",
      fontFamily: "sans-serif",
      fontSize: 32,
    }}
  >
    {pass1MediaPath ? "PASS 2" : "MISSING PASS 1"}
  </AbsoluteFill>
);

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="SourceComp"
        component={SourceComp}
        durationInFrames={10}
        fps={30}
        width={320}
        height={180}
      />
      <Composition
        id="EffectsComp"
        component={EffectsComp}
        durationInFrames={10}
        fps={30}
        width={320}
        height={180}
      />
    </>
  );
};
`,
    "utf-8",
  );
};

describe("runPrecomp render execution", () => {
  it(
    "renders pass1 and pass2 outputs when executeRender is enabled",
    async (ctx) => {
      const projectDir = mkdtempSync(
        (() => {
          const baseTmpDir = path.join(process.cwd(), "tmp");
          mkdirSync(baseTmpDir, { recursive: true });
          return path.join(baseTmpDir, "reloaded-precomp-render-");
        })(),
      );
      tempDirs.push(projectDir);
      writeFixtureProject(projectDir);

      try {
        const result = await runPrecomp({
          cwd: projectDir,
          logger: silentLogger,
          sourceCompositionId: "SourceComp",
          effectsCompositionId: "EffectsComp",
          entryPoint: "src/index.ts",
          executeRender: true,
          outputFormat: "still",
          cacheInput: buildDefaultPrecompCacheInput(projectDir, {
            compositionId: "SourceComp",
            fps: 30,
            durationInFrames: 10,
            width: 320,
            height: 180,
            effectGraphHash: "eg_real_render_test",
            inputPropsHash: "props_real_render_test",
          }),
        });

        expect(result.cacheHit).toBe(false);
        expect(existsSync(result.pass1ReferenceFramePath)).toBe(true);
        expect(existsSync(result.finalOutputPath)).toBe(true);
        expect(result.metadata.compositionId).toBe("SourceComp");
        expect(result.metadata.fps).toBe(30);
        expect(result.metadata.durationInFrames).toBe(10);
        expect(result.metadata.width).toBe(320);
        expect(result.metadata.height).toBe(180);

        const dryRunResolved = await runPrecomp({
          cwd: projectDir,
          logger: silentLogger,
          sourceCompositionId: "SourceComp",
          effectsCompositionId: "EffectsComp",
          entryPoint: "src/index.ts",
          executeRender: false,
          resolveCompositionMetadata: true,
          outputFormat: "still",
          cacheInput: buildDefaultPrecompCacheInput(projectDir, {
            compositionId: "SourceComp",
            fps: 1,
            durationInFrames: 1,
            width: 111,
            height: 111,
            effectGraphHash: "eg_real_render_test",
            inputPropsHash: "props_real_render_test",
          }),
        });

        expect(dryRunResolved.metadata.fps).toBe(30);
        expect(dryRunResolved.metadata.durationInFrames).toBe(10);
        expect(dryRunResolved.metadata.width).toBe(320);
        expect(dryRunResolved.metadata.height).toBe(180);
      } catch (error) {
        if (isEnvironmentBrowserLaunchError(error)) {
          ctx.skip(
            "Chromium launch is unavailable in this environment; skipping render execution assertion.",
          );
          return;
        }

        throw error;
      }
    },
    120_000,
  );
});
