#!/usr/bin/env node
"use strict";

(async () => {
  try {
    const cli = await import("create-remotion-reloaded");
    const exitCode = await cli.runCli(process.argv.slice(2), {
      invokedAs: "remotion-reloaded",
    });

    process.exitCode = typeof exitCode === "number" ? exitCode : 0;
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Unexpected CLI failure.",
    );
    process.exitCode = 1;
  }
})();
