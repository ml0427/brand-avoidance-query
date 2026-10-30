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
const PARTY_NOTICE = "政黨導覽只依本筆紀錄明確標籤及其來源時點分類，不代表即時黨籍、案發時黨籍或政黨責任；退黨、轉黨與來源日期請讀完整紀錄。未確認／未分類包含尚未核實、標籤衝突及公司等不適用對象，不等於無黨籍；本目錄不是各黨涉案人數或完整案件統計。";
const PARTIES = [
  { key: "kmt", name: "中國國民黨", tag: "政黨／中國國民黨" },
  { key: "dpp", name: "民主進步黨", tag: "政黨／民主進步黨" },
  { key: "tpp", name: "台灣民眾黨", tag: "政黨／台灣民眾黨" },
  { key: "other", name: "其他政黨", tag: "政黨／其他政黨" },
  { key: "independent", name: "無黨籍", tag: "政黨／無黨籍" },
  { key: "unknown", name: "未確認／未分類", tag: null },
];
const partyDirectory = (key) => `judicial/party/${key}`;
const partyRows = (files, key) => rows(files, partyDirectory(key));
function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
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
    assert(text.includes(PARTY_NOTICE), file);
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
  // The party notice increases the fixed shell; retain the >9-page stress assertion.
  const records = Array.from({ length: 100 }, (_, n) => sample(`r-${String(n).padStart(3, "0")}`, { summary: `${n}：${"完整來源限制；".repeat(15)}` }));
  const budget = 4800;
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

test("T01 party links come first inside the existing homepage judicial route, followed by all old views", () => {
  const site = generateSite({ records: [sample("a")] });
  const root = follow(site.files, "index.html", "司法案件");
  assert.equal(root, `v1/${site.manifest.dataVersion}/${ROOT}`);
  const navigation = links(site.files, root).filter((link) => !["司法分類目錄", "完整名稱目錄"].includes(link.label));
  assert.deepEqual(navigation.map((link) => link.label), [...PARTIES.map((p) => p.name), "全部司法相關紀錄", ...CATEGORIES]);
  for (const party of PARTIES) assert.equal(follow(site.files, root, party.name), `v1/${site.manifest.dataVersion}/${partyDirectory(party.key)}/index.html`);
  assert(site.files.get("index.html").toString().includes(NOTICE));
  assert(site.files.get("llms.txt").toString().includes(PARTY_NOTICE));
});

test("T02 party tags never widen the exact judicial selection to political rosters or approximate categories", async () => {
  const { buildJudicialCatalog } = await helper();
  const records = [sample("yes", { categories: [CATEGORIES[2], PARTIES[0].tag] }),
    ...["政治／公眾人物", "政治／現任國民黨名冊", "司法／人物案件／其他", "司法/人物案件"].map((category, n) => sample(`no-${n}`, {
      categories: [category, PARTIES[0].tag], status: "confirmed", summary: "中國國民黨／起訴判刑有罪定讞字樣仍不能作分類依據。",
    }))];
  const files = buildJudicialCatalog(records, { renderPage: renderer });
  graph(files);
  assert.deepEqual(rows(files, "judicial/all"), ["yes"]);
  assert.deepEqual(PARTIES.flatMap((p) => partyRows(files, p.key)), ["yes"]);
});

test("T03 five exact party tags form mutually exclusive groups whose union equals all, with duplicate tags ignored", async () => {
  const { buildJudicialCatalog } = await helper();
  const records = PARTIES.filter((p) => p.tag).map((p) => sample(p.key, { categories: [...CATEGORIES, p.tag, p.tag] }));
  records.push(sample("unknown"));
  const files = buildJudicialCatalog(records, { renderPage: renderer });
  for (const p of PARTIES) assert.deepEqual(partyRows(files, p.key), [p.key]);
  const combined = PARTIES.flatMap((p) => partyRows(files, p.key));
  assert.equal(new Set(combined).size, combined.length);
  assert.deepEqual(combined.sort(), rows(files, "judicial/all").sort());
  for (const category of ["people", "companies", "public-figures"]) assert.equal(rows(files, `judicial/${category}`).length, records.length - 1 + (category === "people" ? 1 : 0));
});

