import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { generateSite, partitionEntries, sourceLinksFor, loadEvidence } from "../scripts/build-ai-site.mjs";
import { validateSite } from "../scripts/validate-ai-site.mjs";
import { jsonBytes, sha256, SHARD_LIMIT } from "../scripts/lib/site-format.mjs";
import { identityTerms, matchRecords } from "../app-core.mjs";

const sample = (id = "sample", extra = {}) => ({ id, name: "示例茶飲", aliases: ["Example Tea"], identifiers: ["條碼：4710000000000", "https://example.test:8443/shop"], country: "中國", categories: ["食品飲料"], avoidReasons: ["個人選擇"], confidence: "low", status: "personal", summary: "只限此紀錄。", aiNotes: "不可擴及其他產品。", sources: [{ title: "聲明", url: "https://example.test/statement", date: "2026-10-28", note: "不是法律定論" }], lastReviewed: "2026-10-28", ...extra });

function materialize(site) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "brand-ai-site-"));
  for (const [file, bytes] of site.files) {
    const target = path.join(directory, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  }
  return directory;
}

test("identity lookup excludes country, source text and cross-field substrings", () => {
  const record = sample();
  assert.equal(matchRecords([record], "中國").length, 0);
  assert.equal(matchRecords([record], "不是法律定論").length, 0);
  assert.equal(matchRecords([record], "example tea").length, 1);
  assert.equal(matchRecords([record], "Example").length, 0);
  assert.equal(matchRecords([record], "Example", { mode: "partial" }).length, 1);
  assert(identityTerms(record).some((term) => term.key === "4710000000000"));
  assert(identityTerms(record).some((term) => term.key === "https://example.test:8443/shop"));
});

test("site is deterministic, complete and contains no legacy endpoints", () => {
  const records = [sample()];
  const first = generateSite({ records });
  const second = generateSite({ records, sourceCommit: "a".repeat(40), sourceCommitTime: "2027-01-01T00:00:00Z" });
  assert.equal(first.manifest.dataVersion, second.manifest.dataVersion);
  assert(!first.files.has("brands.json"));
  assert(!("compatibilityUrl" in first.manifest));
  const recordPath = `${first.manifest.recordBase}sample.json`;
  assert.deepEqual(JSON.parse(first.files.get(recordPath)).record, records[0]);
  assert.equal(first.manifest.dataVersion, sha256(first.files.get(first.manifest.inventory.url)));
});

test("name collisions retain every record and duplicate IDs fail", () => {
  const site = generateSite({ records: [sample("a"), sample("b")] });
  const entries = site.manifest.indexes.flatMap((shard) => JSON.parse(site.files.get(shard.url)).entries);
  assert.equal(entries.find((entry) => entry.key === "example tea").matches.length, 2);
  assert.throws(() => generateSite({ records: [sample(), sample()] }), /Duplicate/);
});

test("index keys normalize whitespace while matched values retain exact source strings", () => {
  const record = sample("whitespace", { name: "  Alpha  Tea  ", aliases: ["A  Tea", "  Another Tea  "] });
  const site = generateSite({ records: [record] });
  const entries = site.manifest.indexes.flatMap((shard) => JSON.parse(site.files.get(shard.url)).entries);
  const byKey = new Map(entries.map((entry) => [entry.key, entry]));
  assert.equal(byKey.get("alpha tea").matches[0].value, record.name);
  assert.equal(byKey.get("alpha tea").matches[0].name, record.name);
  assert.equal(byKey.get("a tea").matches[0].value, record.aliases[0]);
  assert.equal(byKey.get("another tea").matches[0].value, record.aliases[1]);
  assert.equal(matchRecords([record], "alpha tea")[0].matchedTerms[0].value, record.name);
  assert.equal(matchRecords([record], "alpha", { mode: "partial" })[0].matchedTerms[0].value, record.name);
});

test("bounded shards preserve whole keys and reject oversized entries", () => {
  const entries = Array.from({ length: 200 }, (_, i) => ({ key: String(i).padStart(5, "0"), matches: [{ value: "x".repeat(200) }] }));
  const shards = partitionEntries(entries, 2000);
  assert(shards.length > 1);
  assert.deepEqual(shards.flat(), entries);
  assert(shards.every((entries) => jsonBytes({ schemaVersion: 1, entries }).length <= 2000));
  assert.throws(() => partitionEntries([{ key: "x", matches: ["x".repeat(SHARD_LIMIT)] }]), /exceeds/);
});

test("HTML escapes source content and keeps complete restrictions and dates", () => {
  const record = sample("unsafe", { name: '<script>alert("x")</script>', aiNotes: "A & B < C", temporaryUntil: "2026-10-28", reviewAfter: "2026-10-29", temporaryAlertReason: "單一批次" });
  const site = generateSite({ records: [record] });
  const page = site.files.get(`${site.manifest.recordBase}unsafe.html`).toString();
  assert(!page.includes("<script>"));
  assert(page.includes("&lt;script&gt;"));
  assert(page.includes("A &amp; B &lt; C"));
  assert(page.includes('<time datetime="2026-10-28">'));
  assert(!page.includes('"temporaryExpired":'));
});

test("evidence requires explicit approval and safe paths", () => {
  const record = sample("evidence", { sources: [{ title: "label", url: "evidence/a.png", date: "", note: "" }] });
  assert.throws(() => generateSite({ records: [record] }), /Unapproved/);
  const evidenceFiles = new Map([["evidence/a.png", Buffer.from("png")]]);
  assert.equal(sourceLinksFor(record, evidenceFiles)[0].url, "../evidence/a.png");
  assert.throws(() => sourceLinksFor(sample("unsafe", { sources: [{ url: "javascript:alert(1)" }] }), evidenceFiles), /Unsafe|Unapproved/);
  assert.throws(() => loadEvidence([record], { policy: { schemaVersion: 1, files: [] }, requireTracked: false }), /not approved/);
});

test("published validator checks schema, parity, links and unexpected files", () => {
  const records = [sample()];
  const site = generateSite({ records });
  const siteDir = materialize(site);
  try {
    const valid = validateSite({ siteDir, records, evidenceFiles: new Map(), requireClean: false });
    assert.deepEqual(valid.errors, []);
    fs.writeFileSync(path.join(siteDir, "brands.json"), "[]");
    assert.equal(validateSite({ siteDir, records, evidenceFiles: new Map() }).ok, false);
    fs.unlinkSync(path.join(siteDir, "brands.json"));
    fs.appendFileSync(path.join(siteDir, site.manifest.indexes[0].url), " ");
    assert.equal(validateSite({ siteDir, records, evidenceFiles: new Map() }).ok, false);
  } finally {
    assert(siteDir.startsWith(path.join(os.tmpdir(), "brand-ai-site-")));
    fs.rmSync(siteDir, { recursive: true, force: true });
  }
});

test("source deletions and changes do not revive prior records", () => {
  const previous = generateSite({ records: [sample("a"), sample("b")] });
  const current = generateSite({ records: [sample("b", { name: "已修改" })] });
  assert.notEqual(previous.manifest.dataVersion, current.manifest.dataVersion);
  assert.equal(current.manifest.recordCount, 1);
  assert(!current.files.has(`${current.manifest.recordBase}a.json`));
});
