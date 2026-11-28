import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");

function listHtml(dir) {
  const out = [];
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  for (const name of fs.readdirSync(abs)) {
    const rel = path.join(dir, name);
    if (fs.statSync(path.join(root, rel)).isDirectory()) {
      out.push(...listHtml(rel));
    } else if (name.endsWith(".html")) {
      out.push(rel.split(path.sep).join("/"));
    }
  }
  return out;
}

const pages = [
  "index.html",
  "insights.html",
  "focus.html",
  "gpt-image.html",
  "method.html",
  "contact.html",
  "demos/index.html",
  "tests/index.html",
  "guides/index.html",
  ...listHtml("guides"),
  ...listHtml("demos/ocr-llm-miniature").filter((p) => !p.includes("/vendor/")),
  ...listHtml("tests/ocr-llm-miniature"),
];

function textNodes(raw) {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .split(/<[^>]*>/)
    .map((s) => s.replace(/&[a-z]+;/gi, " "))
    .filter((s) => s.trim().length);
}

const rows = [];
let totalDash = 0;
let totalEnt = 0;

for (const rel of [...new Set(pages)]) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  const raw = fs.readFileSync(file, "utf8");
  const lines = raw.split(/\r?\n/);
  const text = textNodes(raw).join(" \n ");
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (/\u2014|\u2013/iu.test(lines[i]) || /&(mdash|ndash);/i.test(lines[i])) {
      hits.push({ line: i + 1, text: lines[i].trim().slice(0, 160) });
    }
  }
  const em = (raw.match(/\u2014/g) || []).length;
  const en = (raw.match(/\u2013/g) || []).length;
  const ent = (raw.match(/&(mdash|ndash);/gi) || []).length;
  totalDash += em + en;
  totalEnt += ent;
  rows.push({
    rel,
    em,
    en,
    ent,
    lines: hits,
    apostrophes: (text.match(/'/g) || []).length,
    espaces: (text.match(/ [;:!?]/g) || []).length,
    doubles: (text.match(/ {2,}/g) || []).length,
  });
}

for (const r of rows) {
  const total = r.em + r.en + r.ent;
  console.log(
    `${total === 0 ? "OK " : "KO "} ${r.rel} : cadratins=${r.em + r.en}, entites=${r.ent}, apostrophes_droites=${r.apostrophes}, espaces_avant_ponctuation=${r.espaces}`,
  );
  for (const h of r.lines) console.log(`     L${h.line} ${h.text}`);
}

console.log(
  `\nTotal : ${totalDash} tiret(s) cadratin(s) ou demi-cadratin(s), ${totalEnt} entite(s) &mdash; ou &ndash;.`,
);

if (strict && totalDash + totalEnt > 0) {
  process.exit(1);
}
