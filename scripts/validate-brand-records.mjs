#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  asStringArray,
  filterBrands,
  normalizeBrandList,
  normalizeText,
  validateBrandRecord,
} from "../app-core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const DEFAULT_POSITIVE_SMOKE_TESTS = [
  { query: "味全", expectedIds: ["weichuan-foods"] },
  { query: "TikTok", expectedIds: ["bytedance"] },
  { query: "國民黨", minMatches: 1 },
  { query: "柬埔寨", minMatches: 1 },
  { query: "韓國旅遊風險", minMatches: 1 },
];

const DEFAULT_NEGATIVE_QUERIES = [
  "珍珠芭樂",
  "鳳梨酥",
  "行動電源",
  "藝人",
  "政治人物",
  "牙膏",
  "水",
  "旅遊",
  "機票",
  "飲料",
  "YouTuber",
  "機器狗",
  "營造",
];

const GENERIC_ALIAS_TERMS = new Set(
  [
    ...DEFAULT_NEGATIVE_QUERIES,
    "APP",
    "中國製",
    "中国製",
    "中國製造",
    "中国制造",
    "中國品牌",
    "中資",
    "食品",
    "飲用水",
    "飲料店",
    "手搖飲",
    "茶飲",
    "奶茶",
    "咖啡",
    "餐廳",
    "政黨",
    "候選人",
    "主持人",
    "歌手",
    "演員",
    "網紅",
    "KOL",
    "旅遊風險",
    "國家",
    "風險",
  ].map(normalizeText),
);

function usage() {
  return `Usage:
  node scripts/validate-brand-records.mjs [options]

Default checks:
  - parse and normalize brands.json
  - validate every record with app-core validateBrandRecord()
  - detect duplicate IDs
  - verify README record count, if present
  - run node --check for app-core.mjs, app.js, merge-risk-records.mjs, and this script
  - run default positive smoke queries
  - run default generic negative queries; these must return zero results
  - run git diff --check when inside a git repository

Record-specific checks:
  --target-id <id>          Target record id. Repeat or comma-separate for multiple IDs.
  --positive <query>        Query that must hit the target id when --target-id is set; otherwise must hit at least one record.
  --negative <query>        Query that must return zero records. Repeat for all generic false-positive probes.
  --expect <query=>id>      Query must include the exact id. Repeat for multi-record batches.
  --expect-any <query>      Query must return at least one record.

Control:
  --data <path>             brands JSON path, default: brands.json
  --readme <path>           README path, default: README.md
  --no-default-smoke        Skip built-in positive smoke tests.
  --no-default-negatives    Skip built-in generic negative tests.
  --no-syntax-check         Skip node --check checks.
  --no-git-diff-check       Skip git diff --check.
  --strict-generics         Classify exact generic aliases as errors instead of warnings.
  --allow-warnings          Exit zero even if warnings exist; for investigation only, not publish gates.
  --fail-on-warnings        Compatibility flag; warnings are fatal by default.
  --json                    Output machine-readable JSON only.
  --help                    Show this help.

Examples:
  node scripts/validate-brand-records.mjs
  node scripts/validate-brand-records.mjs --target-id weichuan-foods --positive 味全 --negative 水
  node scripts/validate-brand-records.mjs --expect "味全=>weichuan-foods" --expect-any TikTok --negative 政治人物
`;
}

