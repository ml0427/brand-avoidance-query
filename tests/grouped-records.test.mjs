import assert from "node:assert/strict";
import test from "node:test";
import { compileRecords } from "../data/compile-records.mjs";
import { matchRecords, identityTerms } from "../app-core.mjs";

const records = compileRecords();
const exact = (query) => matchRecords(records, query);

test("roster members are direct canonical records, not aliases hidden in a group", () => {
  for (const name of ["李乾龍", "黃建賓", "全莊子辰", "何宗霖", "王美月", "王娟萍", "蔡康永", "王耀慶", "統一聯盟黨", "李樺倫", "陳孟森", "洪清涯", "荒野保護協會", "食農教育點子膠囊"]) {
    const matches = exact(name);
    assert(matches.some(({ record, matchedTerms }) => record.name === name && matchedTerms.some(({ field }) => field === "name")), name);
  }
  for (const [first, second] of [["何宗霖", "全莊子辰"], ["蔡康永", "王耀慶"], ["王美月", "張至滿"], ["李乾龍", "黃建賓"]]) {
    const left = exact(first).map(({ recordId }) => recordId);
    assert(!exact(second).some(({ recordId }) => left.includes(recordId)), `${first} / ${second}`);
  }
});

test("different brands have independent records without turning alternate names into new people", () => {
  for (const [query, name] of [["TikTok", "TikTok"], ["Palladium Boots", "Palladium"], ["Redmi", "Redmi"], ["Salomon", "Salomon"], ["林鳳營", "林鳳營"], ["每日 C", "每日C"]]) {
    assert(exact(query).some(({ record }) => record.name === name), `${query} -> ${name}`);
  }
  assert.deepEqual(exact("Kevin Tsai").map(({ recordId }) => recordId), exact("蔡康永").map(({ recordId }) => recordId));
  assert.deepEqual(exact("Dee Hsu").map(({ recordId }) => recordId), exact("小S").map(({ recordId }) => recordId));
});

test("FamilyMart CMNO and concentrate evidence are isolated to each SKU", () => {
  const cmnos = ["1147599", "1413875", "2921851", "2970555", "2970573", "2970591"];
  const ids = new Set();
  for (const cmno of cmnos) {
    const hits = exact(cmno);
    assert.equal(hits.length, 1, cmno);
    const { record, recordId } = hits[0];
    ids.add(recordId);
    assert.equal(record.lastReviewed, "2026-06-30");
    assert.equal(record.sources.length, 1);
    assert(record.sources[0].url.endsWith(`/${cmno}`));
    for (const other of cmnos.filter((value) => value !== cmno)) {
      assert(!identityTerms(record).some(({ value }) => value.includes(other)), `${cmno} must not own ${other}`);
    }
  }
  assert.equal(ids.size, cmnos.length);
});

test("personal decisions and source limits survive splitting without exact generic aliases", () => {
  const coach = exact("何宗霖").find(({ record }) => record.name === "何宗霖").record;
  assert.equal(coach.status, "personal");
  assert.equal(coach.lastReviewed, "2026-07-16");
  assert.match(coach.summary, /不能|不推定|不可/u);
  const puma = exact("PUMA").find(({ record }) => record.name === "PUMA").record;
  assert.match(puma.summary, /29\.06%/u);
  assert.match(puma.summary, /待|未完成/u);
  for (const query of ["牙刷", "果汁", "中國製", "高露潔", "FILA Taiwan", "光泉一日快充高C檸檬飲"]) {
    assert.equal(exact(query).length, 0, query);
  }
});

test("remaining subsidiary brands and origin-specific SKUs do not inherit blanket parent claims", () => {
  for (const name of ["ROMWE", "Mercusys", "Tapo", "VIGI", "HiLook", "Imou", "容聲"]) {
    const own = exact(name).find(({ record }) => record.name === name)?.record;
    assert(own, name);
    assert.equal(own.status, "watchlist");
    assert.deepEqual(own.sources, []);
  }
  const tea = exact("茶裏王 茉莉龍井").find(({ record }) => record.name === "茶裏王 茉莉龍井").record;
  const otherTea = exact("茶裏王 正山小種").find(({ record }) => record.name === "茶裏王 正山小種").record;
  assert.equal(tea.country, "中國");
  assert.equal(otherTea.country, "中國");
  assert(!otherTea.sources.some(({ url }) => url.startsWith("evidence/")), "Other SKU must not inherit the photographed bottle");
  const pear = exact("4711595602307");
  assert.equal(pear.length, 1);
  assert.equal(pear[0].record.name, "纖享樂 梨在身邊 冰糖燉梨");
  const peach = exact("纖享樂 蜜桃罐頭").find(({ record }) => record.name === "纖享樂 蜜桃罐頭").record;
  assert.equal(peach.country, "");
  assert.equal(peach.sources.length, 1);
  assert(peach.sources[0].url.startsWith("https://biggo.com.tw/"));
  assert(!peach.identifiers.includes("條碼：4711595602307"));
});
