import path from "node:path";

export const CATALOG_PAGE_LIMIT = 65536;

const ROOT_PAGE = "catalog/index.html";
const SECTIONS = ["A-Z", "中文首字", "數字", "其他文字／符號"];
const escapeHtml = (value) => String(value).replace(/[&<>"']/gu, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
const compareUtf8 = (a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b));
const relativeHref = (file, target) => path.posix.relative(path.posix.dirname(file), target);
const pageFile = (file, number) => number === 1 ? file : path.posix.join(path.posix.dirname(file), `page-${number}.html`);
const slug = (character) => character.codePointAt(0).toString(16);

function sectionFor(character) {
  if (/^[a-zA-Z]$/u.test(character)) return 0;
  if (/^\p{Script=Han}$/u.test(character)) return 1;
  if (/^\p{Decimal_Number}$/u.test(character)) return 2;
  return 3;
}

const FIELD_RANK = new Map([["name", 0], ["aliases", 1], ["identifiers", 2]]);
const fieldRank = (field) => FIELD_RANK.get(field) ?? 3;
const compareMatch = (left, right) => fieldRank(left.field) - fieldRank(right.field) ||
  compareUtf8(left.key, right.key) || compareUtf8(left.value, right.value) || compareUtf8(left.field, right.field);

function matchRows(entries) {
  const representatives = new Map();
  for (const { key, matches } of entries) {
    for (const match of matches) {
      const candidate = { ...match, key };
      const previous = representatives.get(match.recordId);
      if (!previous || compareMatch(candidate, previous) < 0) representatives.set(match.recordId, candidate);
    }
  }
  return [...representatives.values()].sort((left, right) => compareUtf8(left.key, right.key) || compareUtf8(left.recordId, right.recordId)).map((match) => ({
    section: "",
    render: (file, branch) => `<li data-key="${escapeHtml(match.key)}" data-match-field="${escapeHtml(match.field)}" data-record-name="${escapeHtml(match.name)}"><span class="tree-branch" aria-hidden="true">${branch}</span><span class="tree-label"><a href="${escapeHtml(relativeHref(file, `records/${match.recordId}.html`))}">${escapeHtml(match.value)}</a>${match.name !== match.value ? ` <small>(${escapeHtml(match.name)})</small>` : ""}</span></li>`,
  }));
}

function renderRows(rows, file) {
  let body = "";
  for (let start = 0; start < rows.length;) {
    let end = start + 1;
    while (end < rows.length && rows[end].section === rows[start].section) end++;
    const section = rows[start].section;
    const continues = end < rows.length;
    const indent = section ? (continues ? "|   " : "    ") : "";
    body += `<section>${section ? `<h2 class="tree-heading"><span class="tree-branch" aria-hidden="true">${continues ? "|-- " : "&#96;-- "}</span>${escapeHtml(section)}</h2>` : ""}<ul class="catalog-tree">`;
    for (let index = start; index < end; index++) {
      body += rows[index].render(file, `${indent}${index + 1 < end ? "|-- " : "&#96;-- "}`);
    }
    body += "</ul></section>";
    start = end;
  }
  return body || "<p>沒有目錄項目。</p>";
}

/** Build snapshot-relative HTML pages without reading records or writing files. */
export function buildNameCatalog(entries, { renderPage, recordCount, maxPageBytes = CATALOG_PAGE_LIMIT } = {}) {
  if (typeof renderPage !== "function") throw new TypeError("renderPage must be a function returning an HTML Buffer");
  if (!Number.isSafeInteger(maxPageBytes) || maxPageBytes < 1 || maxPageBytes > CATALOG_PAGE_LIMIT) {
    throw new RangeError("Invalid maxPageBytes budget");
  }
  if (!Array.isArray(entries)) throw new TypeError("entries must be an array");
  const keys = new Set();
  const records = new Map();
  for (const entry of entries) {
    if (typeof entry?.key !== "string" || !entry.key || !Array.isArray(entry.matches) || !entry.matches.length) {
      throw new TypeError("Each catalog entry needs a nonempty key and matches");
    }
    if (keys.has(entry.key)) throw new Error(`Duplicate catalog key: ${entry.key}`);
    keys.add(entry.key);
    for (const match of entry.matches) {
      if (typeof match?.recordId !== "string" || !/^[a-z0-9][a-z0-9._-]*$/u.test(match.recordId) ||
          [match.name, match.field, match.value].some((value) => typeof value !== "string")) {
        throw new TypeError("Invalid catalog match or unsafe recordId");
      }
      if (records.has(match.recordId) && records.get(match.recordId) !== match.name) {
        throw new Error(`Conflicting catalog record name: ${match.recordId}`);
      }
      records.set(match.recordId, match.name);
    }
  }
  const totalRecords = recordCount ?? records.size;
  if (!Number.isSafeInteger(totalRecords) || totalRecords < records.size) throw new RangeError("Invalid recordCount");
  const sorted = [...entries].sort((a, b) => compareUtf8(a.key, b.key));
  const files = new Map();

  function render(node, rows, number = 1, total = 1, hasNext = false) {
    const file = pageFile(node.file, number);
    const link = (target, label, rel = "") => `<a${rel ? ` rel="${rel}"` : ""} href="${escapeHtml(relativeHref(file, target))}">${label}</a>`;
    const title = node.file === ROOT_PAGE ? "完整名稱目錄" : "名稱目錄";
    const navigation = `<nav aria-label="目錄導覽">${link(ROOT_PAGE, "名稱目錄首頁")}${node.parent ? ` ${link(node.parent, "上一層")}` : ""}</nav>`;
    const pagination = `<nav aria-label="分頁"><span>第 ${number} 頁 / 共 ${total} 頁</span>${number > 1 ? ` ${link(pageFile(node.file, number - 1), "上一頁", "prev")}` : ""}${hasNext ? ` ${link(pageFile(node.file, number + 1), "下一頁", "next")}` : " <span>結束</span>"}</nav>`;
    const body = `${navigation}<h1>${title}${node.prefix ? `：${escapeHtml(node.prefix)}` : ""}</h1>${node.file === ROOT_PAGE ? `<p>共 ${totalRecords} 筆紀錄。</p>` : ""}${renderRows(rows, file)}${pagination}`;
    const bytes = renderPage(title, body, "../".repeat(file.split("/").length + 1) + "llms.txt");
    if (!Buffer.isBuffer(bytes)) throw new TypeError("renderPage must return an HTML Buffer");
    return bytes;
  }

  const root = { file: ROOT_PAGE, prefix: "", parent: null };
  if (render(root, []).length > maxPageBytes) throw new RangeError("maxPageBytes is too small for catalog page navigation");

  function writePages(node, rows) {
    const single = render(node, rows);
    if (single.length <= maxPageBytes) {
      files.set(node.file, single);
      return;
    }

    // Repack when the final page count adds bytes, including at digit boundaries.
    let totalHint = 1;
    for (let attempt = 0; attempt <= rows.length; attempt++) {
      const chunks = [];
      let start = 0;
      while (start < rows.length) {
        const number = chunks.length + 1;
        const remaining = rows.slice(start);
        if (render(node, remaining, number, totalHint).length <= maxPageBytes) {
          chunks.push(remaining);
          break;
        }
        let low = 1;
        let high = remaining.length - 1;
        let count = 0;
        while (low <= high) {
          const middle = Math.floor((low + high) / 2);
          if (render(node, remaining.slice(0, middle), number, totalHint, true).length <= maxPageBytes) {
            count = middle;
            low = middle + 1;
          } else {
            high = middle - 1;
          }
        }
        if (!count) throw new RangeError(`Catalog row exceeds maxPageBytes (${maxPageBytes}) at ${pageFile(node.file, number)}`);
        chunks.push(remaining.slice(0, count));
        start += count;
      }
      const pages = chunks.map((chunk, index) => render(node, chunk, index + 1, chunks.length, index + 1 < chunks.length));
      if (pages.every((bytes) => bytes.length <= maxPageBytes)) {
        pages.forEach((bytes, index) => files.set(pageFile(node.file, index + 1), bytes));
        return;
      }
      totalHint = chunks.length;
    }
    throw new Error("Unable to paginate catalog within maxPageBytes; renderPage must be deterministic");
  }

  const pending = [];
  function groupLink(group, character, parent, section = "", prefix = character) {
    const file = path.posix.join(path.posix.dirname(parent), slug(character), "index.html");
    pending.push({ entries: group, file, parent, prefix });
    return {
      section,
      render: (from, branch) => `<li><span class="tree-branch" aria-hidden="true">${branch}</span><a href="${escapeHtml(relativeHref(from, file))}">${escapeHtml(prefix)}</a></li>`,
    };
  }

  const initials = new Map();
  for (const entry of sorted) {
    const first = Array.from(entry.key)[0];
    if (!initials.has(first)) initials.set(first, []);
    initials.get(first).push(entry);
  }
  const rootRows = [...initials].sort(([a], [b]) => sectionFor(a) - sectionFor(b) || compareUtf8(a, b)).map(([character, group]) => {
    const section = sectionFor(character);
    return groupLink(group, character, ROOT_PAGE, SECTIONS[section], section === 0 ? character.toUpperCase() : character);
  });
  writePages(root, rootRows);

  // An explicit queue avoids stack growth for deeply nested prefixes.
  for (let index = 0; index < pending.length; index++) {
    const node = pending[index];
    const rows = matchRows(node.entries);
    const leaf = render(node, rows);
    if (leaf.length <= maxPageBytes) {
      files.set(node.file, leaf);
      continue;
    }
    if (node.entries.length === 1) {
      writePages(node, rows);
      continue;
    }
    const first = Array.from(node.entries[0].key);
    const last = Array.from(node.entries.at(-1).key);
    let depth = 0;
    while (depth < first.length && first[depth] === last[depth]) depth++;
    const common = first.slice(0, depth).join("");
    const children = new Map();
    const terminal = [];
    for (const entry of node.entries) {
      const character = Array.from(entry.key)[depth];
      if (character === undefined) terminal.push(entry);
      else {
        if (!children.has(character)) children.set(character, []);
        children.get(character).push(entry);
      }
    }
    const terminalRows = matchRows(terminal).map((row) => ({ ...row, section: "完整名稱／識別碼" }));
    const childRows = [...children].map(([character, group]) => groupLink(group, character, node.file, "依下一字分組", common + character));
    writePages(node, [...terminalRows, ...childRows]);
  }
  return files;
}
