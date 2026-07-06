import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeCategories } from "../data/record-helpers.mjs";
import { broadCategoryOverrides, recordCleanups } from "../data/record-overrides.mjs";
import { riskRecords } from "../data/records/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(rootDir, "brands.json");

function uniqueStrings(values) {
  return [...new Set((values ?? []).filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))];
}

function applyRecordCleanup(item) {
  const cleanup = recordCleanups.get(item.id);

  if (!cleanup) {
    return item;
  }

  const removeAliases = new Set(cleanup.removeAliases ?? []);
  const removeIdentifiers = new Set(cleanup.removeIdentifiers ?? []);
  const aliases = uniqueStrings([...(item.aliases ?? []).filter((alias) => !removeAliases.has(alias)), ...(cleanup.addAliases ?? [])]);

  return {
    ...item,
    aliases,
    identifiers: uniqueStrings([
      ...(item.identifiers ?? []).filter((identifier) => !removeIdentifiers.has(identifier)),
      ...(cleanup.identifiers ?? []),
    ]),
    categories: normalizeCategories(broadCategoryOverrides.get(item.id) ?? item.categories),
    summary: cleanup.summary ?? item.summary,
    aiNotes: cleanup.aiNotes ?? item.aiNotes,
  };
}

function applyBroadCategory(item) {
  return {
    ...item,
    categories: normalizeCategories(broadCategoryOverrides.get(item.id) ?? item.categories),
  };
}

const originalRecords = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const byId = new Map(originalRecords.map((item) => [item.id, item]));

for (const item of riskRecords) {
  byId.set(item.id, item);
}

const merged = [...byId.values()].map(applyRecordCleanup).map(applyBroadCategory);
fs.writeFileSync(dataPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

console.log(`merged ${riskRecords.length} risk records; total ${merged.length} records`);
