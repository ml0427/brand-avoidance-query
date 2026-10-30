import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { generateSite, escapeHtml, sourceLinksFor } from "../scripts/build-ai-site.mjs";
import { validateSite } from "../scripts/validate-ai-site.mjs";
import { jsonBytes, sha256 } from "../scripts/lib/site-format.mjs";

const ROOT = "judicial/index.html";
const CATEGORIES = ["司法／人物案件", "司法／企業案件", "司法／公眾人物"];
const NOTICE = "司法相關分類不代表全是被告、有罪或定讞；具體角色及最新已核程序請讀完整紀錄；舊紀錄不是本輪新複查完成。";
const sample = (id, extra = {}) => ({
  id, name: "同名人物", aliases: [], identifiers: [], country: "", categories: [CATEGORIES[0]],
  avoidReasons: ["個人選擇"], confidence: "low", status: "personal",
  summary: "這是告訴人角色的歷史紀錄；尚未確認後續程序，不能推定為被告或定讞。",
  aiNotes: "來源限制與程序不可由分類或狀態推定。",
  sources: [{ title: "具名報導", url: "https://example.test/source", date: "2026-01-01", note: "只支持歷史程序，不證最新進度。" }],
  lastReviewed: "2026-01-02", ...extra,
});
const renderer = (title, body, llms) => Buffer.from(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><link rel="describedby" href="${escapeHtml(llms)}"></head><body>${body}</body></html>`);
const unescape = (value) => value.replace(/&(amp|lt|gt|quot|#39);/gu, (_, c) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[c]);
const target = (from, href) => decodeURIComponent(new URL(unescape(href), `https://site.invalid/${from}`).pathname.slice(1));
const links = (files, from) => [...files.get(from).toString().matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gu)]
  .map((m) => ({ target: target(from, m[1]), label: unescape(m[2].replace(/<[^>]*>/gu, "")) }));
