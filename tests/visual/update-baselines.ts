import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderFrameToBuffer } from "../utils/remotion";
import { visualCases } from "./cases";

const currentFile = fileURLToPath(import.meta.url);
const snapshotDir = path.resolve(path.dirname(currentFile), "snapshots");

async function run(): Promise<void> {
  await fs.mkdir(snapshotDir, { recursive: true });

  for (const visualCase of visualCases) {
    const buffer = await renderFrameToBuffer({
      compositionId: visualCase.compositionId,
      frame: visualCase.frame,
      inputProps: visualCase.inputProps,
    });

    const outputPath = path.join(snapshotDir, visualCase.fileName);
    await fs.writeFile(outputPath, buffer);
    // eslint-disable-next-line no-console
    console.log(`Wrote baseline: ${outputPath}`);
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