test("T04 names, IDs, relatives, summaries and source prose never supply or inherit a party tag", async () => {
  const { buildJudicialCatalog } = await helper();
  const records = [sample("kmt-roster-member", { name: "中國國民黨黨員", aliases: ["民主進步黨"], identifiers: ["台灣民眾黨"],
    summary: "本人／提告人／律師／關係人是中國國民黨，支持民主進步黨。", aiNotes: "政黨／台灣民眾黨；轉黨文句不是標籤。",
    sources: [{ title: "政黨／中國國民黨", url: "https://example.test/kmt", date: "2026-06-26", note: "關係人黨籍：民主進步黨" }] }),
    sample("tagged-member", { categories: [CATEGORIES[0], PARTIES[0].tag] }), sample("other-member", { categories: [CATEGORIES[0], "政治／公眾人物"] })];
  const files = buildJudicialCatalog(records, { renderPage: renderer });
  assert.deepEqual(partyRows(files, "unknown").sort(), ["kmt-roster-member", "other-member"]);
  assert.deepEqual(partyRows(files, "kmt"), ["tagged-member"]);
  assert.deepEqual(partyRows(files, "dpp"), []);
  assert.deepEqual(partyRows(files, "tpp"), []);
});

test("T05 absent tags on people, companies and arbitrary corporate-category subjects stay unknown, not independent", async () => {
  const { buildJudicialCatalog } = await helper();
  const records = [sample("person"), sample("company", { name: "某某股份有限公司", categories: [CATEGORIES[1]] }),
    sample("unspecified", { categories: [CATEGORIES[1]] }), sample("explicit", { categories: [CATEGORIES[0], PARTIES[4].tag] })];
  const files = buildJudicialCatalog(records, { renderPage: renderer });
  assert.deepEqual(partyRows(files, "unknown").sort(), ["company", "person", "unspecified"]);
  assert.deepEqual(partyRows(files, "independent"), ["explicit"]);
  const text = files.get(`${partyDirectory("unknown")}/index.html`).toString();
  assert(text.includes(PARTY_NOTICE));
  assert(!text.includes("全部為公司"));
});

test("T06 unsupported, approximate and untrimmed party strings are unknown, never automatically other", async () => {
  const { buildJudicialCatalog } = await helper();
  const tags = ["政黨／國民黨", "政黨／未確認", "政黨／某小黨", "政黨／中國國民黨 ", " 政黨／中國國民黨", "政黨/中國國民黨", "政黨／", "政黨／台灣民眾黨／地方"];
  const records = tags.map((tag, n) => sample(`unknown-${n}`, { categories: [CATEGORIES[0], tag] }));
  records.push(sample("explicit-other", { categories: [CATEGORIES[0], PARTIES[3].tag] }));
  const files = buildJudicialCatalog(records, { renderPage: renderer });
  assert.deepEqual(partyRows(files, "unknown"), records.slice(0, -1).map((r) => r.id));
  assert.deepEqual(partyRows(files, "other"), ["explicit-other"]);
});

test("T07 conflicting distinct prefix tags, including valid plus unsupported, go only to unknown regardless of tag order", async () => {
  const { buildJudicialCatalog } = await helper();
  const combinations = [[PARTIES[0].tag, PARTIES[1].tag], [PARTIES[0].tag, PARTIES[4].tag],
    [PARTIES[0].tag, "政黨／某小黨"], [PARTIES[4].tag, "政黨／未確認"], [PARTIES[3].tag, PARTIES[2].tag]];
  const records = combinations.map((tags, n) => sample(`conflict-${n}`, { categories: [CATEGORIES[0], ...tags] }));
  const files = buildJudicialCatalog(records, { renderPage: renderer });
  assert.deepEqual(partyRows(files, "unknown"), records.map((r) => r.id));
  for (const p of PARTIES.filter((p) => p.tag)) assert.deepEqual(partyRows(files, p.key), []);
  assert.deepEqual(files, buildJudicialCatalog(records.map((r) => ({ ...r, categories: [...r.categories].reverse() })), { renderPage: renderer }));
});

test("T08 source-time party tags do not become current or incident-time affiliation and preserve procedural limits", () => {
  const record = sample("historical", { categories: [CATEGORIES[0], PARTIES[0].tag],
    summary: "告訴人歷史紀錄，後續未知；非被告或有罪認定。",
    sources: [{ title: "合成歷史名冊", url: "https://example.test/roster", date: "2026-06-26", note: "本人僅於2026-06-26來源時點標註中國國民黨；非即時黨籍。" },
      { title: "較新案件來源", url: "https://example.test/later", date: "2026-10-29", note: "歷史轉黨／退黨敘述不供renderer解析；民主進步黨是關係人，不是本人的黨籍認證。" }],
    aiNotes: "合成fixture的時點限制：不是案發時黨籍；不可取最大來源日期或lastReviewed推定。", lastReviewed: "2026-10-30" });
  const before = JSON.stringify(record);
  const site = generateSite({ records: [record] });
  const root = follow(site.files, "index.html", "司法案件");
  const party = follow(site.files, root, PARTIES[0].name);
  const text = site.files.get(party).toString();
  assert(text.includes(PARTY_NOTICE));
  assert(text.includes("政黨導覽：中國國民黨（依來源時點；非即時黨籍；詳完整紀錄）"));
  assert(text.includes(escapeHtml(record.summary)));
  const full = follow(site.files, party, record.name);
  for (const source of record.sources) for (const value of [source.date, source.note]) assert(site.files.get(full).toString().includes(escapeHtml(value)));
  assert.deepEqual(JSON.parse(site.files.get(full.replace(/\.html$/u, ".json"))).record, record);
  assert.equal(JSON.stringify(record), before);
});

