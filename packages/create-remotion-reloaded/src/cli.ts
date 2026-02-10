import { runCli } from "./index";

runCli(process.argv.slice(2))
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Unexpected CLI error.",
    );
    process.exitCode = 1;
  });