function parseArgs(argv) {
  const options = {
    dataPath: "brands.json",
    readmePath: "README.md",
    targetIds: [],
    positives: [],
    negatives: [],
    expects: [],
    expectAny: [],
    defaultSmoke: true,
    defaultNegatives: true,
    syntaxCheck: true,
    gitDiffCheck: true,
    strictGenerics: false,
    allowWarnings: false,
    json: false,
    help: false,
  };

  const takeValue = (args, index, flag) => {
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`${flag} requires a value`);
    }
    return value;
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--data":
        options.dataPath = takeValue(argv, index, arg);
        index += 1;
        break;
      case "--readme":
        options.readmePath = takeValue(argv, index, arg);
        index += 1;
        break;
      case "--target-id":
        options.targetIds.push(...takeValue(argv, index, arg).split(",").map((item) => item.trim()).filter(Boolean));
        index += 1;
        break;
      case "--positive":
        options.positives.push(takeValue(argv, index, arg));
        index += 1;
        break;
      case "--negative":
        options.negatives.push(takeValue(argv, index, arg));
        index += 1;
        break;
      case "--expect": {
        const value = takeValue(argv, index, arg);
        const separator = value.includes("=>") ? "=>" : "=";
        const [query, id, ...rest] = value.split(separator);
        if (!query || !id || rest.length > 0) {
          throw new Error(`--expect must use the form "query=>record-id": ${value}`);
        }
        options.expects.push({ query: query.trim(), id: id.trim() });
        index += 1;
        break;
      }
      case "--expect-any":
        options.expectAny.push(takeValue(argv, index, arg));
        index += 1;
        break;
      case "--no-default-smoke":
        options.defaultSmoke = false;
        break;
      case "--no-default-negatives":
        options.defaultNegatives = false;
        break;
      case "--no-syntax-check":
        options.syntaxCheck = false;
        break;
      case "--no-git-diff-check":
        options.gitDiffCheck = false;
        break;
      case "--strict-generics":
        options.strictGenerics = true;
        break;
      case "--allow-warnings":
        options.allowWarnings = true;
        break;
      case "--fail-on-warnings":
        options.allowWarnings = false;
        break;
      case "--json":
        options.json = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function resolveFromRoot(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(rootDir, filePath);
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: rootDir,
    encoding: "utf8",
    shell: false,
    ...options,
  });
}

function checkSyntax(filePath) {
  const result = run(process.execPath, ["--check", filePath]);
  return {
    file: filePath,
    ok: result.status === 0,
    output: [result.stdout, result.stderr].filter(Boolean).join("\n").trim(),
    status: result.status,
  };
}

function idsForQuery(brands, query) {
  return filterBrands(brands, { query }).map((brand) => brand.id);
}

