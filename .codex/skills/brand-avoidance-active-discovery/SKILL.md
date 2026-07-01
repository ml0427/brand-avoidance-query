---
name: brand-avoidance-active-discovery
description: Proactive discovery workflow for D:\AI_workspace\brand-avoidance-query. Use when the user asks to actively scan current public sources for high-signal brand-avoidance candidates. This skill discovers and reports candidates only; it does not edit records, regenerate brands.json, run final local validation, commit, or push.
---

# Brand Avoidance Active Discovery

## Boundary

Use this skill for **主動查**: finding new candidates from current public sources that may cross the user's avoidance-value boundaries.

Do not use this as the local verification step. Do not edit `scripts/merge-risk-records.mjs`, `brands.json`, or `app-core.mjs`. Do not commit or push.

Allowed local checks:

- `git status -sb` to understand workspace state.
- A quick duplicate check with `rg` or `filterBrands()` so the discovery report can say whether a candidate appears already covered.

## Core Principle

Prefer **high-signal, low-false-positive discovery**.

Do not run broad outrage-driven searches as the default. Use a layered strategy:

1. **Daily fixed scan:** government sanctions, cybersecurity, export-control, inspection, court, and major-news original sources.
2. **Weekly or lead-triggered scan:** ownership/control, PRC state ownership, CCP/party-building, company registration, annual reports, official statements.
3. **Case-triggered scan only:** Taiwan-label disputes, public political-compliance statements, SKU/origin records, shop/person/social controversies.

Every candidate must be an exact entity: brand, company, person, shop, media work, app/package, product, SKU, domain, company number, or other narrow identifier.

## Discovery Targets

Search for candidates that match the user's value boundaries:

- PRC state ownership, SOE/central SOE/local SOE control, state-backed investment/control.
- CCP party-building, party-enterprise integration, or official CCP governance links, when tied to a precise company/brand/control chain.
- Sanctions, export controls, national-security lists, cybersecurity warnings, surveillance, human-rights, forced-labor, censorship, or data-security concerns.
- Taiwan-label downgrading or political-compliance wording: `中國台灣`, `台灣地區`, `中華人民共和國台灣地區`, `一國兩制`, `九二共識`, `反台獨`, official party-state slogans.
- Red-media / Want Want group and directly controlled brands or outlets.
- Precise product/SKU origin concerns, including China-origin ingredient, concentrate, oil, tea, or raw-material issues, only when there is a precise product/SKU target.
- Political shop/person records only when there is direct public evidence and they are clearly personal/political preference records, not objective CCP/security risk.

### Explicitly narrow these boundaries

- Do **not** treat `Made in China` alone as PRC state/CCP/security risk. It may be a SKU/origin or personal-avoid signal only.
- Do **not** treat a Taiwanese artist's mere China-market work as a candidate. Require official-media reposts, unification propaganda, Taiwan-label downgrading, CCP official event participation, or comparable political-compliance evidence.
- Do **not** broadly scan all KMT/TPP politicians, relatives, or affiliated businesses. Require direct ownership/control, executive role, family-business control evidence, brand authorization, or explicit user interest.
- Do **not** expand one hotel, shop, product, app, or subsidiary incident to all same-group brands unless control/brand scope is proven.
- Do **not** put generic categories or origins into aliases: `水`, `飲料`, `茶`, `中國製`, `中國茶`, `CNC`, `藝人`, `餐廳`, etc.

## Search Lanes

### Lane A — Daily fixed: sanctions / security / official warnings

Run first for daily scans. These have the highest signal and can support `confirmed` when official.

Preferred sources:

- OFAC / U.S. Treasury recent actions and press releases.
- BIS Entity List / export-control notices.
- U.S. State Department sanctions releases.
- FCC Covered List, DoD Chinese Military Companies, forced-labor and national-security lists when relevant.
- Taiwan MODA/ACS cybersecurity notices, FSC/MOEA/TFDA/courts/procurement/inspection pages.
- Major news original articles that quote or link official actions.

Example queries:

```text
site:ofac.treasury.gov/recent-actions Taiwan company sanctions
site:home.treasury.gov/news/press-releases Taiwan sanctions Iran UAV CNC
site:bis.doc.gov Entity List Taiwan company China
site:state.gov sanctions Taiwan company Iran UAV
site:moda.gov.tw 資安 高風險 App 中國
site:cert.tanet.edu.tw 中國 App 資安 風險
site:fda.gov.tw 中國 產地 食品 裁罰 品牌
```

### Lane B — Weekly or lead-triggered: ownership / SOE / CCP links

Use for known candidates, parent companies, or periodic deeper scans. Do not attempt full-database scans every day.

Preferred sources:

- Official company websites and investor relations.
- Taiwan company registration, stock exchange filings, MOPS.
- CNINFO, HKEX, SEC filings, annual reports.
- SASAC / 國資委 sources when the ownership target is precise.
- Official party-building pages, but only as evidence for the entity actually covered by the page.

