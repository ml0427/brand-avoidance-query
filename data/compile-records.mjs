import { Buffer } from "node:buffer";

import { mergeCleanupMetadata, normalizeCategories } from "./record-helpers.mjs";
import { broadCategoryOverrides, recordCleanups } from "./record-overrides.mjs";
import { riskRecords } from "./records/index.mjs";

const SAFE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const WINDOWS_DEVICE_ID = /^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$/u;

function assertRecordIds(records) {
  const seen = new Set();

  for (const [index, record] of records.entries()) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new TypeError(`Record at index ${index} must be an object`);
    }

    const { id } = record;
    if (typeof id !== "string" || !SAFE_ID.test(id) || WINDOWS_DEVICE_ID.test(id)) {
      throw new TypeError(`Unsafe record ID at index ${index}: ${JSON.stringify(id)}`);
    }
    if (seen.has(id)) {
      throw new Error(`Duplicate record ID: ${id}`);
    }
    seen.add(id);
  }
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))];
}

export function compileRecords({
  records = riskRecords,
  cleanups = recordCleanups,
  categoryOverrides = broadCategoryOverrides,
} = {}) {
  if (!Array.isArray(records)) {
    throw new TypeError("records must be an array");
  }
  assertRecordIds(records);

  const compiled = records.map((item) => {
    const cleanup = cleanups.get(item.id);
    const categories = normalizeCategories(categoryOverrides.get(item.id) ?? item.categories);
    if (!cleanup) {
      return { ...item, categories };
    }

    const removeAliases = new Set(cleanup.removeAliases ?? []);
    const removeIdentifiers = new Set(cleanup.removeIdentifiers ?? []);
    const metadata = mergeCleanupMetadata(item, cleanup);

    return {
      ...item,
      aliases: uniqueStrings([
        ...(item.aliases ?? []).filter((alias) => !removeAliases.has(alias)),
        ...(cleanup.addAliases ?? []),
      ]),
      identifiers: uniqueStrings([
        ...(item.identifiers ?? []).filter((identifier) => !removeIdentifiers.has(identifier)),
        ...(cleanup.identifiers ?? []),
      ]),
      categories,
      sources: metadata.sources,
      summary: cleanup.summary ?? item.summary,
      aiNotes: metadata.aiNotes,
      lastReviewed: metadata.lastReviewed,
    };
  });

  // Detach nested source/override values and omit undefined helper properties.
  const plainRecords = JSON.parse(JSON.stringify(compiled));
  assertRecordIds(plainRecords);
  return plainRecords.sort((left, right) => Buffer.compare(Buffer.from(left.id, "utf8"), Buffer.from(right.id, "utf8")));
}
