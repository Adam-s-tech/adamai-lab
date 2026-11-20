import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://lab.adamai.fr";
const errors = [];
const infos = [];

function fail(message) {
  errors.push(message);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function listHtml(dir) {
  const out = [];
  if (!exists(dir)) return out;
  for (const name of fs.readdirSync(path.join(root, dir))) {
    const rel = path.join(dir, name);
    if (fs.statSync(path.join(root, rel)).isDirectory()) {
      out.push(...listHtml(rel));
    } else if (name.endsWith(".html")) {
      out.push(rel.split(path.sep).join("/"));
    }
  }
  return out;
}

const registry = JSON.parse(read("demos/demos.json"));
const demos = Array.isArray(registry.demos) ? registry.demos : [];

const expected = new Map();
expected.set(`${SITE}/`, "index.html");
for (const page of ["insights.html", "focus.html", "gpt-image.html", "method.html", "contact.html"]) {
  expected.set(`${SITE}/${page}`, page);
}
expected.set(`${SITE}/demos/`, "demos/index.html");
expected.set(`${SITE}/tests/`, "tests/index.html");
for (const demo of demos) {
  const type = demo.type || "demo";
  if (type === "demo") {
    expected.set(`${SITE}/demos/${demo.slug}/`, `demos/${demo.slug}/index.html`);
    if (demo.documentation) {
      expected.set(`${SITE}/demos/${demo.slug}/${demo.documentation}`, `demos/${demo.slug}/${demo.documentation}`);
    }
  }
  if (demo.rapport) {
    expected.set(`${SITE}/tests/${demo.rapport}/`, `tests/${demo.rapport}/index.html`);
  }
}

const sitemap = read("sitemap.xml");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (new Set(locs).size !== locs.length) fail("sitemap.xml : URL en double");
for (const loc of locs) {
  if (!expected.has(loc)) fail(`sitemap.xml : URL inattendue ${loc}`);
}
for (const loc of expected.keys()) {
  if (!locs.includes(loc)) fail(`sitemap.xml : URL absente ${loc}`);
}
if (/\.(wasm|cact|js|css|json)</.test(sitemap)) {
  fail("sitemap.xml : ne doit pas lister de ressource technique");
}

for (const [url, rel] of expected) {
  if (!exists(rel)) {
    fail(`fichier manquant pour ${url} : ${rel}`);
    continue;
  }
  const html = read(rel);
  const m = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!m) {
    fail(`${rel} : canonical absent`);
  } else if (m[1] !== url) {
    fail(`${rel} : canonical ${m[1]} au lieu de ${url}`);
  }
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(`${rel} : ${h1} balise(s) h1`);
}

const robots = read("robots.txt").split(/\r?\n/).filter((l) => l.trim().startsWith("Sitemap:"));
if (robots.length !== 1) fail(`robots.txt : ${robots.length} ligne(s) Sitemap`);
else if (robots[0].trim() !== `Sitemap: ${SITE}/sitemap.xml`) {
  fail(`robots.txt : ${robots[0].trim()}`);
}

if (read("CNAME").trim() !== "lab.adamai.fr") fail("CNAME : domaine inattendu");

for (const rel of [...listHtml("demos"), ...listHtml("tests")]) {
  const html = read(rel);
  if (/[\u2014\u2013]/.test(html)) fail(`${rel} : tiret cadratin ou demi-cadratin`);
  if (/adam-s-tech\.github\.io/.test(html)) fail(`${rel} : URL de site de projet restante`);
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = m[1];
    if (/^(https?:|mailto:|data:|blob:|#)/.test(raw)) continue;
    const clean = raw.split("#")[0].split("?")[0];
    if (!clean) continue;
    if (clean.startsWith("/")) {
      fail(`${rel} : chemin absolu ${clean}`);
      continue;
    }
    let target = path.posix.normalize(
      path.posix.join(path.posix.dirname(`/${rel}`), clean),
    ).replace(/^\//, "");
    if (target.endsWith("/")) target += "index.html";
    if (!exists(target.split("/").join(path.sep))) {
      fail(`${rel} : cible introuvable ${raw}`);
    }
  }
}

for (const demo of demos) {
  if ((demo.type || "demo") !== "demo") continue;
  const dir = `demos/${demo.slug}`;
  for (const name of [
    "index.html",
    "app.js",
    "styles.css",
    "manifest.webmanifest",
    "og-image.png",
    "vendor/cactus.js",
    "vendor/cactus.wasm",
  ]) {
    if (!exists(`${dir}/${name}`)) fail(`${dir} : fichier manquant ${name}`);
  }
  if (demo.documentation && !exists(`${dir}/${demo.documentation}`)) {
    fail(`${dir} : documentation ${demo.documentation} absente`);
  }
  if (demo.capture && !exists(`${dir}/${demo.capture}`)) {
    fail(`${dir} : capture ${demo.capture} absente`);
  }
  const imgDir = path.join(root, dir, "exemples", "images");
  if (!fs.existsSync(imgDir)) {
    fail(`${dir} : dossier exemples/images absent`);
  } else if (fs.readdirSync(imgDir).length < 3) {
    fail(`${dir} : moins de trois images de documentation`);
  }
  if (exists(`${dir}/models/mirage.cact`)) {
    fail(`${dir} : les poids du modèle ne doivent pas être publiés`);
  }
  if (exists(`${dir}/robots.txt`) || exists(`${dir}/sitemap.xml`)) {
    fail(`${dir} : robots.txt ou sitemap.xml de démo encore présent`);
  }
  if (exists(`${dir}/version.json`)) {
    let version = null;
    try {
      version = JSON.parse(read(`${dir}/version.json`));
    } catch {
      fail(`${dir}/version.json : JSON invalide`);
    }
    if (version) {
      if (version.slug !== demo.slug) {
        fail(`${dir}/version.json : slug ${version.slug} au lieu de ${demo.slug}`);
      }
      if (demo.source && version.source !== demo.source) {
        fail(`${dir}/version.json : source ${version.source} au lieu de ${demo.source}`);
      }
      if (!version.source_commit) fail(`${dir}/version.json : source_commit absent`);
      if (!version.synced_at) fail(`${dir}/version.json : synced_at absent`);
    }
  }
}

if (!exists(".nojekyll")) fail(".nojekyll absent à la racine");

infos.push(`${expected.size} URL publiques`);
infos.push(`${listHtml("demos").length + listHtml("tests").length} pages démo et test`);

for (const line of infos) console.log(`i ${line}`);
if (errors.length) {
  console.error(`\n${errors.length} problème(s) :`);
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}
console.log("verify-site OK");