const follow = (files, from, label) => {
  const found = links(files, from).filter((link) => link.label === label);
  assert.equal(found.length, 1, `${from}: one link for ${label}`);
  return found[0].target;
};
async function helper() {
  assert(fs.existsSync(new URL("../scripts/lib/judicial-catalog.mjs", import.meta.url)), "judicial catalog helper exists");
  return import("../scripts/lib/judicial-catalog.mjs");
}
function graph(files, root = ROOT, budget = 65536) {
  const visited = new Set();
  const queue = [root];
  for (let index = 0; index < queue.length; index++) {
    const file = queue[index];
    if (visited.has(file)) continue;
    visited.add(file);
    assert(files.has(file), file);
    assert(files.get(file).length <= budget, file);
    const text = files.get(file).toString();
    assert(!/<script\b/iu.test(text), file);
    assert(text.includes(NOTICE), file);
    assert.match(text, /第 \d+ 頁 \/ 共 \d+ 頁/u);
    const llms = text.match(/rel="describedby" href="([^"]+)"/u)[1];
    assert.equal(target(`v1/hash/${file}`, llms), "llms.txt");
    for (const link of links(files, file)) if (link.target.startsWith("judicial/")) queue.push(link.target);
    else assert.match(link.target, /^(?:catalog\/index|records\/[a-z0-9][a-z0-9._-]*)\.html$/u);
  }
  assert.deepEqual([...visited].sort(), [...files.keys()].sort(), "all catalog pages reachable via actual links");
  return visited;
}
function rows(files, directory) {
  return [...files].filter(([file]) => path.posix.dirname(file) === directory)
    .flatMap(([, bytes]) => [...bytes.toString().matchAll(/<li data-record-id="([^"]+)"/gu)].map((m) => m[1]));
}

test("homepage shortcut leads to an inventoried same-version no-JS judicial directory", () => {
  const record = sample("witness");
  const site = generateSite({ records: [record] });
  const root = follow(site.files, "index.html", "司法案件");
  const prefix = `v1/${site.manifest.dataVersion}/`;
  assert.equal(root, `${prefix}${ROOT}`);
  const all = follow(site.files, root, "全部司法相關紀錄");
  assert.equal(follow(site.files, all, record.name), `${site.manifest.recordBase}${record.id}.html`);
  assert(site.files.get("index.html").toString().includes(NOTICE));
  assert(site.files.get(all).toString().includes(record.summary));
  assert(site.files.get(all).toString().includes("來源限制與程序請讀完整紀錄"));
  assert(site.files.get("llms.txt").toString().includes(root));
  const inventoryBytes = site.files.get(site.manifest.inventory.url);
  assert.equal(sha256(inventoryBytes), site.manifest.dataVersion);
  const inventory = JSON.parse(inventoryBytes);
  for (const [file, bytes] of site.files) if (file.startsWith(`${prefix}judicial/`)) {
    const item = inventory.files.find((entry) => entry.path === file.slice(prefix.length));
    assert.deepEqual(item, { path: file.slice(prefix.length), bytes: bytes.length, sha256: sha256(bytes) });
    for (const link of links(site.files, file)) assert(site.files.has(link.target), `${file}: ${link.target}`);
  }
});

test("judicial selection uses only the exact category allowlist, not confirmed or crime keywords", async () => {
  const { buildJudicialCatalog } = await helper();
  const records = [sample("a"), sample("b", { categories: [CATEGORIES[1]] }), sample("c", { categories: [CATEGORIES[2]] }),
    sample("political-roster", { categories: ["政治／公眾人物"], status: "confirmed", summary: "涉案、判刑、有罪定讞字樣不能作分類依據。" }),
    sample("near-match", { categories: ["司法／人物案件／其他"] }), sample("missing", { categories: undefined })];
  const files = buildJudicialCatalog(records, { renderPage: renderer });
  graph(files);
  const all = follow(files, ROOT, "全部司法相關紀錄");
  assert.deepEqual(rows(files, path.posix.dirname(all)).sort(), ["a", "b", "c"]);
  for (const [index, category] of CATEGORIES.entries()) {
    const page = follow(files, ROOT, category);
    assert.deepEqual(rows(files, path.posix.dirname(page)), [String.fromCharCode(97 + index)]);
  }
});

test("directory deduplicates recordId per view before paging, but keeps distinct same-name IDs", async () => {
  const { buildJudicialCatalog } = await helper();
  const a = sample("a", { categories: [CATEGORIES[0], CATEGORIES[0], CATEGORIES[1]] });
  const b = sample("b");
  const records = [a, b, a];
  const before = JSON.stringify(records);
  const files = buildJudicialCatalog(records, { renderPage: renderer });
  graph(files);
  const all = follow(files, ROOT, "全部司法相關紀錄");
  assert.deepEqual(rows(files, path.posix.dirname(all)), ["a", "b"]);
  const people = follow(files, ROOT, CATEGORIES[0]);
  assert.deepEqual(links(files, people).filter((l) => l.label === a.name).map((l) => l.target), ["records/a.html", "records/b.html"]);
  assert.deepEqual(rows(files, path.posix.dirname(people)), ["a", "b"]);
  assert.equal(JSON.stringify(records), before);
});

test("names and complete summaries are escaped without truncation or derived legal claims", async () => {
  const { buildJudicialCatalog } = await helper();
  const record = sample("unsafe", { name: '<script>"A" & B</script>', summary: "完整摘要 <img src=x> & '引號'，尾端限制不得省略。" });
  const files = buildJudicialCatalog([record], { renderPage: renderer });
  graph(files);
  const all = follow(files, ROOT, "全部司法相關紀錄");
  const text = files.get(all).toString();
  assert(text.includes(escapeHtml(record.name)));
  assert(text.includes(escapeHtml(record.summary)));
  assert(!text.includes("<img"));
  assert.equal(follow(files, all, record.name), "records/unsafe.html");
});

test("deterministic byte-budget pagination exposes every ID and complete summary through next links", async () => {
  const { buildJudicialCatalog } = await helper();
  const records = Array.from({ length: 70 }, (_, n) => sample(`r-${String(n).padStart(3, "0")}`, { summary: `${n}：${"完整來源限制；".repeat(15)}` }));
  const budget = 3600;
  const files = buildJudicialCatalog([...records, records[0]], { renderPage: renderer, maxPageBytes: budget });
  graph(files, ROOT, budget);
  assert.deepEqual(files, buildJudicialCatalog([...records].reverse(), { renderPage: renderer, maxPageBytes: budget }));
  let page = follow(files, ROOT, "全部司法相關紀錄");
  const visited = new Set();
  const actual = [];
  for (;;) {
    assert(!visited.has(page), "no pagination cycle");
    visited.add(page);
    const text = files.get(page).toString();
    actual.push(...[...text.matchAll(/<li data-record-id="([^"]+)"/gu)].map((m) => m[1]));
    const next = links(files, page).find((link) => link.label === "下一頁");
    if (!next) { assert(text.includes("結束")); break; }
    page = next.target;
  }
  assert(visited.size > 9, "exercise page-count digit boundary");
  assert.deepEqual(actual.sort(), records.map((record) => record.id).sort());
  const allText = [...visited].map((file) => files.get(file).toString()).join("");
  for (const record of records) assert(allText.includes(record.summary));
});

test("empty categories remain linked and state they are empty without implying innocence or completed review", async () => {
  const { buildJudicialCatalog } = await helper();
  const files = buildJudicialCatalog([], { renderPage: renderer });
  graph(files);
  for (const label of ["全部司法相關紀錄", ...CATEGORIES]) {
    const page = follow(files, ROOT, label);
    const text = files.get(page).toString();
    assert(text.includes("此快照沒有符合此分類的紀錄"));
    assert(text.includes("不代表安全、清白或已完成逐人複查"));
    assert.deepEqual(rows(files, path.posix.dirname(page)), []);
  }
});

test("one oversized summary fails explicitly instead of silently truncating", async () => {
  const { buildJudicialCatalog } = await helper();
  assert.throws(() => buildJudicialCatalog([sample("large", { summary: "字".repeat(30000) })], { renderPage: renderer }), /exceeds.*budget/iu);
  for (const maxPageBytes of [0, 65537, 1.2]) assert.throws(() => buildJudicialCatalog([], { renderPage: renderer, maxPageBytes }), /budget/iu);
});

test("adding the directory preserves complete JSON envelopes and existing record HTML fields", () => {
  const records = [sample("a"), sample("b", { categories: ["政治／公眾人物"] })];
  const site = generateSite({ records });
  for (const record of records) {
    const bytes = site.files.get(`${site.manifest.recordBase}${record.id}.json`);
    assert(bytes.equals(jsonBytes({ schemaVersion: 1, record, sourceLinks: sourceLinksFor(record, new Map()) })));
    const page = site.files.get(`${site.manifest.recordBase}${record.id}.html`).toString();
    for (const value of [record.name, record.summary, record.aiNotes, record.sources[0].note]) assert(page.includes(escapeHtml(value)));
  }
});

test("site validator accepts judicial pages and rejects a tampered directory", () => {
  const records = [sample("a")];
  const site = generateSite({ records });
  const judicialRoot = follow(site.files, "index.html", "司法案件");
  const directory = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), "brand-judicial-test-"));
  try {
    for (const [file, bytes] of site.files) {
      const output = path.join(directory, file);
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, bytes);
    }
    assert.deepEqual(validateSite({ siteDir: directory, records, evidenceFiles: new Map(), requireClean: false }).errors, []);
    fs.appendFileSync(path.join(directory, judicialRoot), "tampered");
    assert.equal(validateSite({ siteDir: directory, records, evidenceFiles: new Map(), requireClean: false }).ok, false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
