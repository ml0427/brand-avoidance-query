import assert from "node:assert/strict";
import test from "node:test";
import { compileRecords } from "../data/compile-records.mjs";
import { matchRecords } from "../app-core.mjs";
import { generateSite } from "../scripts/build-ai-site.mjs";

const indexHtml = generateSite({ records: [] }).files.get("index.html").toString();
const brands = compileRecords();
const candidateCheckUrl = "https://guilty.policy2026.workers.dev/";

test("首頁保留候選人前科查核站的可點擊原始網址", () => {
  assert(indexHtml.includes(`href="${candidateCheckUrl}"`));
});

test("外部查核資源不會被誤當成避雷資料卡搜尋鍵", () => {
  assert.deepEqual(matchRecords(brands, candidateCheckUrl, { mode: "partial" }), []);
  assert.deepEqual(matchRecords(brands, "候選人前科查核站", { mode: "partial" }), []);
});
