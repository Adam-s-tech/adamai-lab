import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return fallback;
}

const slug = arg("slug", "");
if (!slug) {
  console.error("usage : node outils/sync-demo.mjs --slug <slug> [--source <dossier>] [--images <dossier>] [--from <url>] [--base <url>] [--out <dossier>]");
  process.exit(2);
}

const source = path.resolve(root, arg("source", "../mirage-demo/wasm-app"));
const images = path.resolve(root, arg("images", "../mirage-demo/exemples/images"));
const from = arg("from", "https://adam-s-tech.github.io/ocr-llm-miniature/");
const baseArg = arg("base", `https://lab.adamai.fr/demos/${slug}/`);
const base = baseArg.endsWith("/") ? baseArg : `${baseArg}/`;
const out = path.resolve(root, arg("out", `demos/${slug}`));

if (!fs.existsSync(source)) throw new Error(`source introuvable : ${source}`);
if (!fs.existsSync(images)) throw new Error(`images introuvables : ${images}`);
if (!from.endsWith("/")) throw new Error("--from doit se terminer par une barre oblique");

const excluded = new Set(["models", "serve.ts", "robots.txt", "sitemap.xml", ".nojekyll"]);

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(source, out, {
  recursive: true,
  filter(src) {
    const rel = path.relative(source, src);
    if (!rel) return true;
    const parts = rel.split(path.sep);
    return !parts.some((p) => excluded.has(p));
  },
});

const imageOut = path.join(out, "exemples", "images");
fs.mkdirSync(imageOut, { recursive: true });
for (const name of fs.readdirSync(images)) {
  const src = path.join(images, name);
  if (fs.statSync(src).isFile()) {
    fs.copyFileSync(src, path.join(imageOut, name));
  }
}

let replaced = 0;
let remaining = 0;
let pages = 0;
for (const name of fs.readdirSync(out)) {
  if (!name.endsWith(".html")) continue;
  const file = path.join(out, name);
  const before = fs.readFileSync(file, "utf8");
  const hits = before.split(from).length - 1;
  const after = before.split(from).join(base);
  if (hits > 0) fs.writeFileSync(file, after);
  replaced += hits;
  remaining += (after.match(/adam-s-tech\.github\.io/g) || []).length;
  pages += 1;
}

console.log(`démo ${slug} synchronisée dans ${path.relative(root, out)}`);
console.log(`pages réécrites : ${pages}, occurrences remplacées : ${replaced}`);
if (remaining > 0) {
  console.error(`URL absolues restantes (${remaining}) : vérifier ${from}`);
  process.exit(1);
}
