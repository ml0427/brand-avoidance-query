import path from "node:path";
import { CATALOG_PAGE_LIMIT } from "./name-catalog.mjs";
import { compareUtf8 } from "./site-format.mjs";

export const JUDICIAL_CATALOG_ROOT = "judicial/index.html";
export const JUDICIAL_NOTICE = "司法相關分類不代表全是被告、有罪或定讞；具體角色及最新已核程序請讀完整紀錄；舊紀錄不是本輪新複查完成。";
export const JUDICIAL_PARTY_NOTICE = "政黨導覽只依本筆紀錄明確標籤及其來源時點分類，不代表即時黨籍、案發時黨籍或政黨責任；退黨、轉黨與來源日期請讀完整紀錄。未確認／未分類包含尚未核實、標籤衝突及公司等不適用對象，不等於無黨籍；本目錄不是各黨涉案人數或完整案件統計。";
export const JUDICIAL_PARTY_GROUPS = Object.freeze([
  Object.freeze({ key: "kmt", name: "中國國民黨", directory: "party/kmt", tag: "政黨／中國國民黨" }),
  Object.freeze({ key: "dpp", name: "民主進步黨", directory: "party/dpp", tag: "政黨／民主進步黨" }),
  Object.freeze({ key: "tpp", name: "台灣民眾黨", directory: "party/tpp", tag: "政黨／台灣民眾黨" }),
  Object.freeze({ key: "other", name: "其他政黨", directory: "party/other", tag: "政黨／其他政黨" }),
  Object.freeze({ key: "independent", name: "無黨籍", directory: "party/independent", tag: "政黨／無黨籍" }),
  Object.freeze({ key: "unknown", name: "未確認／未分類", directory: "party/unknown", tag: null }),
]);
export const JUDICIAL_CATEGORIES = Object.freeze([
  Object.freeze({ name: "司法／人物案件", directory: "people" }),
  Object.freeze({ name: "司法／企業案件", directory: "companies" }),
  Object.freeze({ name: "司法／公眾人物", directory: "public-figures" }),
]);
const escapeHtml = (value) => String(value).replace(/[&<>"']/gu, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
const pageFile = (directory, number) => `${directory}/${number === 1 ? "index" : `page-${number}`}.html`;
const categoryNames = new Set(JUDICIAL_CATEGORIES.map(({ name }) => name));

function partyGroup(record) {
  // Only distinct, exact prefix tags from this record count. Unsupported tags
  // also conflict with valid ones; absent/conflicting tags never mean independent.
  const tags = [...new Set(record.categories.filter((category) => category.startsWith("政黨／")))];
  return (tags.length === 1 && JUDICIAL_PARTY_GROUPS.find((group) => group.tag === tags[0])) || JUDICIAL_PARTY_GROUPS.at(-1);
}

/** A navigation view of compiled records, never a separate case-facts dataset. */
export function buildJudicialCatalog(records, { renderPage, maxPageBytes = CATALOG_PAGE_LIMIT } = {}) {
  if (typeof renderPage !== "function") throw new TypeError("renderPage must be a function returning an HTML Buffer");
  if (!Number.isSafeInteger(maxPageBytes) || maxPageBytes < 1 || maxPageBytes > CATALOG_PAGE_LIMIT) throw new RangeError("Invalid maxPageBytes budget");
  const unique = new Map();
  for (const record of records) {
    if (!(record.categories ?? []).some((category) => categoryNames.has(category))) continue;
    if (!/^[a-z0-9][a-z0-9._-]*$/u.test(record.id)) throw new TypeError("Unsafe judicial recordId");
    unique.set(record.id, record);
  }
  const selected = [...unique.values()].sort((a, b) => compareUtf8(a.name, b.name) || compareUtf8(a.id, b.id));
  const parties = new Map(selected.map((record) => [record.id, partyGroup(record)]));
  const files = new Map();

  function render(directory, title, rows, number = 1, total = 1, hasNext = false) {
    const file = pageFile(directory, number);
    const link = (target, label, rel = "") => `<a${rel ? ` rel="${rel}"` : ""} href="${escapeHtml(path.posix.relative(path.posix.dirname(file), target))}">${escapeHtml(label)}</a>`;
    const pagination = `<nav aria-label="分頁"><span>第 ${number} 頁 / 共 ${total} 頁</span>${number > 1 ? link(pageFile(directory, number - 1), "上一頁", "prev") : ""}${hasNext ? link(pageFile(directory, number + 1), "下一頁", "next") : "<span>結束</span>"}</nav>`;
    const body = `<nav aria-label="司法目錄導覽">${link(JUDICIAL_CATALOG_ROOT, "司法分類目錄")}${link("catalog/index.html", "完整名稱目錄")}</nav><h1>${escapeHtml(title)}</h1><p>${JUDICIAL_NOTICE}</p><p>${JUDICIAL_PARTY_NOTICE}</p><p>僅依紀錄既有分類列入，不由摘要關鍵字或 confirmed 狀態推定犯罪。完整摘要沿用來源；來源限制與程序請讀完整紀錄，包括 aiNotes、sources.note 及複查日期，不把舊程序當成今日進度。</p>${rows.length ? `<ul>${rows.map((row) => row(file)).join("")}</ul>` : "<p>此快照沒有符合此分類的紀錄；不代表安全、清白或已完成逐人複查。</p>"}${pagination}`;
    const bytes = renderPage(title, body, "../".repeat(file.split("/").length + 1) + "llms.txt");
    if (!Buffer.isBuffer(bytes)) throw new TypeError("renderPage must return an HTML Buffer");
    return bytes;
  }

  function writePages(directory, title, rows) {
    const single = render(directory, title, rows);
    if (single.length <= maxPageBytes) {
      files.set(pageFile(directory, 1), single);
      return;
    }
    if (!rows.length) throw new RangeError("Judicial navigation exceeds page budget");
    const chunks = [];
    // The number of rows bounds the final page count. Reserve that digit width
    // and next/previous links while packing; final rendering can only shrink.
    for (let start = 0; start < rows.length;) {
      const number = chunks.length + 1;
      let low = 1;
      let high = rows.length - start;
      let count = 0;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        if (render(directory, title, rows.slice(start, start + middle), number, rows.length, true).length <= maxPageBytes) {
          count = middle;
          low = middle + 1;
        } else high = middle - 1;
      }
      if (!count) throw new RangeError(`Judicial row exceeds page budget (${maxPageBytes}): ${directory}`);
      chunks.push(rows.slice(start, start + count));
      start += count;
    }
    chunks.forEach((chunk, index) => {
      const bytes = render(directory, title, chunk, index + 1, chunks.length, index + 1 < chunks.length);
      if (bytes.length > maxPageBytes) throw new RangeError("Judicial page exceeds page budget");
      files.set(pageFile(directory, index + 1), bytes);
    });
  }

  const views = [
    ...JUDICIAL_PARTY_GROUPS.map((group) => ({ ...group, records: selected.filter((record) => parties.get(record.id) === group) })),
    { name: "全部司法相關紀錄", directory: "all", records: selected },
    ...JUDICIAL_CATEGORIES.map((category) => ({ ...category, records: selected.filter((record) => record.categories.includes(category.name)) })),
  ];
  writePages("judicial", "司法案件：既有分類目錄", views.map((view) => (file) => `<li><a href="${escapeHtml(path.posix.relative(path.posix.dirname(file), `judicial/${view.directory}/index.html`))}">${escapeHtml(view.name)}</a>（${view.records.length} 筆紀錄，非人數或案件數）</li>`));
  for (const view of views) {
    const rows = view.records.map((record) => (file) => `<li data-record-id="${escapeHtml(record.id)}"><a href="${escapeHtml(path.posix.relative(path.posix.dirname(file), `records/${record.id}.html`))}">${escapeHtml(record.name)}</a><p>${escapeHtml(record.summary)}</p><small>既有司法分類：${escapeHtml(record.categories.filter((category) => categoryNames.has(category)).join("、"))}；來源限制與程序請讀完整紀錄。政黨導覽：${escapeHtml(parties.get(record.id).name)}（依來源時點；非即時黨籍；詳完整紀錄）</small></li>`);
    writePages(`judicial/${view.directory}`, view.name, rows);
  }
  return files;
}
