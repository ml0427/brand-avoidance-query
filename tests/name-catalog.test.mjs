import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { buildNameCatalog, CATALOG_PAGE_LIMIT } from "../scripts/lib/name-catalog.mjs";

const ROOT = "catalog/index.html";
const escapeHtml = (value) => String(value).replace(/[&<>"']/gu, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
const unescapeHtml = (value) => value.replace(/&(amp|lt|gt|quot|#39|#96);/gu, (_, entity) => ({
  amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", "#96": "`",
})[entity]);
const renderer = (title, body, llmsHref) => Buffer.from(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><link rel="describedby" href="${escapeHtml(llmsHref)}"></head><body><main>${body}</main></body></html>`, "utf8");
const match = (recordId, name, field = "name", value = name) => ({
  recordId, name, field, value,
  record: { url: `../records/${recordId}.json` },
  page: { url: `../records/${recordId}.html` },
});
const entry = (key, recordId, name = key, field = "name", value = name) => ({ key, matches: [match(recordId, name, field, value)] });
const build = (entries, options = {}) => buildNameCatalog(entries, { renderPage: renderer, ...options });
const content = (files, file = ROOT) => files.get(file).toString("utf8");
const resolve = (file, href) => path.posix.normalize(path.posix.join(path.posix.dirname(file), unescapeHtml(href)));

function links(files, file) {
  return [...content(files, file).matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gu)].map((item) => ({
    label: unescapeHtml(item[2]), target: resolve(file, item[1]),
  }));
}

function follow(files, from, label) {
  const found = links(files, from).filter((link) => link.label === label);
  assert.equal(found.length, 1, `${from}: expected exactly one link named ${label}`);
  return found[0].target;
}

function assertGraph(files, budget = CATALOG_PAGE_LIMIT) {
  const visited = new Set();
  const queue = [ROOT];
  const rows = [];
  for (let index = 0; index < queue.length; index++) {
    const file = queue[index];
    if (visited.has(file)) continue;
    visited.add(file);
    const bytes = files.get(file);
    assert(Buffer.isBuffer(bytes), `Missing catalog page: ${file}`);
    assert(bytes.length <= budget, `${file}: ${bytes.length} > ${budget}`);
    assert.match(file, /^catalog\/(?:[a-f0-9]+\/)*(?:index|page-\d+)\.html$/u);
    assert.match(content(files, file), /^<!doctype html>/u);
    assert(!content(files, file).includes("<script"));
    const llms = content(files, file).match(/<link rel="describedby" href="([^"]+)">/u)[1];
    assert.equal(llms, "../".repeat(file.split("/").length + 1) + "llms.txt");
    assert.equal(new URL(llms, `https://example.test/project/v1/hash/${file}`).pathname, "/project/llms.txt");
    for (const link of links(files, file)) {
      if (link.target.startsWith("catalog/")) queue.push(link.target);
      else assert.match(link.target, /^records\/[a-z0-9][a-z0-9._-]*\.html$/u);
    }
    for (const row of content(files, file).matchAll(/<li data-key="([^"]*)" data-match-field="([^"]*)" data-record-name="([^"]*)">[\s\S]*?<a href="([^"]+)">([^<]*)<\/a>/gu)) {
      rows.push([unescapeHtml(row[1]), resolve(file, row[4]), unescapeHtml(row[5]), `欄位：${unescapeHtml(row[2])}；紀錄：${unescapeHtml(row[3])}`]);
    }
  }
  assert.deepEqual([...visited].sort(), [...files.keys()].sort(), "Every generated page must be reachable");
  return rows;
}

function expectedRows(entries) {
  return entries.flatMap(({ key, matches }) => matches.map((item) => [key, `records/${item.recordId}.html`, item.value, `欄位：${item.field}；紀錄：${item.name}`]));
}

function assertAllRows(files, entries, budget) {
  const order = (rows) => rows.map((row) => JSON.stringify(row)).sort();
  assert.deepEqual(order(assertGraph(files, budget)), order(expectedRows(entries)));
}

function pageChain(files, first) {
  const pages = [];
  let file = first;
  while (file) {
    assert(!pages.includes(file), "Pagination cycle");
    pages.push(file);
    const next = links(files, file).filter((link) => link.label === "下一頁");
    assert(next.length <= 1);
    if (pages.length > 1) assert.equal(follow(files, file, "上一頁"), pages.at(-2));
    else assert(!links(files, file).some((link) => link.label === "上一頁"));
    file = next[0]?.target;
  }
  for (const [index, page] of pages.entries()) {
    assert(content(files, page).includes(`第 ${index + 1} 頁 / 共 ${pages.length} 頁`));
    assert.equal(content(files, page).includes("<span>結束</span>"), index === pages.length - 1);
  }
  return pages;
}

