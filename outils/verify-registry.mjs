import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const infos = [];

function fail(message) {
  errors.push(message);
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function isString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isDate(value) {
  return isString(value) && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isDateLike(value) {
  return isString(value) && /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)?$/.test(value);
}

function checkRelativePath(value, label) {
  if (!isString(value)) {
    fail(`${label} : chemin absent`);
    return false;
  }
  if (/^[a-z]+:\/\//i.test(value) || value.startsWith("/") || value.includes("..") || value.includes("\\")) {
    fail(`${label} : chemin interne attendu, valeur ${value}`);
    return false;
  }
  return true;
}

const registryFile = "demos/demos.json";
let registry;
try {
  registry = JSON.parse(read(registryFile));
} catch (error) {
  console.error(`verify-registry : ${registryFile} illisible (${error.message})`);
  process.exit(1);
}

if (!isDate(registry.mise_a_jour)) {
  fail(`${registryFile} : mise_a_jour absente ou invalide`);
}

const demos = Array.isArray(registry.demos) ? registry.demos : null;
if (!demos) {
  fail(`${registryFile} : tableau demos absent`);
}

const slugs = new Set();
const rapports = new Set();
const typeCount = { demo: 0, test: 0 };

for (const [index, entry] of (demos || []).entries()) {
  const name = isString(entry.slug) ? entry.slug : `entrée ${index + 1}`;
  const type = entry.type || "demo";
  if (type !== "demo" && type !== "test") {
    fail(`${name} : type inconnu ${type}`);
    continue;
  }
  typeCount[type] += 1;

  for (const key of ["slug", "titre", "date_ajout", "statut"]) {
    if (!isString(entry[key])) fail(`${name} : champ ${key} absent`);
  }
  if (!isString(entry.type)) fail(`${name} : champ type absent`);
  if (isString(entry.slug)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)) {
      fail(`${name} : slug invalide, minuscules et traits d’union attendus`);
    }
    if (slugs.has(entry.slug)) fail(`${name} : slug en double`);
    slugs.add(entry.slug);
  }
  if (!isDate(entry.date_ajout)) fail(`${name} : date_ajout invalide`);

  if (entry.tags !== undefined) {
    if (!Array.isArray(entry.tags) || entry.tags.some((tag) => !isString(tag))) {
      fail(`${name} : tags doit être un tableau de chaînes`);
    }
  }
  for (const key of ["licence", "credits", "resume_test"]) {
    if (entry[key] !== undefined && !isString(entry[key])) {
      fail(`${name} : champ ${key} vide ou invalide`);
    }
  }
  if (entry.source_commit !== undefined && (!isString(entry.source_commit) || !/^[0-9a-f]{7,40}$/.test(entry.source_commit))) {
    fail(`${name} : source_commit doit être un SHA hexadécimal de 7 à 40 caractères`);
  }
  if (entry.synced_at !== undefined && !isDateLike(entry.synced_at)) {
    fail(`${name} : synced_at invalide`);
  }

  if (type === "demo") {
    if (!isString(entry.resume)) fail(`${name} : resume absent`);
    if (!isString(entry.source) || !/^https:\/\//.test(entry.source)) {
      fail(`${name} : source https absente`);
    }
    if (!exists(`demos/${entry.slug}/index.html`)) {
      fail(`${name} : demos/${entry.slug}/index.html absent`);
    }
    if (entry.documentation !== undefined && checkRelativePath(entry.documentation, `${name} : documentation`)) {
      if (!exists(`demos/${entry.slug}/${entry.documentation}`)) {
        fail(`${name} : documentation demos/${entry.slug}/${entry.documentation} absente`);
      }
    }
    if (entry.capture !== undefined && checkRelativePath(entry.capture, `${name} : capture`)) {
      if (!exists(`demos/${entry.slug}/${entry.capture}`)) {
        fail(`${name} : capture demos/${entry.slug}/${entry.capture} absente`);
      }
    }
    if (exists(`demos/${entry.slug}/version.json`)) {
      try {
        const version = JSON.parse(read(`demos/${entry.slug}/version.json`));
        if (version.slug !== entry.slug) fail(`${name} : version.json porte le slug ${version.slug}`);
        if (entry.source && version.source !== entry.source) {
          fail(`${name} : version.json porte la source ${version.source}`);
        }
        if (!isString(version.source_commit)) fail(`${name} : version.json sans source_commit`);
        if (!isDateLike(version.synced_at)) fail(`${name} : version.json sans synced_at valide`);
      } catch (error) {
        fail(`${name} : version.json illisible (${error.message})`);
      }
    }
  }

  if (type === "test") {
    if (!isString(entry.resume) && !isString(entry.resume_test)) {
      fail(`${name} : resume ou resume_test absent`);
    }
    if (!isString(entry.rapport)) fail(`${name} : rapport absent pour une entrée de test`);
  }

  if (entry.rapport !== undefined) {
    if (!isString(entry.rapport) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.rapport)) {
      fail(`${name} : rapport invalide`);
    } else {
      if (rapports.has(entry.rapport)) fail(`${name} : rapport en double`);
      rapports.add(entry.rapport);
      if (!exists(`tests/${entry.rapport}/index.html`)) {
        fail(`${name} : tests/${entry.rapport}/index.html absent`);
      }
    }
  }
}

infos.push(`${(demos || []).length} entrées, ${typeCount.demo} démo(s), ${typeCount.test} test(s)`);

for (const line of infos) console.log(`i ${line}`);
if (errors.length) {
  console.error(`\n${errors.length} problème(s) :`);
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}
console.log("verify-registry OK");
