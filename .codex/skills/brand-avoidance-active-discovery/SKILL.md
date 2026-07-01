---
name: brand-avoidance-active-discovery
description: Proactive discovery workflow for D:\AI_workspace\brand-avoidance-query. Use when the user asks to actively scan news, web, social sources, daily checks, or broad categories to find people, shops, brands, media, apps, companies, or products that may cross the user's avoidance-value boundaries. This skill only discovers and reports candidates; it does not edit records, regenerate brands.json, run final local validation, commit, or push.
---

# Brand Avoidance Active Discovery

## Boundary

Use this skill for **主動查**: finding new candidates from current public sources.

Do not use this as the local verification step. Do not edit `scripts/merge-risk-records.mjs`, `brands.json`, or `app-core.mjs`. Do not commit or push.

Allowed local checks:

- `git status -sb` to understand workspace state.
- A quick duplicate check with `rg` or `filterBrands()` so the discovery report can say whether a candidate appears already covered.

## Discovery Targets

Search for candidates that match the user's value boundaries:

- 中資、國資、央企、黨建、制裁、資安、人權、監控風險.
- 台灣矮化、中國台灣、一國兩制、九二共識、祝賀解放軍、中國民族／中國人政治表述.
- 台灣藝人長期中國大陸市場發展.
- 國民黨、民眾黨政治人物與議員, including suspended figures.
- 反大罷免、挑釁青鳥或公開政治挑釁店家.
- 紅媒、旺旺集團與旗下品牌.
- 中國製商品、原料、濃縮汁、油品、SKU 來源, only when a precise brand/product/SKU target exists.

## Query Sets

For daily or broad scans, use several of these:

```text
台灣 品牌 中國台灣 標示 爭議
台灣 品牌 一國兩制 爭議
台灣 品牌 九二共識 爭議
台灣 店家 中國製 原料 爭議
台灣 餐廳 中國製 油品
台灣 飲料 濃縮汁 中國 來源
大罷免 店家 反罷免 青鳥
不同意罷免 店家 老闆
台灣藝人 中國 官媒 統一 轉發
台灣藝人 中國台灣 節目
台灣藝人 大陸發展 長期
台灣 政黨 促統 親中
國民黨 議員 公司 餐廳 統編
民眾黨 議員 公司 餐廳 統編
紅媒 親中 媒體 台灣
旺旺 集團 品牌
```

For one target, combine exact quoted names with:

```text
"<target>" 中國台灣
"<target>" 一國兩制
"<target>" 九二共識
"<target>" 中國製
"<target>" 產地 中國
"<target>" 母公司 中資
"<target>" 國資委
"<target>" 黨支部
"<target>" 制裁
"<target>" 統編
"<target>" 負責人
"<target>" 國台辦
"<target>" 人民日報
"<target>" 央視
"<target>" 反罷免
"<target>" 青鳥
"<target>" 大罷免
```

## Source Standard

Prefer sources in this order:

1. Official websites, official announcements, app stores.
2. Government, court, sanction, company registration, stock exchange, procurement, or inspection pages.
3. Major news original articles.
4. The person's or shop's own public social post.
5. Social screenshots, list images, PTT, Dcard, Threads, Facebook discussions as leads only unless the user explicitly accepts personal-scope evidence.

Do not label a candidate as confirmed just because social media says so.

## Output

Return a candidate report in Traditional Chinese:

- `候選`: exact target name.
- `類型`: brand/company/person/shop/media/product/SKU/etc.
- `可能原因`: which user boundary it may cross.
- `來源`: direct URLs and dates when available.
- `已在本機清單`: yes/no/unknown from quick duplicate check.
- `建議下一步`: add as personal/watchlist/confirmed, hold, or needs more evidence.
- `不確定性`: what is not proven.

Stop after the report unless the user or orchestration explicitly invokes the record-edit skill.
