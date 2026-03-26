const { spawn } = require("node:child_process");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

let currentChild = null;
let interrupted = false;
let shuttingDown = false;

function isSignalExit(result) {
  return result.signal === "SIGINT" || result.signal === "SIGTERM";
}

function shouldExitGracefully(result) {
  return interrupted || isSignalExit(result);
}

function runNpmScript(scriptName) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ["run", scriptName], {
      stdio: "inherit",
      env: process.env,
    });

    currentChild = child;

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (currentChild === child) {
        currentChild = null;
      }

      resolve({
        code: code ?? 0,
        signal,
      });
    });
  });
}

async function stopServices() {
  shuttingDown = true;

  try {
    await runNpmScript("services:stop");
  } catch (error) {
    console.error("\nFalha ao parar os servicos:", error.message);
  }
}

function forwardSignal(signal) {
  interrupted = true;

  if (shuttingDown) {
    return;
  }

  if (currentChild) {
    currentChild.kill(signal);
  }
}

async function runStep(scriptName) {
  const result = await runNpmScript(scriptName);

  if (shouldExitGracefully(result)) {
    return { exitCode: 0, interrupted: true };
  }

  if (result.code !== 0) {
    return { exitCode: result.code, interrupted: false };
  }

  return { exitCode: 0, interrupted: false };
}

async function main() {
  process.on("SIGINT", () => forwardSignal("SIGINT"));
  process.on("SIGTERM", () => forwardSignal("SIGTERM"));

  const startupSteps = [
    "services:up",
    "services:wait:database",
    "migrations:up",
  ];

  let exitCode = 0;

  try {
    for (const step of startupSteps) {
      const result = await runStep(step);
      exitCode = result.exitCode;

      if (result.interrupted || result.exitCode !== 0) {
        break;
      }
    }

    if (exitCode === 0 && !interrupted) {
      const devServerResult = await runStep("dev:server");
      exitCode = devServerResult.exitCode;
    }
  } catch (error) {
    console.error(
      "\nFalha ao executar o ambiente de desenvolvimento:",
      error.message,
    );
    exitCode = 1;
  } finally {
    await stopServices();
  }

  process.exit(exitCode);
}

main();
