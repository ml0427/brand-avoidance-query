import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import { compileRecords } from "../data/compile-records.mjs";
import { broadCategoryOverrides, recordCleanups } from "../data/record-overrides.mjs";
import { records as baselineRecords } from "../data/records/baseline-records.mjs";
import { riskRecords } from "../data/records/index.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const utf8Compare = (left, right) => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

function compileOnly(records, options = {}) {
  return compileRecords({ records, cleanups: new Map(), categoryOverrides: new Map(), ...options });
}

test("all source IDs are represented exactly once and the outer list is UTF-8 sorted", () => {
  const records = compileRecords();
  assert.equal(records.length, riskRecords.length);
  assert.equal(new Set(records.map(({ id }) => id)).size, records.length);
  assert.deepEqual(new Set(records.map(({ id }) => id)), new Set(riskRecords.map(({ id }) => id)));
  assert.deepEqual(records.map(({ id }) => id), records.map(({ id }) => id).sort(utf8Compare));
});

test("the six restored baseline records are present in the sole source list", () => {
  const expectedIds = [
    "weichuan-foods",
    "tacoop-taiwan-agricultural-united-marketing-cooperative",
    "shye-chuen-seafood",
    "nantou-county-farmers-association",
    "tianwei-agricultural-technology",
    "hualien-county-farmers-association",
  ];
  assert.deepEqual(baselineRecords.map(({ id }) => id), expectedIds);
  for (const record of baselineRecords) {
    assert.equal(riskRecords.filter(({ id }) => id === record.id).length, 1);
    assert.ok(riskRecords.includes(record));
  }
});

test("compilation is JSON-plain, deterministic, detached and does not mutate real sources or overrides", () => {
  const snapshot = JSON.stringify([riskRecords, [...recordCleanups], [...broadCategoryOverrides]]);
  deepFreeze(riskRecords);
  for (const cleanup of recordCleanups.values()) {
    deepFreeze(cleanup);
  }
  for (const categories of broadCategoryOverrides.values()) {
    deepFreeze(categories);
  }

  const first = compileRecords();
  const second = compileRecords();
  assert.deepEqual(first, second);
  assert.deepEqual(first, JSON.parse(JSON.stringify(first)));
  first[0].sources.push({ title: "Output-only mutation" });
  first[0].categories.push("Output-only category");
  assert.equal(JSON.stringify([riskRecords, [...recordCleanups], [...broadCategoryOverrides]]), snapshot);
  assert.deepEqual(compileRecords(), second);
});

test("cleanup preserves metadata while applying existing replacement, append, deduplication and category rules", () => {
  const originalSource = { title: "Original", url: "https://example.com/a", note: "Original limit" };
  const addedSource = { title: "Added", url: "", note: "Intake only" };
  const records = deepFreeze([{
    id: "metadata-fixture",
    name: "Fixture",
    aliases: ["removed", " second ", "first", "first"],
    identifiers: ["removed-id", "kept-id"],
    categories: ["Original category"],
    sources: [originalSource],
    summary: "Original summary",
    aiNotes: "Original caveat",
    lastReviewed: "2026-01-01",
    temporaryUntil: "2026-11-01",
    reviewAfter: "2026-10-31",
    temporaryAlertReason: "Specific lot only",
    scope: { limits: ["second", "first"], unknownFutureField: true },
    omitted: undefined,
  }]);
  const cleanup = deepFreeze({
    removeAliases: ["removed"],
    addAliases: ["first", "third"],
    removeIdentifiers: ["removed-id"],
    identifiers: ["kept-id", "added-id"],
    addSources: [originalSource, addedSource, addedSource],
    summary: "Replacement summary",
    appendAiNotes: "Additional caveat",
    lastReviewed: "2026-10-28",
  });
  const cleanups = new Map([["metadata-fixture", cleanup]]);
  const categoryOverrides = new Map([["metadata-fixture", ["食品／飲料／農水產", "食品飲料", "Other"]]]);
  const [compiled] = compileRecords({ records, cleanups, categoryOverrides });
  assert.deepEqual(compiled.aliases, ["second", "first", "third"]);
  assert.deepEqual(compiled.identifiers, ["kept-id", "added-id"]);
  assert.deepEqual(compiled.categories, ["食品飲料", "Other"]);
  assert.deepEqual(compiled.sources, [originalSource, addedSource]);
  assert.equal(compiled.summary, "Replacement summary");
  assert.equal(compiled.aiNotes, "Original caveat Additional caveat");
  assert.equal(compiled.lastReviewed, "2026-10-28");
  assert.equal(compiled.temporaryUntil, records[0].temporaryUntil);
  assert.equal(compiled.reviewAfter, records[0].reviewAfter);
  assert.equal(compiled.temporaryAlertReason, records[0].temporaryAlertReason);
  assert.deepEqual(compiled.scope, records[0].scope);
  assert.ok(!Object.hasOwn(compiled, "omitted"));
  assert.notEqual(compiled.scope, records[0].scope);
  assert.notEqual(compiled.sources[0], originalSource);

  const replacement = compileRecords({
    records,
    cleanups: new Map([["metadata-fixture", {
      sources: [addedSource], addSources: [addedSource, originalSource], aiNotes: "Replaced caveat", appendAiNotes: "Replaced caveat",
    }]]),
    categoryOverrides: new Map(),
  });
  assert.deepEqual(replacement[0].sources, [addedSource, originalSource]);
  assert.equal(replacement[0].aiNotes, "Replaced caveat");
});

