import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { compileRecords } from "../data/compile-records.mjs";
import { identityTerms } from "../app-core.mjs";
import { buildNameCatalog } from "./lib/name-catalog.mjs";
import { ROOT, SHARD_LIMIT, compareUtf8, jsonBytes, sha256, descriptor, safeRelativePath, loadSchemas } from "./lib/site-format.mjs";

export const PUBLIC_RESOURCES = [
  { title: "候選人司法查核資源（外部網站，非本站避雷紀錄）", url: "https://guilty.policy2026.workers.dev/" },
  { title: "彰化縣衛生局油品下游公告", url: "https://www.chshb.gov.tw/node/219119868" },
  { title: "油品下游官方 PDF 名單", url: "https://www.chshb.gov.tw/sites/default/files/2026-07/4-6%E6%9C%88%E5%8F%97%E5%BD%B1%E9%9F%BF%E6%B2%B9%E5%93%81%E4%B8%8B%E6%B8%B8%E6%A5%AD%E8%80%85%E6%B8%85%E5%96%AE.pdf" },
];

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/gu, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function html(title, body, llms = "../../../llms.txt") {
  return Buffer.from(`<!doctype html>\n<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><link rel="describedby" href="${escapeHtml(llms)}"><style>body{margin:0;color:#222;background:#fff;font:16px/1.65 system-ui,sans-serif;letter-spacing:0}main{max-width:72rem;padding:24px;margin:auto}h1{font-size:26px;line-height:1.3}h2{font-size:20px}a{color:#006b70}code,dd,a{overflow-wrap:anywhere}dt{font-weight:600;margin-top:12px}dd{margin-left:0}ul,ol{padding-left:24px}nav{display:flex;gap:20px;flex-wrap:wrap}li{margin-bottom:8px}small{color:#555}.catalog-tree,.tree-heading{font:15px/1.7 ui-monospace,Consolas,monospace;letter-spacing:0}.catalog-tree{list-style:none;padding:0;margin:0}.catalog-tree li,.tree-heading{display:flex;align-items:baseline;margin:0;min-width:0}.tree-heading{font-weight:600;margin-top:12px}.tree-branch{white-space:pre;flex:none}.tree-label{min-width:0;overflow-wrap:anywhere}</style></head><body><main>${body}</main></body></html>\n`, "utf8");
}

function renderValue(value) {
  if (Array.isArray(value)) return `<ol>${value.map((item) => `<li>${renderValue(item)}</li>`).join("")}</ol>`;
  if (value && typeof value === "object") return `<dl>${Object.entries(value).map(([key, item]) => `<dt>${escapeHtml(key)}</dt><dd>${renderValue(item)}</dd>`).join("")}</dl>`;
  return escapeHtml(value ?? "");
}

function recordHtml(record, sourceLinks) {
  const fields = Object.entries(record).map(([key, value]) => {
    const rendered = ["lastReviewed", "temporaryUntil", "reviewAfter"].includes(key) && value
      ? `<time datetime="${escapeHtml(value)}">${escapeHtml(value)}</time>` : renderValue(value);
    return `<dt>${escapeHtml(key)}</dt><dd data-field="${escapeHtml(key)}">${rendered}</dd>`;
  }).join("");
  const sources = sourceLinks.map((source) => `<li><a href="${escapeHtml(source.url)}" rel="noreferrer">${escapeHtml(record.sources[source.sourceIndex].title || source.originalUrl)}</a></li>`).join("");
  return html(record.name, `<nav><a href="../catalog/index.html">名稱目錄</a><a href="${record.id}.json">JSON</a></nav><article data-record-id="${record.id}"><h1>${escapeHtml(record.name)}</h1><p>個人風險備忘；personal、watchlist、confirmed 不等同法律定論，適用範圍以本筆內容與證據限制為準。</p><dl>${fields}</dl><h2>可讀取的原始來源</h2><ol>${sources}</ol><p>期限以查詢當日的 Asia/Taipei 日期判讀；temporaryUntil 含當日，reviewAfter 當日即待複查。本頁不自動把歷史事件當現行違規。</p></article>`);
}

