---
name: brand-avoidance-project-workflow
description: "Router workflow for D:\\AI_workspace\\brand-avoidance-query. Use when the user gives a brand, product, app, company, public figure, media outlet, shop, SKU list, broad category, or daily-scan request and expects the brand-avoidance project process. Route work into separate skills: active discovery for proactive web/news/social search, record edit for database changes, and verify publish for local validation, commit, and push."
---

# Brand Avoidance Project Workflow

## Router

Use this as the project entrypoint only. Keep the phases separate:

1. **主動查**: use `brand-avoidance-active-discovery`.
   - Find candidates from current web/news/social sources.
   - Report sources and uncertainty.
   - Do not edit files.

2. **加入/修改**: use `brand-avoidance-record-edit`.
   - Edit `scripts/merge-risk-records.mjs`.
   - Regenerate `brands.json`.
   - Tighten `app-core.mjs` generic query blocklist when needed.
   - Do not do broad discovery or commit.

3. **驗證/發布**: use `brand-avoidance-verify-publish`.
   - Run local syntax/data checks.
   - Run `filterBrands()` positive and negative matching checks.
   - Inspect diff, commit, push.
   - Do not discover new targets.

## Default Sequencing

- If the user asks to "每天查", "主動查", "找看看", or broad categories, run phase 1 first.
- If the user explicitly says a target should be added, or phase 1 produced accepted candidates, run phase 2.
- After phase 2 changes files, always run phase 3 before claiming completion.
- If the user only asks "有沒有命中" or "這個算嗎", do not modify files unless they also ask to add or the project mode clearly requires it.

## Project Constants

- Project path: `D:\AI_workspace\brand-avoidance-query`.
- Canonical source: `scripts/merge-risk-records.mjs`.
- Generated data: `brands.json`.
- Local matching source: `app-core.mjs` `filterBrands()`.
- Published `search_brand.py` reads GitHub Pages and may lag; do not use it for pre-push local verification.
- After successful push, do not verify GitHub Pages unless explicitly asked.

## Reporting

Reply in Traditional Chinese and keep these sections distinct:

1. 查了什麼
2. 做了什麼
3. 驗證結果
4. 剩餘不確定性

If multiple phases ran, label which phase produced which result.
