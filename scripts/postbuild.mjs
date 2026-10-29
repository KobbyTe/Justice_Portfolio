// After `vite build`: move the app shell out of the way so Vercel routes "/"
// (and every other public page) through api/render.js, which fills in live
// content for search engines. The shell itself is served at /spa-shell and is
// the fallback for app-only routes like /auth and /admin.
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const from = path.join(dist, "index.html");
const to = path.join(dist, "spa-shell.html");

if (fs.existsSync(from)) {
  fs.renameSync(from, to);
  console.log("[postbuild] dist/index.html -> dist/spa-shell.html");
} else if (!fs.existsSync(to)) {
  console.error("[postbuild] dist/index.html not found");
  process.exit(1);
}
