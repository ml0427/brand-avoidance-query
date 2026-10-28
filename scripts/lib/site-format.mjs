import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const SHARD_LIMIT = 65536;
export const compareUtf8 = (a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b));
export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort(compareUtf8).map((key) => [key, canonical(value[key])]));
  }
  return value;
}

export const jsonBytes = (value) => Buffer.from(`${JSON.stringify(canonical(value))}\n`, "utf8");
export const descriptor = (url, bytes) => ({ url, bytes: bytes.length, sha256: sha256(bytes) });

export function safeRelativePath(value) {
  if (typeof value !== "string" || !value || value.includes("\\") || value.includes("\0") ||
      value.startsWith("/") || value.includes(":") || value.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error(`Unsafe artifact path: ${value}`);
  }
  return value;
}

export function loadSchemas() {
  return Object.fromEntries(["common", "manifest", "index", "record", "inventory"].map((name) => [
    name, JSON.parse(fs.readFileSync(path.join(ROOT, "schemas", `${name}.schema.json`), "utf8")),
  ]));
}

export function schemaValidators() {
  const schemas = loadSchemas();
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addSchema(schemas.common);
  return Object.fromEntries(["manifest", "index", "record", "inventory"].map((name) => [name, ajv.compile(schemas[name])]));
}
