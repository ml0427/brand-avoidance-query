---
name: family-foodsafety-lookup
description: Look up Taiwan FamilyMart food-safety product data from https://foodsafety.family.com.tw/Web_FFD_2022/. Use when the user asks about 全家, FamilyMart, FamiCollection, FMC, 全家自有品牌, 全家食品/飲料/瓶裝水,商品來源,供應商,產地,原料來源,CMNO, or barcode-based FamilyMart product verification.
---

# Family Food Safety Lookup

Use this skill to query the Taiwan FamilyMart "全家食在購安心" site before making claims about FamilyMart product supplier, source, ingredient origin, or package/source labels.

先讀專案根目錄 `AGENTS.md`；入庫授權、最小適用範圍、主觀／客觀證據、稅籍資料禁令與完整驗證 gate 以該檔為唯一權威。本技能只查全家商品來源，不自動入庫或發布；以下實際全家 API 與 bundled script 的使用方式不變。

## Quick Start

Run the bundled script from the repo root:

```powershell
python .\.codex\skills\family-foodsafety-lookup\scripts\query_family_foodsafety.py "天然水"
python .\.codex\skills\family-foodsafety-lookup\scripts\query_family_foodsafety.py --cmno 3430192
python .\.codex\skills\family-foodsafety-lookup\scripts\query_family_foodsafety.py --barcode 4713696413776
```

The script calls the same API endpoints used by the website:

- `POST /Web_FFD_2022/ws/QueryFsProductListByFilter`
- `POST /Web_FFD_2022/ws/QueryFsProductByItem`
- `GET /Web_FFD_2022/json/product_category.json`

## What To Report

For each matching product, report only fields returned by the API:

- `CMNO`
- `PRODNAME`
- `CATEGORY_NAME`
- `VEND_DESC`
- `ADDR`
- `TEL`
- `AUTH_TYPE`
- `RASRC` entries: `SOURCETYPE`, `SOURCE_NAME`, `COUNTRY`
- product page URL: `https://foodsafety.family.com.tw/Web_FFD_2022/product/<CMNO>`

When using this data for brand-avoidance records, treat it as source/supplier evidence, not as a safety endorsement. If the result only says `水` country `台灣`, report it exactly and do not infer water source, factory ownership, or parent-company risk without another source.

## Workflow

1. Search by exact product name, package wording, barcode, or `CMNO`.
2. If the query returns multiple products, narrow by product name, category, volume, barcode, or `CMNO`.
3. Fetch details for each candidate with `QueryFsProductByItem`.
4. When the question concerns avoidance, cross-check the exact supplier/product identity using the manifest/index/record reader described in `docs/ai-reader-contract.md` and `clients/brand-avoidance-query/SKILL.md`. For unpublished changes, use the current local `_site/` snapshot produced by the complete verification workflow, or inspect `compileRecords()` with the shared `matchRecords()` rules; never use the remote site to prove local edits. Exact hits still require the full record and scope; partial results are candidates, and no match does not imply safety. Do not use retired whole-dataset files or legacy URL fallback. This replaces only the local database lookup, not the FamilyMart query script or API calls.
5. Keep aliases narrow if adding records: use product-qualified names, supplier names, `CMNO`, barcode, and exact package wording. Do not add generic aliases such as `水`, `瓶裝水`, `飲料`, `全家產品`, or `全家自有品牌`.

## Caveats

- The API is an operational website endpoint and may change without notice.
- `VEND_DESC` is the supplier/vendor shown by FamilyMart; it may not be the ultimate manufacturer or owner.
- `RASRC` mixes ingredients and packaging materials. `SOURCETYPE` values observed in use include `1` for package/material entries and `2` for ingredient/source entries; do not rely on the numeric code without the adjacent `SOURCE_NAME`.
- Product availability and supplier data can change. Always include the lookup date in reports and records.
