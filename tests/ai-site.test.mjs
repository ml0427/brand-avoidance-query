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

function pageLinks(bytes) {
  return [...bytes.toString("utf8").matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gu)]
    .map((match) => ({ href: match[1].replaceAll("&amp;", "&"), text: match[2].replace(/<[^>]*>/gu, "").trim() }));
}

function linkedFile(from, href) {
  return decodeURIComponent(new URL(href, `https://site.invalid/${from}`).pathname.slice(1));
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

test("browser catalog routes by visible first character and retains every same-name record", () => {
  const records = [
    sample("wen-one", { name: "文姿雲", aliases: ["Wen Tzu-yun"] }),
    sample("wen-two", { name: "文姿雲", aliases: ["Different Entity"] }),
  ];
  const site = generateSite({ records });
  const root = site.manifest.catalog.url;
  const firstCharacter = pageLinks(site.files.get(root)).find((link) => link.text === "文");
  assert(firstCharacter, "root catalog exposes the literal first character, not a range");
  const group = linkedFile(root, firstCharacter.href);
  const matches = pageLinks(site.files.get(group)).filter((link) => link.text === "文姿雲");
  assert.deepEqual(matches.map((link) => linkedFile(group, link.href)).sort(), [
    `${site.manifest.recordBase}wen-one.html`, `${site.manifest.recordBase}wen-two.html`,
  ]);
  assert(!site.files.get(root).toString().includes("至"));
  assert(!site.files.has(root.replace("index.html", "0000.html")), "no retired numbered HTML shard");
});

test("HTML catalog and JSON index are independent views of the same identity keys", () => {
  const records = [sample("wen", { name: "文姿雲", aliases: ["Wen Tzu-yun"], identifiers: ["公開帳號：@wen"] })];
  const site = generateSite({ records });
  const root = site.manifest.catalog.url;
  const rootLinks = pageLinks(site.files.get(root));
  assert(rootLinks.some((link) => link.text === "文"));
  assert(rootLinks.some((link) => link.text === "W"));
  assert(rootLinks.some((link) => link.text === "@"));
  const entries = site.manifest.indexes.flatMap((shard) => JSON.parse(site.files.get(shard.url)).entries);
  assert.deepEqual(entries.map(({ key }) => key), ["@wen", "wen tzu-yun", "文姿雲"]);
  for (const [file, bytes] of site.files) {
    if (file.includes("/catalog/")) {
      assert(bytes.length <= 65536, file);
      assert(!/<script\b/iu.test(bytes.toString("utf8")), file);
      for (const link of pageLinks(bytes)) {
        if (!/^https?:/u.test(link.href)) assert(site.files.has(linkedFile(file, link.href)), `${file}: ${link.href}`);
      }
    }
  }
});

test("browser catalog groups same-initial aliases into one canonical record link", () => {
  const site = generateSite({ records: [sample("wen-alias", { name: "文姿云 / Wen Tzu-Yun", aliases: ["文姿雲"] })] });
  const root = site.manifest.catalog.url;
  const initial = pageLinks(site.files.get(root)).find((link) => link.text === "文");
  const group = linkedFile(root, initial.href);
  const recordLinks = pageLinks(site.files.get(group)).filter((link) => linkedFile(group, link.href) === `${site.manifest.recordBase}wen-alias.html`);
  assert.equal(recordLinks.length, 1);
  assert.equal(recordLinks[0].text, "文姿云 / Wen Tzu-Yun");
  assert(site.files.get(group).toString().includes("文姿云 / Wen Tzu-Yun"));
  const fullRecord = JSON.parse(site.files.get(`${site.manifest.recordBase}wen-alias.json`)).record;
  assert.deepEqual(fullRecord.aliases, ["文姿雲"]);
});

test("title wrappers affect only HTML routing, not exact identity lookup or complete records", () => {
  const record = sample("wrapped-title", { name: "《陽光女子合唱團》", aliases: [], identifiers: [] });
  const site = generateSite({ records: [record] });
  const root = site.manifest.catalog.url;
  const rootLinks = pageLinks(site.files.get(root));
  assert(!rootLinks.some((link) => link.text === "《"));
  const initial = rootLinks.find((link) => link.text === "陽");
  assert(initial);
  const group = linkedFile(root, initial.href);
  const title = pageLinks(site.files.get(group)).find((link) => link.text === record.name);
  assert(title);
  assert.equal(linkedFile(group, title.href), `${site.manifest.recordBase}wrapped-title.html`);
  const entries = site.manifest.indexes.flatMap((shard) => JSON.parse(site.files.get(shard.url)).entries);
  assert.deepEqual(entries.map(({ key }) => key), [record.name]);
  assert.deepEqual(JSON.parse(site.files.get(`${site.manifest.recordBase}wrapped-title.json`)).record, record);
  assert.equal(matchRecords([record], record.name).length, 1);
  assert.equal(matchRecords([record], "陽光女子合唱團").length, 0);
});