test("Chinese first-character navigation reaches the full name and record without JavaScript", () => {
  const entries = [entry("文姿雲", "fixture-wen", "文姿雲")];
  const files = build(entries);
  const group = follow(files, ROOT, "文");
  assert.equal(follow(files, group, "文姿雲"), "records/fixture-wen.html");
  assert(content(files, ROOT).includes('<a href="6587/index.html">文</a>'));
  assert(!content(files, ROOT).includes("個查詢鍵"));
  assert(content(files, group).includes('data-match-field="name" data-record-name="文姿雲"'));
  assert.equal(files.size, 2);
  assertAllRows(files, entries);
});

test("root separates A-Z, Chinese initials, numbers, and other text or symbols", () => {
  const entries = [entry("文一", "han"), entry("@sample", "symbol"), entry("7sample", "number"), entry("éclair", "other"), entry("alpha", "alpha", "ALPHA"), entry("zulu", "zulu", "Zulu")];
  const files = build(entries);
  const root = content(files);
  for (const section of ["A-Z", "中文首字", "數字", "其他文字／符號"]) assert(root.includes(`${section}</h2>`));
  for (const label of ["A", "Z", "文", "7", "@", "é"]) assert(files.has(follow(files, ROOT, label)));
  assert(root.indexOf("A-Z") < root.indexOf("中文首字"));
  assert(root.indexOf("中文首字") < root.indexOf("數字"));
  assert(root.indexOf("數字") < root.indexOf("其他文字／符號"));
  assertAllRows(files, entries);
});

test("ASCII tree branches preserve sibling indentation and mark each final child", () => {
  const entries = [entry("alpha", "a"), entry("beta", "b"), entry("文姿雲", "wen")];
  const files = build(entries);
  const branches = [...content(files).matchAll(/<span class="tree-branch" aria-hidden="true">(.*?)<\/span>/gu)]
    .map((match) => unescapeHtml(match[1]));
  assert.deepEqual(branches, ["|-- ", "|   |-- ", "|   `-- ", "`-- ", "    `-- "]);
  for (const bytes of files.values()) {
    const html = bytes.toString();
    assert(!html.includes("catalog-prefixes"));
    assert(!html.includes("查詢鍵"));
    assert(html.includes('class="catalog-tree"'));
  }
  assertAllRows(files, entries);
});

test("normalized keys stay unchanged while name, aliases, and identifiers retain their actual values", () => {
  const entries = [
    { key: "alpha", matches: [match("same", "Alpha", "name", "Alpha"), match("same", "Alpha", "aliases", "ALPHA")] },
    entry("文別名", "same", "Alpha", "aliases", "文別名"),
    entry("4710000000000", "same", "Alpha", "identifiers", "條碼：4710000000000"),
    entry("https://example.test:8443/shop", "same", "Alpha", "identifiers", "https://example.test:8443/shop"),
  ];
  const files = build(entries);
  const alpha = follow(files, ROOT, "A");
  assert(content(files, alpha).includes('data-key="alpha"'));
  assert(!content(files, alpha).includes('data-key="ALPHA"'));
  assert(content(files).includes("共 1 筆紀錄。"));
  assert(!content(files).includes("查詢鍵"));
  assert.equal(follow(files, follow(files, ROOT, "文"), "文別名"), "records/same.html");
  assert.equal(follow(files, follow(files, ROOT, "4"), "條碼：4710000000000"), "records/same.html");
  assert.equal(follow(files, follow(files, ROOT, "H"), "https://example.test:8443/shop"), "records/same.html");
  assertAllRows(files, entries);
});

test("colliding names preserve multiple record IDs and every matched field", () => {
  const entries = [{ key: "同名", matches: [match("first", "同名"), match("second", "同名"), match("first", "同名", "aliases", "同名")] }];
  const files = build(entries);
  const group = follow(files, ROOT, "同");
  assert.equal(links(files, group).filter((link) => link.label === "同名").length, 3);
  assert(content(files).includes("共 2 筆紀錄。"));
  assertAllRows(files, entries);
});

