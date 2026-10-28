import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import { compileRecords } from "../data/compile-records.mjs";
import { validateRecords } from "../scripts/validate-brand-records.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validatorPath = path.join(rootDir, "scripts", "validate-brand-records.mjs");
const records = compileRecords();
const fixture = {
  id: "validation-fixture",
  name: "Validation Fixture",
  aliases: ["Fixture Alias"],
  identifiers: ["fixture.example"],
  country: "",
  categories: [],
  avoidReasons: ["Fixture only"],
  confidence: "medium",
  status: "personal",
  summary: "Synthetic record for validation tests",
  aiNotes: "Do not publish this fixture",
  sources: [],
  lastReviewed: "2026-10-28",
};
const validate = (input, options = {}) => validateRecords(input, { defaultSmoke: false, ...options });
const hasError = (result, check) => result.errors.some((error) => error.check === check);

test("compiled source passes the zero-warning zero-error validation gate", () => {
  const result = validateRecords(records);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.summary.records, records.length);
  assert.equal(result.summary.warnings, 0);
  assert.equal(result.summary.errors, 0);
});

test("adding a valid source record does not require changing a fixed corpus count", () => {
  const result = validate([...records, fixture]);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.summary.records, records.length + 1);
});

test("validator rejects traditional, simplified, English and fullwidth Taiwan tax-ID labels", () => {
  const values = [
    ...["統一編號", "统一编号", "統編", "稅籍編號", "稅籍號碼", "食品統一編號", "Tax ID", "Taiwan Company Tax ID"].map((marker) => `${marker} 12345678`),
    "統一編號：１２３４５６７８",
    "統一編號\n12345678",
    "统一编号\r\n12345678",
    "Tax ID\t12345678",
  ];
  for (const value of values) {
    const result = validate([{ ...fixture, aiNotes: value }]);
    assert.equal(result.ok, false, value);
    assert.ok(hasError(result, "tax-id-data"), value);
  }
});

test("tax-ID defense checks identity, prose, source notes and unknown metadata without dropping them", () => {
  for (const patch of [
    { aliases: ["統一編號 12345678"] },
    { identifiers: ["統編 12345678"] },
    { summary: "稅籍號碼 12345678" },
    { sources: [{ title: "Fixture", url: "", date: "", note: "统一编号 12345678" }] },
    { privateMetadata: { note: "Tax ID 12345678" } },
    { privateMetadata: { "統一編號": 12345678 } },
  ]) {
    const result = validate([{ ...fixture, ...patch }]);
    assert.equal(result.ok, false);
    assert.ok(hasError(result, "tax-id-data"), JSON.stringify(patch));
  }
});

test("validator allows policy notes naming tax IDs without storing a value and preserves barcodes", () => {
  const result = validate([{
    ...fixture,
    aiNotes: "不保存統一編號或稅籍編號。",
    identifiers: ["條碼：4711234567890"],
  }]);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.summary.warnings, 0);
  assert.equal(result.summary.errors, 0);
});

test("generic searchable fields remain fatal, without blocking exploratory query terms", () => {
  for (const field of ["name", "aliases", "identifiers"]) {
    const result = validate([{ ...fixture, [field]: field === "name" ? "餐廳" : ["餐廳"] }]);
    assert.equal(result.ok, false);
    assert.ok(hasError(result, "generic-search-fields"), field);
  }
  assert.ok(hasError(validate([{ ...fixture, identifiers: ["型號：APP"] }]), "generic-search-fields"));
  const result = validate([{ ...fixture, country: "餐廳", summary: "餐廳" }], { notExpects: [{ query: "餐廳", id: fixture.id }] });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
});

