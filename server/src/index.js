require("dotenv").config({
  path: require("node:path").join(__dirname, "../.env"),
  quiet: true,
});
if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET === "replace-with-a-random-secret-of-at-least-32-characters"
) {
  throw new Error(
    "Set JWT_SECRET to a random value of at least 32 characters in server/.env.",
  );
}
const app = require("./app");
const prisma = require("./db");
const express = require("express");
const path = require("node:path");
const dist = path.resolve(__dirname, "../../dist");
if (require("node:fs").existsSync(path.join(dist, "index.html"))) {
  app.use(express.static(dist));
  app.get("/{*path}", (req, res) =>
    res.sendFile(path.join(dist, "index.html")),
  );
} else {
  app.get("/", (req, res) =>
    res.json({ service: "WashTrack API", health: "/api/health" }),
  );
}
const port = Number(process.env.PORT || 3001);
prisma
  .$connect()
  .then(() => {
    const server = app.listen(port, "127.0.0.1", () =>
      console.log(`WashTrack API: http://127.0.0.1:${port}`),
    );
    server.on("error", async () => {
      console.error("Server could not listen. Check PORT.");
      await prisma.$disconnect();
      process.exitCode = 1;
    });
    for (const signal of ["SIGTERM", "SIGINT"]) {
      process.once(signal, () => {
        server.close(async () => {
          await prisma.$disconnect();
          process.exit(0);
        });
        setTimeout(() => process.exit(1), 5000).unref();
      });
    }
  })
  .catch(() => {
    console.error(
      "Cannot connect to PostgreSQL. Check server/.env and start PostgreSQL.",
    );
    process.exit(1);
  });