test("small leaves list all names directly instead of splitting every shared prefix", () => {
  const entries = [entry("alpha", "a"), entry("alpine", "b"), entry("alps", "c"), entry("al", "d")];
  const files = build(entries);
  assert.equal(files.size, 2);
  const group = follow(files, ROOT, "A");
  for (const item of entries) assert.equal(follow(files, group, item.key), `records/${item.matches[0].recordId}.html`);
  assertAllRows(files, entries);
});

test("crowded prefixes split on the next character and compress single-branch prefixes", () => {
  const entries = ["a", "b", "c"].flatMap((letter) => Array.from({ length: 4 }, (_, index) => entry(`alphabet${letter}${index}`, `${letter}-${index}`)));
  const budget = 1600;
  const files = build(entries, { maxPageBytes: budget });
  const group = follow(files, ROOT, "A");
  for (const letter of ["a", "b", "c"]) {
    const child = follow(files, group, `alphabet${letter}`);
    assert.equal(follow(files, child, "上一層"), group);
    assert.equal(follow(files, child, "名稱目錄首頁"), ROOT);
    assert.equal(follow(files, child, `alphabet${letter}0`), `records/${letter}-0.html`);
  }
  assert.equal(files.size, 5);
  assertAllRows(files, entries, budget);
});

test("terminal keys coexist with longer keys and preserve all matches", () => {
  const entries = [entry("a", "terminal"), ...Array.from({ length: 16 }, (_, index) => entry(`a${String(index).padStart(2, "0")}`, `long-${index}`))];
  const budget = 1700;
  const files = build(entries, { maxPageBytes: budget });
  const first = follow(files, ROOT, "A");
  assert.equal(follow(files, first, "a"), "records/terminal.html");
  assert(content(files, first).includes("完整名稱／識別碼"));
  assertAllRows(files, entries, budget);
});

test("UTF-8 byte budgets include the renderer, multibyte names, and all navigation", () => {
  const entries = [{ key: "文", matches: Array.from({ length: 24 }, (_, index) => match(`multi-${index}`, `文${"多位元組".repeat(8)}${index}`)) }];
  const renderPage = (title, body, llms) => renderer(title, `<header>${"包裝".repeat(30)}</header>${body}`, llms);
  const budget = 1700;
  const files = build(entries, { renderPage, maxPageBytes: budget });
  const group = follow(files, ROOT, "文");
  assert(pageChain(files, group).length > 1);
  assert([...files.values()].some((bytes) => bytes.toString().length < budget && bytes.length > budget * 0.8));
  assertAllRows(files, entries, budget);
});

test("large roots paginate without dropping or duplicating any initial or result", () => {
  const entries = Array.from({ length: 110 }, (_, index) => entry(`${String.fromCodePoint(0x4e00 + index)}目錄`, `root-${index}`));
  const budget = 1250;
  const files = build(entries, { maxPageBytes: budget });
  const pages = pageChain(files, ROOT);
  assert(pages.length > 9, "Exercise final page-count digit growth");
  const initialLinks = pages.flatMap((page) => links(files, page).filter((link) => Array.from(link.label).length === 1));
  assert.equal(initialLinks.length, entries.length);
  assert.equal(new Set(initialLinks.map((link) => link.label)).size, entries.length);
  assertAllRows(files, entries, budget);
});

test("large unsplittable collisions paginate every field and same-name record exactly once", () => {
  const entries = [{ key: "collision", matches: Array.from({ length: 85 }, (_, index) => match(`collision-${index}`, "同一名字", index % 2 ? "aliases" : "name", "COLLISION")) }];
  const budget = 1200;
  const files = build(entries, { maxPageBytes: budget });
  const first = follow(files, ROOT, "C");
  assert(pageChain(files, first).length > 9);
  assertAllRows(files, entries, budget);
});

test("nested pagination uses relative links for root, parent, records, and deployment llms", () => {
  const entries = [
    { key: "prefixa", matches: Array.from({ length: 32 }, (_, index) => match(`nested-${index}`, `Nested ${index}`)) },
    entry("prefixb", "sibling"),
  ];
  const budget = 1300;
  const files = build(entries, { maxPageBytes: budget });
  const parent = follow(files, ROOT, "P");
  const child = follow(files, parent, "prefixa");
  const pages = pageChain(files, child);
  assert(pages.length > 1);
  for (const page of pages) {
    assert.equal(follow(files, page, "上一層"), parent);
    assert.equal(follow(files, page, "名稱目錄首頁"), ROOT);
    assert(content(files, page).includes('href="../../../records/nested-'));
  }
  assertAllRows(files, entries, budget);
});

