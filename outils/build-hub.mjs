import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://lab.adamai.fr";

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function eolOf(text) {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function replaceBlock(rel, start, end, lines) {
  const file = path.join(root, rel);
  const text = fs.readFileSync(file, "utf8");
  const eol = eolOf(text);
  const i = text.indexOf(start);
  const j = text.indexOf(end);
  if (i < 0 || j < 0 || j < i) {
    throw new Error(`marqueurs absents dans ${rel}`);
  }
  const lineStart = text.lastIndexOf("\n", i - 1) + 1;
  const indent = text.slice(lineStart, i);
  const next =
    text.slice(0, i + start.length) +
    eol +
    lines.join(eol) +
    eol +
    indent +
    text.slice(j);
  fs.writeFileSync(file, next);
  return lines.length;
}

const registry = JSON.parse(read("demos/demos.json"));
const demos = Array.isArray(registry.demos) ? registry.demos : [];
const updated = registry.mise_a_jour || new Date().toISOString().slice(0, 10);

for (const demo of demos) {
  for (const key of ["slug", "titre", "date_ajout"]) {
    if (!demo[key]) throw new Error(`demos.json : champ ${key} manquant`);
  }
  const type = demo.type || "demo";
  if (type !== "demo" && type !== "test") {
    throw new Error(`demos.json : type inconnu pour ${demo.slug} (${type})`);
  }
  if (type === "demo" && (!demo.resume || !demo.source)) {
    throw new Error(`demos.json : resume ou source manquant pour la démo ${demo.slug}`);
  }
  if (type === "test" && !demo.rapport) {
    throw new Error(`demos.json : rapport manquant pour l’entrée de test ${demo.slug}`);
  }
  if (type === "test" && !demo.resume && !demo.resume_test) {
    throw new Error(`demos.json : resume ou resume_test manquant pour ${demo.slug}`);
  }
}

const demoLines = [];
demoLines.push("    <div class=\"cards\">");
for (const demo of demos) {
  if ((demo.type || "demo") !== "demo") continue;
  const url = `./${demo.slug}/`;
  demoLines.push("      <article class=\"card\">");
  demoLines.push(`        <h3><a href="${url}">${escapeHtml(demo.titre)}</a></h3>`);
  demoLines.push(`        <p>${escapeHtml(demo.resume)}</p>`);
  demoLines.push(`        <p><span class="tag-coming">${escapeHtml(demo.statut || "stable")}</span></p>`);
  const links = [];
  if (demo.rapport) {
    links.push(`<a href="../tests/${demo.rapport}/">Rapport de test</a>`);
  }
  links.push(`<a href="${demo.source}" rel="noopener">Code source</a>`);
  demoLines.push(`        <p>${links.join(" · ")}</p>`);
  demoLines.push("      </article>");
}
demoLines.push("    </div>");

const testLines = [];
testLines.push("    <div class=\"cards\">");
for (const demo of demos) {
  if (!demo.rapport) continue;
  testLines.push("      <article class=\"card\">");
  testLines.push(`        <h3><a href="./${demo.rapport}/">${escapeHtml(demo.titre)}</a></h3>`);
  testLines.push(`        <p>${escapeHtml(demo.resume_test || demo.resume)}</p>`);
  if ((demo.type || "demo") === "demo") {
    testLines.push(`        <p><a href="../demos/${demo.slug}/">Ouvrir la démo</a></p>`);
  } else if (demo.source) {
    testLines.push(`        <p><a href="${demo.source}" rel="noopener">Code source</a></p>`);
  }
  testLines.push("      </article>");
}
testLines.push("    </div>");

const urlLines = [];
function urlEntry(loc, changefreq, priority) {
  urlLines.push("  <url>");
  urlLines.push(`    <loc>${loc}</loc>`);
  urlLines.push(`    <lastmod>${updated}</lastmod>`);
  urlLines.push(`    <changefreq>${changefreq}</changefreq>`);
  urlLines.push(`    <priority>${priority}</priority>`);
  urlLines.push("  </url>");
}

urlEntry(`${SITE}/demos/`, "weekly", "0.9");
for (const demo of demos) {
  if ((demo.type || "demo") !== "demo") continue;
  urlEntry(`${SITE}/demos/${demo.slug}/`, "monthly", "0.9");
  if (demo.documentation) {
    urlEntry(`${SITE}/demos/${demo.slug}/${demo.documentation}`, "monthly", "0.7");
  }
}
urlEntry(`${SITE}/tests/`, "monthly", "0.6");
for (const demo of demos) {
  if (!demo.rapport) continue;
  urlEntry(`${SITE}/tests/${demo.rapport}/`, "monthly", "0.6");
}

const a = replaceBlock("demos/index.html", "<!-- demos:debut -->", "<!-- demos:fin -->", demoLines);
const b = replaceBlock("tests/index.html", "<!-- tests:debut -->", "<!-- tests:fin -->", testLines);
const c = replaceBlock("sitemap.xml", "<!-- urls:debut -->", "<!-- urls:fin -->", urlLines);

console.log(`catalogue : ${a} lignes`);
console.log(`tests : ${b} lignes`);
console.log(`sitemap : ${c} lignes`);
