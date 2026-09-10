import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { filterBrands, normalizeBrandList } from "../app-core.mjs";

const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const brands = normalizeBrandList(
  JSON.parse(await readFile(new URL("../brands.json", import.meta.url), "utf8")),
);
const candidateCheckUrl = "https://guilty.policy2026.workers.dev/";

test("首頁保留候選人前科查核站的可點擊原始網址", () => {
  assert.match(
    indexHtml,
    /<a href="https:\/\/guilty\.policy2026\.workers\.dev\/" target="_blank" rel="noreferrer">開啟候選人前科查核站<\/a>/u,
  );
});

test("外部查核資源不會被誤當成避雷資料卡搜尋鍵", () => {
  assert.deepEqual(filterBrands(brands, { query: candidateCheckUrl }), []);
  assert.deepEqual(filterBrands(brands, { query: "候選人前科查核站" }), []);
});