test("all visible source strings are escaped and hostile descriptor URLs are ignored", () => {
  const special = '<img src=x onerror="bad">&\'終';
  const entries = [{ key: `<${special}`, matches: [match("safe-id", special, `aliases${special}`, special)] }];
  entries[0].matches[0].page.url = "javascript:alert(1)";
  const files = build(entries);
  const group = follow(files, ROOT, "<");
  assert.equal(follow(files, group, special), "records/safe-id.html");
  for (const bytes of files.values()) {
    const html = bytes.toString();
    assert(!html.includes("<img"));
    assert(!html.includes("javascript:"));
    assert(!html.includes(special));
  }
  assert(content(files, group).includes(escapeHtml(special)));
  assertAllRows(files, entries);
});

test("astral codepoints are whole initials and safely escaped on crowded child links", () => {
  const entries = [entry("𠀀甲", "astral"), ...["&", "<", '"', "'"].map((letter, index) => entry(`a${letter}`, `escaped-${index}`, `${"字".repeat(100)}${index}`))];
  const budget = 1450;
  const files = build(entries, { maxPageBytes: budget });
  assert.equal(follow(files, ROOT, "𠀀"), "catalog/20000/index.html");
  const parent = follow(files, ROOT, "A");
  for (const character of ["&", "<", '"', "'"]) assert(files.has(follow(files, parent, `a${character}`)));
  assertAllRows(files, entries, budget);
});

test("catalogs show only the root record total, without lookup-key counters", () => {
  const files = build([], { recordCount: 7 });
  assert.equal(files.size, 1);
  assert(content(files).includes("共 7 筆紀錄。"));
  assert(content(files).includes("沒有目錄項目。"));
  assert(!content(files).includes("查詢鍵"));
  assertAllRows(files, []);
  const entries = [entry("alpha", "a")];
  const populated = build(entries, { recordCount: 9 });
  assert(content(populated).includes("共 9 筆紀錄。"));
  assert(!content(populated, follow(populated, ROOT, "A")).includes("筆紀錄"));
});

test("final Buffer length is an inclusive limit and undersized budgets reject explicitly", () => {
  const empty = build([]).get(ROOT).length;
  assert.equal(build([], { maxPageBytes: empty }).get(ROOT).length, empty);
  assert.throws(() => build([], { maxPageBytes: empty - 1 }), /too small/u);
  for (const maxPageBytes of [0, -1, 1, 3.5, NaN, Infinity, CATALOG_PAGE_LIMIT + 1, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => build([], { maxPageBytes }), /budget|too small/u);
  }
  const entries = [entry("alpha", "a")];
  const normal = build(entries);
  const largest = Math.max(...[...normal.values()].map((bytes) => bytes.length));
  assertAllRows(build(entries, { maxPageBytes: largest }), entries, largest);
});

test("a single indivisible match or initial row throws instead of truncating", () => {
  assert.throws(() => build([entry("a", "huge", "字".repeat(2000))], { maxPageBytes: 1300 }), /row exceeds maxPageBytes/u);
  const renderPage = (title, body, llms) => renderer(title, body.includes('class="catalog-tree"') ? body + "x".repeat(3000) : body, llms);
  assert.throws(() => build([entry("a", "a")], { renderPage, maxPageBytes: 1300 }), /row exceeds maxPageBytes/u);
});

test("input validation rejects unsafe paths, invalid counts, and non-Buffer renderers", () => {
  assert.throws(() => buildNameCatalog([]), /renderPage/u);
  assert.throws(() => build([], { renderPage: () => "not a Buffer" }), /HTML Buffer/u);
  assert.throws(() => build(null), /array/u);
  assert.throws(() => build([{ key: "", matches: [] }]), /nonempty/u);
  assert.throws(() => build([entry("a", "a"), entry("a", "b")]), /Duplicate catalog key/u);
  for (const id of ["../escape", "/absolute", "a/b", "bad\"attribute", "a\\b"]) assert.throws(() => build([entry("a", id)]), /unsafe recordId/u);
  for (const recordCount of [-1, 0, 0.5, NaN, Infinity]) assert.throws(() => build([entry("a", "a")], { recordCount }), /recordCount/u);
});

test("fixtures remain unchanged and output ordering is independent of entry ordering", () => {
  const entries = [entry("文", "han"), entry("alpha", "a"), entry("@example", "other")];
  const before = structuredClone(entries);
  const files = build(entries);
  assert.deepEqual(entries, before);
  assert.deepEqual([...files], [...build([...entries].reverse())]);
  assert.equal(CATALOG_PAGE_LIMIT, 65536);
});
