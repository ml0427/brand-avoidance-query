import assert from "node:assert/strict";
import test from "node:test";

let shouldRenderResults;

try {
  ({ shouldRenderResults } = await import("../query-display-state.mjs"));
} catch {
  shouldRenderResults = undefined;
}

const emptyFilters = {
  confidence: "",
  status: "",
  category: "",
  reason: "",
};

function requireDisplayResolver() {
  assert.equal(
    typeof shouldRenderResults,
    "function",
    "query-display-state.mjs must export shouldRenderResults()",
  );
  return shouldRenderResults;
}

test("初始空白查詢不渲染結果卡片", () => {
  const resolve = requireDisplayResolver();
  if (!resolve) return;

  assert.equal(
    resolve({ query: "", filters: emptyFilters, blankQuerySubmitted: false }),
    false,
  );
});

test("輸入關鍵字後渲染結果卡片", () => {
  const resolve = requireDisplayResolver();
  if (!resolve) return;

  assert.equal(
    resolve({ query: "味全", filters: emptyFilters, blankQuerySubmitted: false }),
    true,
  );
});

test("空白搜尋欄按 Enter 後渲染全部結果", () => {
  const resolve = requireDisplayResolver();
  if (!resolve) return;

  assert.equal(
    resolve({ query: "", filters: emptyFilters, blankQuerySubmitted: true }),
    true,
  );
});

test("已選擇篩選條件時即使搜尋欄空白也渲染結果", () => {
  const resolve = requireDisplayResolver();
  if (!resolve) return;

  assert.equal(
    resolve({
      query: "",
      filters: { ...emptyFilters, status: "personal" },
      blankQuerySubmitted: false,
    }),
    true,
  );
});