test("T09 nested frozen inputs retain exact values and array order, deduplicate IDs and preserve same-name IDs in party views", async () => {
  const { buildJudicialCatalog, JUDICIAL_PARTY_GROUPS } = await helper();
  const a = sample("a", { categories: [CATEGORIES[0], CATEGORIES[0], PARTIES[0].tag, PARTIES[0].tag] });
  const b = sample("b", { categories: [CATEGORIES[0], PARTIES[0].tag] });
  const records = deepFreeze([b, a, a]);
  const before = JSON.stringify(records);
  const files = buildJudicialCatalog(records, { renderPage: renderer });
  assert.deepEqual(partyRows(files, "kmt"), ["a", "b"]);
  const page = follow(files, ROOT, PARTIES[0].name);
  assert.deepEqual(links(files, page).filter((l) => l.label === a.name).map((l) => l.target), ["records/a.html", "records/b.html"]);
  assert.equal(JSON.stringify(records), before);
  assert(Object.isFrozen(JUDICIAL_PARTY_GROUPS));
  assert(JUDICIAL_PARTY_GROUPS.every(Object.isFrozen));
});

test("T10 party rows escape full names and long complete summaries including their final evidence restriction", async () => {
  const { buildJudicialCatalog } = await helper();
  const record = sample("escaped", { categories: [CATEGORIES[2], PARTIES[2].tag], name: '<script>"姓名" & 同名</script>',
    summary: `${"完整來源 <tag> & '引號'；".repeat(100)}尾端：僅告訴人，非被告；最新程序未知。` });
  const files = buildJudicialCatalog([record], { renderPage: renderer });
  graph(files);
  const page = follow(files, ROOT, PARTIES[2].name);
  const text = files.get(page).toString();
  assert(text.includes(escapeHtml(record.name)));
  assert(text.includes(escapeHtml(record.summary)));
  assert(text.includes(NOTICE));
  assert(text.includes(PARTY_NOTICE));
  assert(!text.includes("<tag>"));
  assert.equal(follow(files, page, record.name), "records/escaped.html");
});

test("T11 deep party pagination crosses nine pages with exact byte budgets, backlinks, prev/next and deterministic output", async () => {
  const { buildJudicialCatalog } = await helper();
  const records = Array.from({ length: 100 }, (_, n) => sample(`r-${String(n).padStart(3, "0")}`, {
    categories: [CATEGORIES[0], PARTIES[0].tag], summary: `${n}：${"完整來源限制；".repeat(15)}`,
  }));
  const budget = 4800;
  const files = buildJudicialCatalog([...records, records[0]], { renderPage: renderer, maxPageBytes: budget });
  graph(files, ROOT, budget);
  assert.deepEqual(files, buildJudicialCatalog([...records].reverse(), { renderPage: renderer, maxPageBytes: budget }));
  let page = follow(files, ROOT, PARTIES[0].name);
  let previous;
  const visited = new Set();
  const actual = [];
  for (;;) {
    assert(!visited.has(page), "no pagination cycle");
    visited.add(page);
    const text = files.get(page).toString();
    assert(text.includes(PARTY_NOTICE));
    assert.equal(follow(files, page, "司法分類目錄"), ROOT);
    assert.equal(follow(files, page, "完整名稱目錄"), "catalog/index.html");
    const prev = links(files, page).find((l) => l.label === "上一頁");
    assert.equal(prev?.target, previous);
    const pageIds = [...text.matchAll(/<li data-record-id="([^"]+)"/gu)].map((m) => m[1]);
    actual.push(...pageIds);
    assert.deepEqual(links(files, page).filter((l) => l.target.startsWith("records/")).map((l) => l.target), pageIds.map((id) => `records/${id}.html`));
    const next = links(files, page).find((l) => l.label === "下一頁");
    if (!next) { assert(text.includes("結束")); break; }
    previous = page;
    page = next.target;
  }
  assert(visited.size > 9);
  assert.deepEqual(actual, records.map((r) => r.id));
  const text = [...visited].map((f) => files.get(f).toString()).join("");
  for (const record of records) assert(text.includes(record.summary));
});

