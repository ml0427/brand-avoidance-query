import assert from "node:assert/strict";
import test from "node:test";
import { splitRecord } from "../data/split-record.mjs";
import { compileRecords } from "../data/compile-records.mjs";
import { matchRecords } from "../app-core.mjs";

const group = {
  id: "group-fixture", name: "Group", aliases: ["First", "Second"], identifiers: ["group-only"],
  country: "", categories: [], avoidReasons: ["Personal choice"], status: "personal", confidence: "low",
  summary: "Group-wide context, not each member's allegation", sources: [], aiNotes: "Shared limits",
  lastReviewed: "2026-01-01", temporaryUntil: "2026-02-01", reviewAfter: "2026-02-01",
  temporaryAlertReason: "Specific batch only",
};
const members = [
  { name: "First", aliases: ["First alias"], summary: "First scope" },
  { name: "Second", identifiers: ["SKU-2"], summary: "Second scope", sources: [{ title: "Second source", url: "", date: "", note: "Second only" }], aiNotes: "Second limits" },
];

test("explicit members have isolated keys and summaries while retaining chosen common metadata", () => {
  const before = JSON.stringify([group, members]);
  const records = compileRecords({ records: splitRecord(group, members), cleanups: new Map(), categoryOverrides: new Map() });
  assert.equal(records.length, 2);
  for (const [query, expected] of [["First", "First"], ["First alias", "First"], ["Second", "Second"], ["SKU-2", "Second"]]) {
    assert.deepEqual(matchRecords(records, query).map(({ record }) => record.name), [expected]);
  }
  assert.equal(matchRecords(records, "Group").length, 0);
  assert.equal(matchRecords(records, "group-only").length, 0);
  for (const item of records) {
    assert.equal(item.lastReviewed, group.lastReviewed);
    assert.equal(item.temporaryUntil, group.temporaryUntil);
    assert.equal(item.reviewAfter, group.reviewAfter);
    assert.equal(item.temporaryAlertReason, group.temporaryAlertReason);
    assert(!item.summary.includes(group.summary));
  }
  assert.equal(records.find(({ name }) => name === "Second").sources[0].title, "Second source");
  assert(!records.find(({ name }) => name === "Second").aiNotes.includes("Shared limits"));
  records[0].sources.push({ title: "Detached" });
  assert.equal(JSON.stringify([group, members]), before);
});

test("split IDs are independent of member order, with explicit IDs allowed", () => {
  const first = splitRecord(group, members);
  const reversed = splitRecord(group, [...members].reverse());
  assert.deepEqual(first.map(({ id }) => id), reversed.map(({ id }) => id).reverse());
  assert.equal(splitRecord(group, [{ ...members[0], id: "known-individual" }, members[1]])[0].id, "known-individual");
});

test("splits reject missing scoped summaries and duplicate members rather than copying group claims", () => {
  assert.throws(() => splitRecord(group, []), /at least two/u);
  assert.throws(() => splitRecord(group, [{ name: "First" }, members[1]]), /scoped summary/u);
  assert.throws(() => splitRecord(group, [members[0], members[0]]), /Duplicate split member ID/u);
  assert.throws(() => splitRecord(group, [{ ...members[0], avoidReasons: undefined }, members[1]]), /Undefined avoidReasons/u);
});
