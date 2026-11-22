// CommonJS launcher: prepare the local database, then run API + Vite together.
const fs = require("node:fs");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const server = path.join(root, "server");
const envFile = path.join(server, ".env");

// A fresh clone can start with npm run dev; install dependencies before loading them.
function prepareDependencies(directory) {
  const result = spawnSync("npm", ["ci"], {
    cwd: directory,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error || result.status !== 0) {
    console.error("Dependency installation failed. Check your internet connection and Node.js version.");
    process.exit(1);
  }
}
if (!fs.existsSync(path.join(root, "node_modules/vite/bin/vite.js"))) {
  console.log("First run: installing frontend and backend dependencies...");
  prepareDependencies(root);
}
if (!fs.existsSync(path.join(server, "node_modules/@prisma/client/package.json"))) {
  prepareDependencies(server);
}
if (!fs.existsSync(path.join(server, "node_modules/.prisma/client/index.js"))) {
  const generated = spawnSync(process.execPath, [
    path.join(server, "node_modules/prisma/build/index.js"), "generate",
  ], { cwd: server, stdio: "inherit" });
  if (generated.error || generated.status !== 0) {
    process.exit(1);
  }
}

if (!fs.existsSync(envFile)) {
  const example = fs
    .readFileSync(path.join(server, ".env.example"), "utf8")
    .replace(
      "choose-a-demo-password-at-least-8-characters",
      "WashTrackDemo15!",
    );
  fs.writeFileSync(envFile, example, { mode: 0o600, flag: "wx" });
}
require("../server/node_modules/dotenv").config({ path: envFile, quiet: true });
if (
  !process.env.DATABASE_URL ||
  /YOUR_USER|YOUR_PASSWORD/.test(process.env.DATABASE_URL)
) {
  console.error(
    "\nOne-time setup: edit DATABASE_URL in server/.env for your own empty PostgreSQL database. Start PostgreSQL, then run npm run dev again. Also set JWT_SECRET in server/.env using a random secret from your password manager.\n",
  );
  process.exit(1);
}
if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET === "replace-with-a-random-secret-of-at-least-32-characters"
) {
  console.error(
    "Set a random JWT_SECRET of at least 32 characters in server/.env.",
  );
  process.exit(1);
}
const port = Number(process.env.PORT || 3001);
const frontendPort = Number(process.env.FRONTEND_PORT || 5173);
if (
  ![port, frontendPort].every(
    (p) => Number.isInteger(p) && p >= 1024 && p <= 65535,
  ) ||
  port === frontendPort
) {
  console.error(
    "PORT and FRONTEND_PORT must be distinct ports between 1024 and 65535.",
  );
  process.exit(1);
}
for (const args of [
  [
    path.join(server, "node_modules/prisma/build/index.js"),
    "migrate",
    "deploy",
  ],
  [path.join(server, "prisma/seed.js")],
]) {
  const result = spawnSync(process.execPath, args, {
    cwd: server,
    stdio: "inherit",
  });
  if (result.error || result.status !== 0) {
    console.error(
      "Database preparation failed. Check server/.env and PostgreSQL. The frontend has not been started.",
    );
    process.exit(1);
  }
}
const children = [];
let stopping = false;
let exitCode = 0;
let shutdownTimer;
function stop(code = 0) {
  if (stopping) {
    return;
  }
  stopping = true;
  exitCode = code;
  for (const child of children) {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
    }
  }
  shutdownTimer = setTimeout(() => {
    for (const child of children) {
      if (child.exitCode === null) {
        child.kill("SIGKILL");
      }
    }
  }, 5000);
  shutdownTimer.unref();
}
function launch(file, args, options = {}) {
  const child = spawn(process.execPath, [file, ...args], {
    cwd: root,
    stdio: ["inherit", "pipe", "inherit"],
    ...options,
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) {
      stop(code || 1);
    }
    if (children.every((c) => c.exitCode !== null || c.signalCode !== null)) {
      clearTimeout(shutdownTimer);
      process.exitCode = exitCode;
    }
  });
  return child;
}
const api = launch(path.join(server, "src/index.js"), [], { cwd: server });
let frontendStarted = false;
api.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  if (!frontendStarted && chunk.toString().includes("WashTrack API:")) {
    frontendStarted = true;
    console.log(
      "\nStarting frontend. Open the Vite Local URL below. Ctrl+C stops both servers.\n",
    );
    const vite = launch(
      path.join(root, "node_modules/vite/bin/vite.js"),
      ["--port", String(frontendPort), "--strictPort"],
      {
        env: { ...process.env, WASHTRACK_API_PORT: String(port) },
      },
    );
    vite.stdout.pipe(process.stdout);
  }
});
process.once("SIGINT", () => stop());
process.once("SIGTERM", () => stop());
