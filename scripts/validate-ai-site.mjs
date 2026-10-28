import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";
import { compileRecords } from "../data/compile-records.mjs";
import { generateSite, loadEvidence } from "./build-ai-site.mjs";
import { ROOT, SHARD_LIMIT, compareUtf8, sha256, safeRelativePath, schemaValidators } from "./lib/site-format.mjs";

export function siteFiles(directory, prefix = "") {
  const files = [];
  if (fs.lstatSync(directory).isSymbolicLink()) throw new Error("Site root cannot be a symlink");
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Site symlink: ${relative}`);
    if (entry.isDirectory()) files.push(...siteFiles(path.join(directory, entry.name), `${relative}/`));
    else if (entry.isFile()) files.push(safeRelativePath(relative));
    else throw new Error(`Unsupported site entry: ${relative}`);
  }
  return files.sort(compareUtf8);
}

function checkLinks(file, bytes, knownFiles, errors) {
  if (!file.endsWith(".html") && !file.endsWith(".txt")) return;
  const text = bytes.toString("utf8");
  const links = file.endsWith(".html")
    ? [...text.matchAll(/(?:href|src)="([^"]+)"/gu)].map((match) => match[1].replaceAll("&amp;", "&"))
    : [...text.matchAll(/\[[^\]]*\]\(([^)]+)\)/gu)].map((match) => match[1]);
  for (const value of links) {
    if (/^https?:\/\//iu.test(value)) continue;
    const url = new URL(value, `https://site.invalid/project/${file}`);
    const local = decodeURIComponent(url.pathname.slice("/project/".length));
    if (url.origin !== "https://site.invalid" || !url.pathname.startsWith("/project/") || !knownFiles.has(local)) errors.push(`Broken or unsafe link in ${file}: ${value}`);
  }
  if (file.endsWith(".html") && (!text.includes('<html lang="zh-Hant">') || !text.includes('<meta charset="utf-8">') || /<script\b/iu.test(text))) errors.push(`Invalid static HTML template: ${file}`);
}

export function validateSite({ siteDir = path.join(ROOT, "_site"), records = compileRecords(), evidenceFiles = loadEvidence(records), requireClean = Boolean(process.env.CI) } = {}) {
  const errors = [];
  const warnings = [];
  let manifest;
  let fileCount = 0;
  try {
    const validators = schemaValidators();
    manifest = JSON.parse(fs.readFileSync(path.join(siteDir, "manifest.json"), "utf8"));
    if (!validators.manifest(manifest)) throw new Error(`Manifest schema: ${JSON.stringify(validators.manifest.errors)}`);
    if (requireClean && manifest.sourceDirty) throw new Error("Production artifact has uncommitted source changes");
    if (process.env.GITHUB_SHA && requireClean && manifest.sourceCommit !== process.env.GITHUB_SHA) throw new Error("Artifact commit differs from workflow commit");
    const prefix = `v1/${manifest.dataVersion}/`;
    const read = (file) => fs.readFileSync(path.join(siteDir, safeRelativePath(file)));
    const verify = (item) => {
      if (!item.url.startsWith(prefix)) throw new Error(`Artifact outside the selected version: ${item.url}`);
      const bytes = read(item.url);
      if (bytes.length !== item.bytes || sha256(bytes) !== item.sha256) throw new Error(`Checksum or byte length mismatch: ${item.url}`);
      return bytes;
    };
    const inventoryBytes = verify(manifest.inventory);
    if (sha256(inventoryBytes) !== manifest.dataVersion) throw new Error("Version differs from inventory hash");
    const inventory = JSON.parse(inventoryBytes);
    if (!validators.inventory(inventory)) throw new Error(`Inventory schema: ${JSON.stringify(validators.inventory.errors)}`);
    const paths = new Set();
    let previousPath = "";
    for (const file of inventory.files) {
      safeRelativePath(file.path);
      if (file.path === "inventory.json" || paths.has(file.path) || (previousPath && compareUtf8(previousPath, file.path) >= 0)) throw new Error("Duplicate or unordered inventory path");
      paths.add(file.path);
      previousPath = file.path;
      const bytes = read(`${prefix}${file.path}`);
      if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256) throw new Error(`Inventory file mismatch: ${file.path}`);
      const type = file.path.startsWith("records/") && file.path.endsWith(".json") ? "record" : file.path.startsWith("index/") ? "index" : null;
      if (type && !validators[type](JSON.parse(bytes))) throw new Error(`${type} schema: ${file.path}: ${JSON.stringify(validators[type].errors)}`);
    }
    let previousKey = null;
    for (const shard of manifest.indexes) {
      const bytes = verify(shard);
      if (bytes.length > SHARD_LIMIT) throw new Error("Oversized index shard");
      const data = JSON.parse(bytes);
      if (!validators.index(data)) throw new Error("Invalid index shard schema");
      if (data.entries.length !== shard.entryCount || data.entries[0].key !== shard.firstKey || data.entries.at(-1).key !== shard.lastKey) throw new Error("Index range metadata mismatch");
      for (const entry of data.entries) {
        if (previousKey !== null && compareUtf8(previousKey, entry.key) >= 0) throw new Error("Overlapping or unordered index keys");
        previousKey = entry.key;
      }
    }
    const actualFiles = siteFiles(siteDir);
    fileCount = actualFiles.length;
    const expected = generateSite({ records, evidenceFiles, sourceCommit: manifest.sourceCommit, sourceCommitTime: manifest.sourceCommitTime, sourceDirty: manifest.sourceDirty });
    if (!isDeepStrictEqual(actualFiles, [...expected.files.keys()].sort(compareUtf8))) throw new Error("Published file allowlist differs from the source-generated site");
    const knownFiles = new Set(actualFiles);
    for (const [file, expectedBytes] of expected.files) {
      const bytes = read(file);
      if (!bytes.equals(expectedBytes)) errors.push(`Source/output parity failed: ${file}`);
      checkLinks(file, bytes, knownFiles, errors);
    }
    if (manifest.recordCount !== records.length) errors.push("Source and manifest counts differ");
  } catch (error) {
    errors.push(error.message);
  }
  return { ok: !errors.length && !warnings.length, records: manifest?.recordCount ?? 0, files: fileCount, warnings, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = validateSite();
  console.log(`AI site validation: ${result.ok ? "PASS" : "FAIL"}; records: ${result.records}; files: ${result.files}; warnings: ${result.warnings.length}; errors: ${result.errors.length}`);
  for (const error of result.errors) console.error(error);
  process.exitCode = result.ok ? 0 : 1;
}