test("outer records are UTF-8 ID sorted without sorting internal arrays or injecting absent metadata", () => {
  const records = deepFreeze([
    { id: "z-record", categories: ["Second", "First"], aliases: ["z", "a"], sources: [{ note: "z" }, { note: "a" }] },
    { id: "a-record", categories: ["牙刷", "牙膏", "Other"] },
    { id: "a-0-record", categories: [] },
  ]);
  const compiled = compileOnly(records);
  assert.deepEqual(compiled.map(({ id }) => id), ["a-0-record", "a-record", "z-record"]);
  assert.deepEqual(compiled[1].categories, ["口腔用品", "Other"]);
  assert.deepEqual(compiled[2], records[0]);
  assert.ok(!Object.hasOwn(compiled[1], "aiNotes"));
});

test("deletions and renames come only from the supplied source records", () => {
  const records = [{ id: "only-source", categories: [] }];
  assert.deepEqual(compileOnly(records).map(({ id }) => id), ["only-source"]);
  assert.deepEqual(compileOnly([]), []);
  assert.deepEqual(compileOnly([{ ...records[0], id: "renamed-source" }]).map(({ id }) => id), ["renamed-source"]);
});

test("duplicate IDs fail before any record could be overwritten", () => {
  assert.throws(() => compileOnly([{ id: "duplicate" }, { id: "duplicate" }]), /Duplicate record ID: duplicate/u);
});

test("unsafe, implicit and Windows device IDs are rejected rather than normalized", () => {
  for (const id of [undefined, null, 1, "", "../escape", "a/b", "a\\b", "a..b", "a%2fb", "UPPER", "a\n", " leading", "con", "nul", "com1", "lpt9", "__proto__"]) {
    assert.throws(() => compileOnly([{ id }]), /Unsafe record ID/u, `ID: ${JSON.stringify(id)}`);
  }
  for (const record of [null, undefined, [], "record"]) {
    assert.throws(() => compileOnly([record]), /must be an object/u);
  }
  assert.throws(() => compileRecords({ records: {} }), /must be an array/u);
});

test("source-only compilation works without retired files and never consults the execution clock", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "brand-compile-source-only-"));
  try {
    fs.cpSync(path.join(rootDir, "data"), path.join(tempDir, "data"), { recursive: true });
    assert.ok(!fs.existsSync(path.join(tempDir, "brands.json")));
    assert.ok(!fs.existsSync(path.join(tempDir, "scripts")));
    const result = spawnSync(process.execPath, ["--input-type=module", "--eval", `
      import assert from "node:assert/strict";
      globalThis.Date = class {
        constructor() { throw new Error("Compiler must not use the clock"); }
        static now() { throw new Error("Compiler must not use the clock"); }
      };
      const { compileRecords } = await import(process.argv[1]);
      const records = compileRecords();
      assert.equal(records.length, ${riskRecords.length});
      assert.deepEqual(records, compileRecords());
      console.log("source-only deterministic compilation passed");
    `, pathToFileURL(path.join(tempDir, "data", "compile-records.mjs")).href], { cwd: tempDir, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /source-only deterministic compilation passed/u);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