Example queries:

```text
"<target>" 母公司
"<target>" 股權 結構
"<target>" 統編 負責人 董事
"<target>" 年報 黨建
"<target>" 黨支部
"<target>" 國資委
site:cninfo.com.cn "<target>" 黨建
site:hkexnews.hk "<target>" annual report
```

### Lane C — Periodic / lead-triggered: Taiwan-label and political compliance

Use when there is a brand/media/app/person target or a major current event. Do not broadly trawl all artists or all parties.

Preferred sources:

- Brand official terms, registration flows, app screens, archived pages when a live page was changed.
- Official statements, press releases, and verified social posts.
- Government responses and major news original reports.
- China official media posts only when the target's participation or repost is directly evidenced.

Example queries:

```text
"<target>" "中國台灣"
"<target>" "台灣地區"
"<target>" "中華人民共和國台灣地區"
"<target>" "九二共識"
"<target>" "一國兩制"
"<target>" "反台獨"
"<target>" site:weibo.com 央視 台灣必歸
"<target>" 國台辦 人民日報 央視
```

### Lane D — Case-triggered only: SKU / origin / ingredient

Use only when there is a precise brand/product/SKU, product page, package photo, channel listing, official reply, or user-provided target.

Preferred sources:

- Official product page and manufacturer/owner page.
- Package photos, ingredient/origin labels, product barcodes, channel product codes.
- Convenience-store / retailer product pages or food-safety pages.
- TFDA or inspection pages when available.

Example queries:

```text
"<product/SKU>" 產地 中國
"<product/SKU>" 原料 中國
"<product/SKU>" 茶葉 中國
"<product/SKU>" 濃縮汁 中國
"<product/SKU>" 製造商 負責廠商
"<product/SKU>" 條碼 產品頁
```

### Lane E — Leads only: social / personal / shop-politics

Use social/community sources only as leads unless the user explicitly accepts personal-scope evidence.

Acceptable use:

- Identify a shop/person/brand lead.
- Find a public original post, photo, statement, or media report to verify.
- Recommend `hold`, `lead`, or `personal`, not `confirmed`, unless stronger sources exist.

Example queries:

```text
"<shop/person>" 反罷免
"<shop/person>" 不同意罷免
"<shop/person>" 青鳥
"<shop/person>" 店家 聲明
"<shop/person>" Threads Facebook 原始貼文
```

## Evidence-to-Status Gate

Use this gate in discovery reports. The report can recommend a status, but record-edit makes the final database decision.

- `confirmed`: official sanctions/security/government notices, court/inspection/corporate filings, official company/self-disclosed sources, or original public statements directly supporting the risk claim.
- `watchlist`: major-news original reporting or official-source quotations are credible, but original/archived/identifier evidence is incomplete.
- `personal`: the case fits the user's personal avoidance values but does not prove objective illegality, sanctions, PRC state/CCP control, or safety/security risk.
- `lead` / `hold`: social screenshots, anonymous claims, forum lists, unclear target identity, unresolved same-name risk, or insufficient source quality.

Never label a candidate `confirmed` only because social media or a single commentary article says so.

## Source Standard

Prefer sources in this order:

1. Government, sanction, court, company registration, stock exchange, procurement, inspection, cybersecurity, or official list pages.
2. Official brand/company/person/app websites, announcements, verified posts, app stores, product pages, package/origin evidence.
3. Major news original articles, especially those quoting or linking official sources.
4. The person's or shop's own public social post.
5. Social screenshots, list images, PTT, Dcard, Threads, Facebook discussions as leads only unless the user explicitly accepts personal-scope evidence.

For each candidate, capture direct URLs, dates, source type, and exactly what the source proves. Do not use a source to prove more than it actually supports.

## Duplicate and Scope Check

Before reporting a candidate, quickly check whether it is already covered locally:

- Prefer `filterBrands()` for user-facing matching behavior.
- Use `rg` only as a quick secondary text check.
- If a broad query matches an existing umbrella record, report that and avoid duplicate recommendations.
- If the new lead is narrower than an existing umbrella record, recommend `hold` or `source update`, not a duplicate record.

## Output

Return a concise candidate report in Traditional Chinese:

- `候選`: exact target name.
- `類型`: brand/company/person/shop/media/product/SKU/app/etc.
- `lane`: A sanctions/security, B ownership/CCP, C Taiwan-label/political-compliance, D SKU/origin, or E social/personal lead.
- `建議分級`: lead/hold/personal/watchlist/confirmed.
- `可能原因`: which user boundary it may cross.
- `來源`: direct URLs and dates when available.
- `已在本機清單`: yes/no/unknown from quick duplicate check.
- `建議下一步`: add as personal/watchlist/confirmed, update source, hold, or needs more evidence.
- `不確定性`: what is not proven and what would be needed to upgrade.

Stop after the report unless the user or orchestration explicitly invokes the record-edit skill.