test("confirmed source, ISO/calendar dates, alert reasons and explicit safe IDs remain required", () => {
  assert.ok(hasError(validate([{ ...fixture, status: "confirmed", sources: [] }]), "record-validation"));
  assert.ok(hasError(validate([{ ...fixture, temporaryUntil: "2026-12-31" }]), "record-validation"));
  for (const field of ["lastReviewed", "temporaryUntil", "reviewAfter"]) {
    for (const date of ["2026/10/28", "2026-02-29", "2026-02-31", "2026-13-01"]) {
      assert.ok(hasError(validate([{ ...fixture, [field]: date, temporaryAlertReason: "Fixture only" }]), "record-dates"));
    }
  }
  assert.equal(validate([{ ...fixture, reviewAfter: "2028-02-29" }]).ok, true);
  for (const id of [undefined, "", "../unsafe", "wrong/segment", "con", "a\n"]) {
    assert.ok(hasError(validate([{ ...fixture, id }]), "record-ids"));
  }
  assert.ok(hasError(validate([fixture, { ...fixture }]), "duplicate-ids"));
  assert.equal(validate({}).ok, false);
});

test("target, positive, expect and not-expect probes work through the pure entry point", () => {
  const options = {
    targetIds: [fixture.id],
    positives: [fixture.name, "Fixture Alias"],
    expects: [{ query: "fixture.example", id: fixture.id }],
    notExpects: [{ query: "Unrelated Entity", id: fixture.id }],
    expectAny: ["Fixture Alias"],
    negatives: ["Unrelated Entity"],
  };
  assert.equal(validate([fixture], options).ok, true);
  assert.ok(hasError(validate([fixture], { targetIds: ["missing"] }), "target-id"));
  assert.ok(hasError(validate([fixture], { positives: ["missing"] }), "positive-query"));
  assert.ok(hasError(validate([fixture], { expects: [{ query: "missing", id: fixture.id }] }), "expect-query"));
  assert.ok(hasError(validate([fixture], { notExpects: [{ query: fixture.name, id: fixture.id }] }), "not-expect-query"));
  assert.ok(hasError(validate([fixture], { negatives: [fixture.name] }), "negative-query"));
});

test("pure validation neither mutates input records nor options", () => {
  const input = structuredClone(records);
  const options = { targetIds: ["weichuan-foods"], positives: ["味全"] };
  const snapshot = structuredClone({ input, options });
  assert.equal(validate(input, options).ok, true);
  assert.deepEqual({ input, options }, snapshot);
});

test("importing the CLI module does not execute main or produce output", () => {
  const result = spawnSync(process.execPath, ["--input-type=module", "--eval", "await import(process.argv[1]);", pathToFileURL(validatorPath).href], { cwd: rootDir, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("default source CLI works without retired JSON/merge/UI or README and keeps the zero-warning gate", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "brand-source-validator-"));
  try {
    fs.cpSync(path.join(rootDir, "data"), path.join(tempDir, "data"), { recursive: true });
    fs.cpSync(path.join(rootDir, "app-core.mjs"), path.join(tempDir, "app-core.mjs"));
    fs.mkdirSync(path.join(tempDir, "scripts"));
    fs.cpSync(validatorPath, path.join(tempDir, "scripts", "validate-brand-records.mjs"));
    const cli = path.join(tempDir, "scripts", "validate-brand-records.mjs");
    const result = spawnSync(process.execPath, [cli, "--no-git-diff-check", "--target-id", "weichuan-foods", "--positive", "味全", "--expect", "TikTok=>bytedance", "--not-expect", "Unrelated Entity=>bytedance", "--json"], { cwd: tempDir, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const output = JSON.parse(result.stdout);
    assert.equal(output.ok, true);
    assert.equal(output.summary.records, records.length);
    assert.equal(output.summary.warnings, 0);
    assert.equal(output.summary.errors, 0);
    assert.ok(output.passed.some(({ check }) => check === "syntax-check"));
    const withWarning = spawnSync(process.execPath, [cli, "--no-syntax-check", "--json"], { cwd: tempDir, encoding: "utf8" });
    assert.equal(withWarning.status, 1);
    assert.equal(JSON.parse(withWarning.stdout).summary.warnings, 1);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