export function sourceLinksFor(record, evidenceFiles) {
  const links = [];
  for (const [sourceIndex, source] of (record.sources ?? []).entries()) {
    const originalUrl = source.url;
    if (!originalUrl) continue;
    let url;
    if (/^https?:\/\//iu.test(originalUrl)) {
      const parsed = new URL(originalUrl);
      if (parsed.username || parsed.password) throw new Error(`Credentials in source URL: ${record.id}`);
      url = originalUrl;
    } else {
      safeRelativePath(originalUrl);
      if (!originalUrl.startsWith("evidence/") || !evidenceFiles.has(originalUrl)) throw new Error(`Unapproved source evidence: ${originalUrl}`);
      url = `../${originalUrl.split("/").map(encodeURIComponent).join("/")}`;
    }
    links.push({ sourceIndex, originalUrl, url });
  }
  return links;
}

export function loadEvidence(records, { rootDir = ROOT, policy = JSON.parse(fs.readFileSync(path.join(rootDir, "data/public-evidence.json"), "utf8")), requireTracked = true } = {}) {
  if (policy.schemaVersion !== 1 || !Array.isArray(policy.files)) throw new Error("Invalid public evidence policy");
  const approved = new Map();
  for (const file of policy.files) {
    safeRelativePath(file.path);
    if (!/^evidence\/.+\.(png|jpe?g|webp|gif|pdf|txt)$/iu.test(file.path) || !/^[a-f0-9]{64}$/u.test(file.sha256) || approved.has(file.path)) throw new Error(`Invalid evidence approval: ${file.path}`);
    approved.set(file.path, file.sha256);
  }
  const required = new Set(records.flatMap((record) => (record.sources ?? []).map((source) => source.url)).filter((url) => url && !/^https?:\/\//iu.test(url)));
  const files = new Map();
  for (const file of [...required].sort(compareUtf8)) {
    safeRelativePath(file);
    if (!approved.has(file)) throw new Error(`Evidence is not approved: ${file}`);
    let current = rootDir;
    for (const part of file.split("/")) {
      current = path.join(current, part);
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Evidence symlink: ${file}`);
    }
    if (!fs.statSync(current).isFile()) throw new Error(`Not an evidence file: ${file}`);
    if (requireTracked) execFileSync("git", ["ls-files", "--error-unmatch", "--", file], { cwd: rootDir, stdio: "pipe" });
    const bytes = fs.readFileSync(current);
    if (sha256(bytes) !== approved.get(file)) throw new Error(`Evidence checksum changed: ${file}`);
    files.set(file, bytes);
  }
  return files;
}

export function partitionEntries(entries, maxBytes = SHARD_LIMIT) {
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > SHARD_LIMIT) throw new Error("Invalid shard budget");
  const shards = [];
  let chunk = [];
  let chunkBytes = jsonBytes({ schemaVersion: 1, entries: [] }).length;
  for (const entry of entries) {
    const size = jsonBytes(entry).length - 1;
    if (jsonBytes({ schemaVersion: 1, entries: [entry] }).length > maxBytes) throw new Error(`Index entry exceeds shard budget: ${entry.key}`);
    if (chunk.length && chunkBytes + size + 1 > maxBytes) {
      shards.push(chunk);
      chunk = [];
      chunkBytes = jsonBytes({ schemaVersion: 1, entries: [] }).length;
    }
    chunkBytes += size + (chunk.length ? 1 : 0);
    chunk.push(entry);
  }
  if (chunk.length) shards.push(chunk);
  return shards;
}

export function generateSite({ records, evidenceFiles = new Map(), sourceCommit = "0".repeat(40), sourceCommitTime = "1970-01-01T00:00:00Z", sourceDirty = false, maxShardBytes = SHARD_LIMIT }) {
  const snapshot = new Map();
  const identities = new Map();
  const seen = new Set();
  const sortedRecords = [...records].sort((a, b) => compareUtf8(a.id, b.id));
  for (const record of sortedRecords) {
    if (!/^[a-z0-9][a-z0-9._-]*$/u.test(record.id) || seen.has(record.id)) throw new Error(`Duplicate or unsafe record ID: ${record.id}`);
    seen.add(record.id);
    const sourceLinks = sourceLinksFor(record, evidenceFiles);
    const recordBytes = jsonBytes({ schemaVersion: 1, record, sourceLinks });
    const pageBytes = recordHtml(record, sourceLinks);
    snapshot.set(`records/${record.id}.json`, recordBytes);
    snapshot.set(`records/${record.id}.html`, pageBytes);
    const recordDescriptor = descriptor(`../records/${record.id}.json`, recordBytes);
    const pageDescriptor = descriptor(`../records/${record.id}.html`, pageBytes);
    for (const { key, field, value } of identityTerms(record)) {
      const match = { recordId: record.id, name: record.name, field, value, record: recordDescriptor, page: pageDescriptor };
      if (!identities.has(key)) identities.set(key, new Map());
      identities.get(key).set(JSON.stringify([record.id, field, value]), match);
    }
  }
  for (const [file, bytes] of evidenceFiles) snapshot.set(safeRelativePath(file), bytes);
  const entries = [...identities].sort(([a], [b]) => compareUtf8(a, b)).map(([key, matches]) => ({ key, matches: [...matches.values()] }));
  const chunks = partitionEntries(entries, maxShardBytes);
  const indexes = [];
  for (const [index, chunk] of chunks.entries()) {
    const suffix = String(index).padStart(4, "0");
    const file = `index/${suffix}.json`;
    const bytes = jsonBytes({ schemaVersion: 1, entries: chunk });
    snapshot.set(file, bytes);
    indexes.push({ ...descriptor(file, bytes), firstKey: chunk[0].key, lastKey: chunk.at(-1).key, entryCount: chunk.length });
  }
  for (const [file, bytes] of buildNameCatalog(entries, { renderPage: html, recordCount: records.length })) {
    snapshot.set(file, bytes);
  }
  const schemas = {};
  for (const [name, schema] of Object.entries(loadSchemas())) {
    const file = `schemas/${name}.schema.json`;
    const bytes = jsonBytes(schema);
    snapshot.set(file, bytes);
    schemas[name] = descriptor(file, bytes);
  }
  const inventory = jsonBytes({ schemaVersion: 1, files: [...snapshot].sort(([a], [b]) => compareUtf8(a, b)).map(([file, bytes]) => ({ path: file, bytes: bytes.length, sha256: sha256(bytes) })) });
  const dataVersion = sha256(inventory);
  const prefix = `v1/${dataVersion}/`;
  const prefixDescriptor = (item) => ({ ...item, url: `${prefix}${item.url}` });
  const manifest = {
    schemaVersion: 1, searchVersion: 1, dataVersion, sourceCommit, sourceCommitTime, sourceDirty,
    recordCount: records.length, inventory: descriptor(`${prefix}inventory.json`, inventory),
    indexes: indexes.map(prefixDescriptor), catalog: descriptor(`${prefix}catalog/index.html`, snapshot.get("catalog/index.html")),
    recordBase: `${prefix}records/`, schemas: Object.fromEntries(Object.entries(schemas).map(([name, item]) => [name, prefixDescriptor(item)])),
  };
  const files = new Map([...snapshot].map(([file, bytes]) => [`${prefix}${file}`, bytes]));
  files.set(`${prefix}inventory.json`, inventory);
  files.set("manifest.json", jsonBytes(manifest));
  const resources = PUBLIC_RESOURCES.map((item) => `<li><a href="${escapeHtml(item.url)}" rel="noreferrer">${escapeHtml(item.title)}</a></li>`).join("");
  files.set("index.html", html("品牌／公眾人物風險資料", `<h1>品牌／公眾人物風險資料</h1><p>個人風險偏好與公開來源備忘，不是法院判決、官方黑名單或所有品項的事實定論。</p><nav><a href="manifest.json">資料版本 JSON</a><a href="${manifest.catalog.url}">完整名稱目錄</a><a href="llms.txt">AI 讀取契約</a></nav><p>紀錄：${records.length}；資料版本：<code>${dataVersion}</code></p><dl><dt>personal</dt><dd>個人避買／避開選擇，不等於客觀不當或違法。</dd><dt>watchlist</dt><dd>觀察中，需保留脈絡及不確定性。</dd><dt>confirmed</dt><dd>來源支持所列特定理由，不等於法律定罪或全品牌適用。</dd></dl><h2>外部查核資源</h2><ul>${resources}</ul>`, "llms.txt"));
  files.set("llms.txt", Buffer.from(`# Brand Avoidance Query

> 使用者個人避開紀錄與公開來源備忘；不是法律定論。

## 只有網址，不能執行程式

從[名稱目錄](${manifest.catalog.url}) 選 A-Z、中文首字、數字或其他文字／符號的實際字頭連結，再循完整名稱、別名或識別鍵開啟所有命中紀錄。例如「文姿雲」選「文」，不需要猜 UTF-8 排序區間。組別過大才按後續字頭細分；有下一頁時繼續讀到結束。路徑以實際連結為準，不猜頁碼或自行計算 Unicode 檔名。

目錄的查詢鍵數不等於紀錄數、人物數或商品數。部分字搜尋必須檢查所有可能的組別，不能只選查詢片段的首字；這也不是品類探索，搜尋「果汁」不能宣稱已列完所有果汁商品。HTML 讀取本身不等於已核對檔案雜湊。工具截斷、頁面不可讀或版本不明時，回報未完成查詢，不能當無命中。

同一目錄節點及其分頁每個recordId只列一次，優先正式名稱，其次該字頭別名、識別碼；不同ID即使同名仍分開。不同名稱可跨字頭找到同筆，例如Cheap／鄭才暐保留C／鄭兩入口，不是全目錄只留一次。完整別名／識別保留在JSON索引與單筆紀錄，目錄未列出別名字面不等於無命中，需開啟該字頭候選紀錄核對。

僅目錄導覽略過開頭的書名號、左括號與起始引號（Unicode Ps／Pi）、ASCII單雙引號及空白；若無剩餘內容則保留原鍵。接著僅略過緊接Unicode字母、數字或底線的單一開頭@。《功夫道長》選「功」，《陽光女子合唱團》選「陽」，@cheapaoe選C。單獨@、@@、內嵌@、#、+、點等不略過，完整名稱與帳號照常顯示；JSON查詢鍵及精準比對不受這項目錄規則影響。

## 可以執行 reader

先讀 [manifest](manifest.json)，使用同一版本的 JSON 索引與完整單筆紀錄。精準比對 name / aliases / identifiers；部分字只列候選。下載索引與紀錄時核對大小及 SHA-256。檔案失效、雜湊或版本錯誤時重取 manifest，整輪最多重試一次；仍失敗就回報不可用。本站沒有舊格式 fallback。

## 判讀紀錄

不同人物、獨立品牌與 SKU 各有自己的紀錄；同一人的中英文名／藝名等仍是別名。共用來源只作背景，不把其他成員的言論、罪責、產地、制裁或控制關係套到本對象。同名的多筆命中仍需各自閱讀，不能自動合併。

讀完整 record、aiNotes、sourceLinks、來源 note 與複查期限，不憑目錄名稱下結論。personal 是使用者個人選擇，理由可以只是主觀不喜歡；不要求以外部證據證明偏好。客觀事實與來源限制仍須分開。無命中不等於安全；讀取失敗不等於無命中。不自動下載圖片。期限以查詢當日 Asia/Taipei 判讀，不把舊事件當現行違規。

- [首頁](index.html)
- [Manifest](manifest.json): JSON 格式、版本、索引分片與檔案雜湊；exact 自動選片，partial 掃描全部 JSON 索引。
- [格式定義](${manifest.schemas.record.url}): 單筆 JSON 保留全部來源欄位，公開來源連結以 sourceLinks 解析。
`, "utf8"));
  return { files, manifest };
}

export function gitMetadata() {
  const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
  return { sourceCommit: git("rev-parse", "HEAD"), sourceCommitTime: git("show", "-s", "--format=%cI", "HEAD"), sourceDirty: Boolean(git("status", "--porcelain", "--untracked-files=no")) };
}

export function writeSite(site, outputDir = path.join(ROOT, "_site")) {
  const target = path.resolve(outputDir);
  if (target !== path.resolve(ROOT, "_site")) throw new Error("Build output must be the project _site directory");
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isSymbolicLink() || !fs.statSync(target).isDirectory()) throw new Error("Unsafe build output");
    fs.rmSync(target, { recursive: true, force: true });
  }
  for (const [file, bytes] of site.files) {
    safeRelativePath(file);
    const output = path.join(target, file);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, bytes);
  }
}

export function buildSite() {
  const records = compileRecords();
  const evidenceFiles = loadEvidence(records);
  const site = generateSite({ records, evidenceFiles, ...gitMetadata() });
  writeSite(site);
  return site;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { manifest, files } = buildSite();
    console.log(`Built ${manifest.recordCount} records; ${manifest.indexes.length} index shards; ${files.size} files; version ${manifest.dataVersion}`);
  } catch (error) {
    console.error(`Build failed: ${error.message}`);
    process.exitCode = 1;
  }
}
