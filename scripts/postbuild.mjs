// After `vite build`: provide the app shell at dist/spa-shell.html (served at
// /spa-shell). It is the fallback for app-only routes like /auth and /admin,
// and the template api/render.js fills with live content for search engines.
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const from = path.join(dist, "index.html");
const to = path.join(dist, "spa-shell.html");

if (fs.existsSync(from)) {
  fs.copyFileSync(from, to);
  console.log("[postbuild] dist/index.html -> dist/spa-shell.html (copied)");
} else if (!fs.existsSync(to)) {
  console.error("[postbuild] dist/index.html not found");
  process.exit(1);
}
