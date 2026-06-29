---
name: brand-avoidance-project-workflow
description: Project-local workflow for D:\AI_workspace\brand-avoidance-query. Use when the user gives a brand, product, app, company, public figure, media outlet, shop, SKU list, or political/personal-avoidance target and expects investigation, database updates, local verification, commit, and push.
---

# Brand Avoidance Project Workflow

## Scope

Use this skill only inside `D:\AI_workspace\brand-avoidance-query`.

In this project, a bare target name such as a brand, product, app, company, public figure, media outlet, shop, or SKU list means: investigate whether it belongs in the user's brand-avoidance database, update the data if evidence supports it, verify locally, commit, and push.

Reply in Traditional Chinese. Keep the final report focused on:

1. 查了什麼
2. 做了什麼
3. 驗證結果
4. 剩餘不確定性

## Data Rules

- Canonical source: `scripts/merge-risk-records.mjs`.
- Generated output: `brands.json`.
- Do not hand-edit `brands.json` as the source of truth. If `brands.json` has records that are not in `merge-risk-records.mjs`, reconcile them into `merge-risk-records.mjs` before running the merge script.
- Preserve unrelated dirty files. Never overwrite user changes to `README.md`, `brands.json`, or any other file without first understanding whether they are user edits.
- The public skill script `C:\Users\ml042\.codex\skills\brand-avoidance-query\scripts\search_brand.py` reads GitHub Pages data, not local files. Use local `filterBrands` for pre-push verification.
- User preference: after a successful `git push`, do not wait for GitHub Pages and do not run published `search_brand.py` unless the user explicitly asks.

## Matching Rules

Search hits should come only from `name`, `aliases`, and `identifiers`.

Keep aliases narrow:

- Use exact brand, company, product line, SKU, app, domain, package label, person name, public alias, or identifier.
- Do not add generic terms such as `牙刷`, `水`, `飲料店`, `藝人`, `導演`, `政治人物`, `中國製`, `反罷免`, `APP`, `遠端桌面`, or product categories as aliases.
- For product-origin lists, use brand-qualified SKU aliases such as `高露潔 纖柔矯正`; do not use standalone brand or generic item names unless the entire brand is intentionally in scope.
- Split mixed records by query intent. Example: food brands, media outlets, public figures, and personal political records should not share aliases if that would cause false hits.

Note: the app uses substring matching, so a query for a brand may match a SKU-level alias that includes the brand. When reporting, explicitly state the record is limited to the listed SKUs or entries.

## Evidence And Labels

Use the real criterion, not inflated language.

- `confirmed`: strong public-source support for the stated risk, such as sanctions, government warnings, PRC state ownership, CCP party-building, or direct official sources.
- `watchlist`: usable but indirect, narrower, or still developing evidence.
- `personal`: user-defined personal avoidance, political preference, product-origin list, public-figure list, or evidence-backed personal scope.
- `high`: strong source support for the exact claim.
- `medium`: source support is usable but indirect, user-provided, or missing stable official URLs.
- `low`: weak or conservative placeholder; state uncertainty clearly.

Do not describe a `personal` record as CCP-linked, PRC-state-linked, illegal, sanctioned, unsafe, or pro-CCP unless sources actually support that exact claim.

For user-provided lists, such as product origin lists from a retailer:

- Use `personal` unless public sources independently support a stronger risk category.
- Use source title like `使用者提供 - ...`.
- Prefer `medium` when no stable public product URL is available.
- State that the record follows the user's list and does not generalize to all products from the brand.

## Investigation Workflow

1. Inspect current state:

```powershell
git status -sb
rg -n "<target variants>" brands.json scripts/merge-risk-records.mjs
```

2. Check local matching behavior when useful:

```powershell
node -e "import fs from 'node:fs'; import { filterBrands } from './app-core.mjs'; const brands=JSON.parse(fs.readFileSync('./brands.json','utf8')); for (const q of ['QUERY']) console.log(q, filterBrands(brands,{query:q}).map(({id,status,confidence})=>({id,status,confidence})));"
```

3. Research current facts from stable sources:

- Prefer official company pages, government pages, app store listings, stock exchange filings, court/government documents, and major news sources.
- Use public summaries only as auxiliary support when official sources are unavailable.
- If the target is a person or group, collect public role, official list, public account, or bylined work. Do not include private members, ordinary supporters, or unverified social lists.

4. Decide:

- If already covered, report the existing record and no change.
- If evidence is insufficient, report no change and what is missing.
- If adding/updating, edit `scripts/merge-risk-records.mjs` and regenerate `brands.json`.

## Editing Workflow

Use `apply_patch` for manual edits.

For list-type records, create a named alias array near similar arrays, then add one `record({ ... })` in the relevant part of `riskRecords`.

Required record fields:

- `id`
- `name`
- `aliases`
- optional `identifiers`
- `country`
- `categories`
- `avoidReasons`
- `confidence`
- `status`
- `summary`
- `sources`
- `aiNotes`

Keep `summary` and `aiNotes` explicit about what is and is not being claimed.

## Local Verification

Run these before commit:

```powershell
node .\scripts\merge-risk-records.mjs
node --check .\scripts\merge-risk-records.mjs
node --check .\app-core.mjs
node --check .\app.js
git diff --check
```

Then verify local matching with positive and negative queries:

- Positive queries: exact names, aliases, identifiers that should hit.
- Negative queries: generic product names, categories, source names, works/titles, or unrelated variants that should not hit.

Example:

```powershell
node -e "import fs from 'node:fs'; import { filterBrands } from './app-core.mjs'; const brands=JSON.parse(fs.readFileSync('./brands.json','utf8')); const queries=['positive','negative']; for (const q of queries) console.log(q+': '+JSON.stringify(filterBrands(brands,{query:q}).map(({id,status,confidence})=>({id,status,confidence}))));"
```

## Commit And Push

After local verification passes:

```powershell
git add brands.json scripts/merge-risk-records.mjs
git commit -m "<concise message>"
git push origin main
git status -sb
```

If the environment requires approval for `.git` writes or network access, request it through the shell command escalation flow. Do not ask the user separately first.

After push succeeds, stop. Do not poll GitHub Pages and do not run published `search_brand.py` unless explicitly requested.

## Final Report

Report:

- What was checked locally and online.
- Which records were added, updated, or left unchanged.
- Exact status/confidence.
- Key positive and negative local verification queries.
- Commit hash if pushed.
- Remaining uncertainty.

If there was no data change, say no files were changed and no commit/push was needed.