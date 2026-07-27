import assert from "node:assert/strict";
import test from "node:test";

import { mergeCleanupMetadata } from "../data/record-helpers.mjs";

test("record cleanup appends sources without replacing existing sources", () => {
  const originalSource = { title: "官方來源", url: "https://example.com/official" };
  const screenshotSource = { title: "使用者提供截圖", url: "" };

  const result = mergeCleanupMetadata(
    { sources: [originalSource], aiNotes: "原注意事項。" },
    { addSources: [screenshotSource] },
  );

  assert.deepEqual(result.sources, [originalSource, screenshotSource]);
});

test("record cleanup appends AI notes after the existing note", () => {
  const result = mergeCleanupMetadata(
    { sources: [], aiNotes: "原注意事項。" },
    { appendAiNotes: "新增限制。" },
  );

  assert.equal(result.aiNotes, "原注意事項。 新增限制。");
});

test("record cleanup does not duplicate an appended source", () => {
  const screenshotSource = { title: "使用者提供截圖", url: "", date: "2026-07-27" };

  const result = mergeCleanupMetadata(
    { sources: [screenshotSource], aiNotes: "" },
    { addSources: [screenshotSource] },
  );

  assert.deepEqual(result.sources, [screenshotSource]);
});

test("record cleanup does not duplicate an appended AI note", () => {
  const result = mergeCleanupMetadata(
    { sources: [], aiNotes: "原注意事項。 新增限制。" },
    { appendAiNotes: "新增限制。" },
  );

  assert.equal(result.aiNotes, "原注意事項。 新增限制。");
});

test("record cleanup can update the review date", () => {
  const result = mergeCleanupMetadata(
    { sources: [], aiNotes: "", lastReviewed: "2026-06-25" },
    { lastReviewed: "2026-07-27" },
  );

  assert.equal(result.lastReviewed, "2026-07-27");
});