test("T12 all six empty party groups are real linked pages and oversize rows or fixed empty shells fail explicitly", async () => {
  const { buildJudicialCatalog } = await helper();
  const files = buildJudicialCatalog([], { renderPage: renderer });
  graph(files);
  for (const party of PARTIES) {
    const page = follow(files, ROOT, party.name);
    const text = files.get(page).toString();
    assert(text.includes("此快照沒有符合此分類的紀錄"));
    assert(text.includes("不代表安全、清白或已完成逐人複查"));
    assert(text.includes(PARTY_NOTICE));
    assert.deepEqual(partyRows(files, party.key), []);
  }
  assert.throws(() => buildJudicialCatalog([], { renderPage: renderer, maxPageBytes: 1 }), /budget/iu);
  assert.throws(() => buildJudicialCatalog([sample("large", { categories: [CATEGORIES[0], PARTIES[0].tag], summary: "字".repeat(30000) })], { renderPage: renderer }), /exceeds.*budget/iu);
  assert.throws(() => buildJudicialCatalog([], { renderPage: () => "not a Buffer" }), /Buffer/u);
});

test("T13 all generated party pages and pagination are inventoried in one deterministic version and every href resolves", () => {
  const records = Array.from({ length: 90 }, (_, n) => sample(`r-${n}`, { categories: [CATEGORIES[0], PARTIES[0].tag], summary: `${n}:${"來源限制；".repeat(100)}` }));
  const first = generateSite({ records });
  const second = generateSite({ records: [...records].reverse() });
  assert.deepEqual(first, second);
  const prefix = `v1/${first.manifest.dataVersion}/`;
  const inventory = JSON.parse(first.files.get(first.manifest.inventory.url));
  const partyFiles = [...first.files].filter(([f]) => f.startsWith(`${prefix}judicial/party/`));
  assert(partyFiles.filter(([f]) => f.startsWith(`${prefix}${partyDirectory("kmt")}/`)).length > 1);
  assert.deepEqual(PARTIES.map((p) => first.files.has(`${prefix}${partyDirectory(p.key)}/index.html`)), PARTIES.map(() => true));
  for (const [file, bytes] of partyFiles) {
    assert(bytes.length <= 65536);
    assert(bytes.toString().includes(PARTY_NOTICE));
    assert.deepEqual(inventory.files.find((entry) => entry.path === file.slice(prefix.length)), { path: file.slice(prefix.length), bytes: bytes.length, sha256: sha256(bytes) });
    for (const match of bytes.toString().matchAll(/href="([^"]+)"/gu)) assert(first.files.has(target(file, match[1])), `${file}: ${match[1]}`);
  }
  assert(!("party" in first.manifest));
});

test("T14 preserved record, index, schema, evidence and name-catalog snapshot bytes equal the pre-party fixture baseline", () => {
  const records = [sample("a"), sample("b", { categories: ["政治／公眾人物"] })];
  const site = generateSite({ records, evidenceFiles: new Map([["evidence/synthetic.txt", Buffer.from("synthetic fixture\n")]]) });
  const prefix = `v1/${site.manifest.dataVersion}/`;
  const preserved = [...site.files].filter(([file]) => file.startsWith(prefix) && /^(?:records|index|schemas|evidence|catalog)\//u.test(file.slice(prefix.length)))
    .map(([file, bytes]) => ({ path: file.slice(prefix.length), bytes: bytes.length, sha256: sha256(bytes) })).sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)));
  assert.equal(sha256(jsonBytes(preserved)), "d4523e7b6038e7c4bc51adfa8bead63fa79e043660151dffa5807c7c28c59d69");
});

test("T15 synthetic site validates and tampering a deep party page is rejected by its exact inventory target", () => {
  const records = [sample("a", { categories: [CATEGORIES[0], PARTIES[0].tag] })];
  const site = generateSite({ records });
  const root = follow(site.files, "index.html", "司法案件");
  const party = follow(site.files, root, PARTIES[0].name);
  const directory = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), "brand-judicial-party-test-"));
  try {
    for (const [file, bytes] of site.files) {
      const output = path.join(directory, file);
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, bytes);
    }
    assert.deepEqual(validateSite({ siteDir: directory, records, evidenceFiles: new Map(), requireClean: false }).errors, []);
    fs.appendFileSync(path.join(directory, party), "tampered-party");
    const result = validateSite({ siteDir: directory, records, evidenceFiles: new Map(), requireClean: false });
    assert.equal(result.ok, false);
    assert(result.errors.some((error) => error.includes("judicial/party/kmt/index.html")));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
