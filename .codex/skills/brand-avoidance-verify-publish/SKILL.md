---
name: brand-avoidance-verify-publish
description: Local verification and publishing workflow for D:\AI_workspace\brand-avoidance-query. Use after brand-avoidance records or matching logic have been edited, or when the user asks whether changes are ready, to run local syntax/data checks, filterBrands positive and negative matching checks, inspect diff, commit, push, and report results. This skill does not discover new targets or decide new evidence.
---

# Brand Avoidance Verify Publish

## Boundary

Use this skill for **驗證/發布** only.

Do not do broad internet/news/social discovery here. Do not add new records unless the verification failure requires a narrow fix to the current diff.

## Required Checks

Run from `D:\AI_workspace\brand-avoidance-query`:

```powershell
node .\scripts\merge-risk-records.mjs
node --check .\scripts\merge-risk-records.mjs
node --check .\app-core.mjs
node --check .\app.js
node -e "JSON.parse(require('fs').readFileSync('brands.json','utf8')); console.log('brands.json ok')"
git diff --check
```

Then run `filterBrands()` matching checks with positive and negative queries.

Positive queries:

- Exact name.
- Exact aliases.
- Identifiers such as統編, barcode, SKU, app id, domain.

Negative queries:

- Generic product/category words.
- Source names and article title fragments.
- Political or risk phrases.
- Short substrings that should not match because of substring matching.
- Related but intentionally excluded people or brands.

Use Unicode escapes in inline Node scripts if PowerShell corrupts Chinese text.

Example:

```powershell
node -e "import fs from 'node:fs'; import { filterBrands } from './app-core.mjs'; const brands=JSON.parse(fs.readFileSync('./brands.json','utf8')); const qs=['positive','negative']; for (const q of qs) console.log(q, filterBrands(brands,{query:q}).map(({id,name,status,confidence})=>({id,name,status,confidence})));"
```

## Diff Review

Before committing:

```powershell
git status -sb
git diff --stat
git diff -- scripts/merge-risk-records.mjs app-core.mjs brands.json
```

Confirm:

- Source script and generated JSON are consistent.
- No unrelated files are included.
- `app-core.mjs` blocklist changes are justified by negative checks.
- `personal`, `watchlist`, `confirmed`, and confidence labels match the evidence.

## Commit And Push

Only after checks pass:

```powershell
git add app-core.mjs brands.json scripts/merge-risk-records.mjs
git commit -m "<concise English commit message>"
git push origin main
git status -sb
```

After push succeeds, stop. Do not poll GitHub Pages and do not run the published `search_brand.py` unless explicitly requested.

## Report

Report in Traditional Chinese:

- 查了什麼: local files and validation scope only, not discovery.
- 做了什麼: checks, fixes if any, commit/push.
- 驗證結果: commands and key positive/negative query outcomes.
- 剩餘不確定性: anything not validated.
- Commit hash and push status.