function extractReadmeCount(readmeText) {
  const patterns = [
    /`brands\.json`\s*目前有\s*(\d+)\s*筆資料/u,
    /brands\.json[^\n]*?(\d+)\s*筆資料/u,
    /目前有\s*(\d+)\s*筆資料/u,
  ];

  for (const pattern of patterns) {
    const match = readmeText.match(pattern);
    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

function formatList(items, limit = 10) {
  if (items.length <= limit) {
    return items.join(", ");
  }
  return `${items.slice(0, limit).join(", ")} ... (+${items.length - limit})`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(usage());
    return 0;
  }

  const errors = [];
  const warnings = [];
  const passed = [];
  const details = {
    dataPath: path.relative(rootDir, resolveFromRoot(options.dataPath)) || options.dataPath,
    readmePath: path.relative(rootDir, resolveFromRoot(options.readmePath)) || options.readmePath,
    count: 0,
    positiveQueries: {},
    negativeQueries: {},
    warnings: [],
  };

  const fail = (check, message, extra = undefined) => errors.push({ check, message, ...(extra ? { extra } : {}) });
  const warn = (check, message, extra = undefined) => warnings.push({ check, message, ...(extra ? { extra } : {}) });
  const pass = (check, message) => passed.push({ check, message });

  const dataPath = resolveFromRoot(options.dataPath);
  let raw;
  let brands;

  try {
    raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    pass("json", `${details.dataPath} parses as JSON`);
  } catch (error) {
    fail("json", `Failed to parse ${details.dataPath}: ${error.message}`);
  }

  if (raw !== undefined) {
    try {
      brands = normalizeBrandList(raw);
      details.count = brands.length;
      pass("normalize", `normalized ${brands.length} records`);
    } catch (error) {
      fail("normalize", error.message);
    }
  }

  if (brands) {
    const validationErrors = brands.flatMap((brand, index) =>
      validateBrandRecord(brand).map((error) => ({ index, id: brand.id, name: brand.name, error })),
    );

    if (validationErrors.length > 0) {
      fail("record-validation", `${validationErrors.length} record validation error(s)`, validationErrors);
    } else {
      pass("record-validation", "all records pass validateBrandRecord()");
    }

    const seenIds = new Map();
    const duplicateIds = [];
    for (const [index, brand] of brands.entries()) {
      if (seenIds.has(brand.id)) {
        duplicateIds.push({ id: brand.id, firstIndex: seenIds.get(brand.id), duplicateIndex: index });
      } else {
        seenIds.set(brand.id, index);
      }
    }

    if (duplicateIds.length > 0) {
      fail("duplicate-ids", `${duplicateIds.length} duplicate id(s)`, duplicateIds);
    } else {
      pass("duplicate-ids", "no duplicate IDs");
    }

    const genericAliasHits = [];
    for (const brand of brands) {
      for (const alias of asStringArray(brand.aliases)) {
        if (GENERIC_ALIAS_TERMS.has(normalizeText(alias))) {
          genericAliasHits.push({ id: brand.id, name: brand.name, alias });
        }
      }
    }

    if (genericAliasHits.length > 0) {
      const message = `${genericAliasHits.length} exact generic alias(es) found; review whether they should be blocklisted or qualified`;
      if (options.strictGenerics) {
        fail("generic-aliases", message, genericAliasHits);
      } else {
        warn("generic-aliases", message, genericAliasHits.slice(0, 20));
      }
    } else {
      pass("generic-aliases", "no exact generic aliases from the built-in guard list");
    }
  }

  const readmePath = resolveFromRoot(options.readmePath);
  if (brands && fs.existsSync(readmePath)) {
    const readmeText = fs.readFileSync(readmePath, "utf8");
    const readmeCount = extractReadmeCount(readmeText);

    if (readmeCount === null) {
      warn("readme-count", `No README count pattern found in ${details.readmePath}`);
    } else if (readmeCount !== brands.length) {
      fail("readme-count", `README says ${readmeCount} records but ${details.dataPath} has ${brands.length}`);
    } else {
      pass("readme-count", `README count matches brands.json (${brands.length})`);
    }
  } else if (!fs.existsSync(readmePath)) {
    warn("readme-count", `${details.readmePath} not found; skipped README count check`);
  }

  if (brands) {
    const positiveSmokeTests = options.defaultSmoke ? DEFAULT_POSITIVE_SMOKE_TESTS : [];
    for (const test of positiveSmokeTests) {
      const ids = idsForQuery(brands, test.query);
      details.positiveQueries[test.query] = ids;
      const missing = asStringArray(test.expectedIds).filter((id) => !ids.includes(id));
      const enoughMatches = test.minMatches === undefined || ids.length >= test.minMatches;
      if (missing.length > 0 || !enoughMatches) {
        fail(
          "positive-smoke",
          `query "${test.query}" returned [${formatList(ids)}], expected ${missing.length > 0 ? `id(s) [${missing.join(", ")}]` : `at least ${test.minMatches} match(es)`}`,
        );
      }
    }
    if (positiveSmokeTests.length > 0) {
      pass("positive-smoke", `${positiveSmokeTests.length} built-in positive smoke query/probe(s) checked`);
    }

    const negativeQueries = [
      ...(options.defaultNegatives ? DEFAULT_NEGATIVE_QUERIES : []),
      ...options.negatives,
    ];
    for (const query of negativeQueries) {
      const ids = idsForQuery(brands, query);
      details.negativeQueries[query] = ids;
      if (ids.length > 0) {
        fail("negative-query", `generic/negative query "${query}" unexpectedly matched [${formatList(ids)}]`);
      }
    }
    if (negativeQueries.length > 0) {
      pass("negative-query", `${negativeQueries.length} negative query/probe(s) checked`);
    }

    const normalizedTargetIds = new Set(options.targetIds.map((id) => id.trim()).filter(Boolean));
    for (const id of normalizedTargetIds) {
      if (!brands.some((brand) => brand.id === id)) {
        fail("target-id", `target id not found: ${id}`);
      }
    }

    for (const query of options.positives) {
      const ids = idsForQuery(brands, query);
      details.positiveQueries[query] = ids;
      if (normalizedTargetIds.size > 0) {
        const hitsAnyTarget = [...normalizedTargetIds].some((id) => ids.includes(id));
        if (!hitsAnyTarget) {
          fail("positive-query", `positive query "${query}" returned [${formatList(ids)}], expected one of [${formatList([...normalizedTargetIds])}]`);
        }
      } else if (ids.length === 0) {
        fail("positive-query", `positive query "${query}" returned no records`);
      }
    }
    if (options.positives.length > 0) {
      pass("positive-query", `${options.positives.length} user positive query/probe(s) checked`);
    }

    for (const { query, id } of options.expects) {
      const ids = idsForQuery(brands, query);
      details.positiveQueries[query] = ids;
      if (!ids.includes(id)) {
        fail("expect-query", `query "${query}" returned [${formatList(ids)}], expected id ${id}`);
      }
    }
    if (options.expects.length > 0) {
      pass("expect-query", `${options.expects.length} exact query=>id expectation(s) checked`);
    }

    for (const query of options.expectAny) {
      const ids = idsForQuery(brands, query);
      details.positiveQueries[query] = ids;
      if (ids.length === 0) {
        fail("expect-any", `query "${query}" returned no records`);
      }
    }
    if (options.expectAny.length > 0) {
      pass("expect-any", `${options.expectAny.length} expect-any query/probe(s) checked`);
    }
  }

  if (options.syntaxCheck) {
    const syntaxFiles = [
      "app-core.mjs",
      "app.js",
      "scripts/merge-risk-records.mjs",
      "scripts/validate-brand-records.mjs",
    ];
    const syntaxResults = syntaxFiles.map(checkSyntax);
    const failedSyntax = syntaxResults.filter((result) => !result.ok);

    if (failedSyntax.length > 0) {
      fail("syntax-check", `${failedSyntax.length} syntax check(s) failed`, failedSyntax);
    } else {
      pass("syntax-check", `${syntaxFiles.length} node --check syntax check(s) passed`);
    }
  }

  if (options.gitDiffCheck) {
    if (fs.existsSync(path.join(rootDir, ".git"))) {
      const result = run("git", ["diff", "--check"]);
      if (result.status === 0) {
        pass("git-diff-check", "git diff --check passed");
      } else {
        fail("git-diff-check", "git diff --check failed", [result.stdout, result.stderr].filter(Boolean).join("\n").trim());
      }
    } else {
      warn("git-diff-check", "not a git repository; skipped git diff --check");
    }
  }

  details.warnings = warnings;

  const ok = errors.length === 0 && (options.allowWarnings || warnings.length === 0);
  const result = {
    ok,
    summary: {
      records: details.count,
      passed: passed.length,
      warnings: warnings.length,
      errors: errors.length,
    },
    passed,
    warnings,
    errors,
    details,
  };

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Brand avoidance validation: ${ok ? "PASS" : "FAIL"}`);
    console.log(`Records: ${details.count}`);
    console.log(`Checks passed: ${passed.length}; warnings: ${warnings.length}; errors: ${errors.length}`);

    if (passed.length > 0) {
      console.log("\nPassed:");
      for (const item of passed) {
        console.log(`  ✓ ${item.check}: ${item.message}`);
      }
    }

    if (warnings.length > 0) {
      console.log("\nWarnings:");
      for (const item of warnings) {
        console.log(`  ⚠ ${item.check}: ${item.message}`);
      }
    }

    if (errors.length > 0) {
      console.log("\nErrors:");
      for (const item of errors) {
        console.log(`  ✗ ${item.check}: ${item.message}`);
      }
    }

    if (Object.keys(details.positiveQueries).length > 0) {
      console.log("\nPositive query results:");
      for (const [query, ids] of Object.entries(details.positiveQueries)) {
        console.log(`  ${query}: ${ids.length ? formatList(ids) : "<none>"}`);
      }
    }

    if (Object.keys(details.negativeQueries).length > 0) {
      console.log("\nNegative query results:");
      for (const [query, ids] of Object.entries(details.negativeQueries)) {
        console.log(`  ${query}: ${ids.length ? formatList(ids) : "<none>"}`);
      }
    }
  }

  return ok ? 0 : 1;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`Brand avoidance validation: FAIL\n${error.stack ?? error.message}`);
  process.exitCode = 1;
}
