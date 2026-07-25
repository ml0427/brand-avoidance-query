import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validatorPath = path.join(rootDir, "scripts", "validate-brand-records.mjs");
const brandsPath = path.join(rootDir, "brands.json");

function validate(dataPath) {
  return spawnSync(
    process.execPath,
    [
      validatorPath,
      "--data",
      dataPath,
      "--no-default-smoke",
      "--no-syntax-check",
      "--no-git-diff-check",
      "--json",
    ],
    { cwd: rootDir, encoding: "utf8" },
  );
}

test("validator rejects Taiwan tax-id labels in record data", () => {
  const brands = JSON.parse(fs.readFileSync(brandsPath, "utf8"));
  const taxIdMarkers = [
    "統一編號",
    "统一编号",
    "統編",
    "稅籍編號",
    "稅籍號碼",
    "食品統一編號",
    "Tax ID",
  ];
  const contaminated = brands.map((brand, index) => ({
    ...brand,
    aiNotes: `${brand.aiNotes ?? ""} ${taxIdMarkers[index % taxIdMarkers.length]} 12345678`,
  }));
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "brand-tax-id-regression-"));
  const dataPath = path.join(tempDir, "brands.json");

  try {
    fs.writeFileSync(dataPath, JSON.stringify(contaminated), "utf8");
    const result = validate(dataPath);
    const output = JSON.parse(result.stdout);

    assert.notEqual(result.status, 0, "tax-id labels must make the validator fail");
    assert.ok(
      output.errors.some((error) => error.check === "tax-id-data"),
      "tax-id-data must report the forbidden labels",
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("validator rejects simplified Chinese Taiwan tax-id labels", () => {
  const brands = JSON.parse(fs.readFileSync(brandsPath, "utf8"));
  const contaminated = brands.map((brand, index) => (
    index === 0
      ? { ...brand, aiNotes: `${brand.aiNotes ?? ""} 统一编号 12345678` }
      : brand
  ));
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "brand-tax-id-simplified-"));
  const dataPath = path.join(tempDir, "brands.json");

  try {
    fs.writeFileSync(dataPath, JSON.stringify(contaminated), "utf8");
    const result = validate(dataPath);

    assert.notEqual(result.status, 0, "simplified tax-id labels must make the validator fail");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("validator allows policy notes that name tax IDs without storing a value", () => {
  const brands = JSON.parse(fs.readFileSync(brandsPath, "utf8"));
  const policyOnly = brands.map((brand, index) => (
    index === 0
      ? { ...brand, aiNotes: `${brand.aiNotes ?? ""} 不保存統一編號或稅籍編號。` }
      : brand
  ));
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "brand-tax-id-policy-note-"));
  const dataPath = path.join(tempDir, "brands.json");

  try {
    fs.writeFileSync(dataPath, JSON.stringify(policyOnly), "utf8");
    const result = validate(dataPath);

    assert.equal(
      result.status,
      0,
      "a policy note without a tax-ID value must not be treated as stored tax-ID data",
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
