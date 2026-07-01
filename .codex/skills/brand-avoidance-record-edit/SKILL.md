---
name: brand-avoidance-record-edit
description: Record editing workflow for D:\AI_workspace\brand-avoidance-query. Use when the user asks to add, update, tighten, remove, or normalize brand-avoidance database records after targets or evidence have been selected. This skill edits scripts/merge-risk-records.mjs, regenerates brands.json, and may adjust app-core.mjs generic query blocklist. It does not perform broad proactive news/social discovery, final verification, commit, or push.
---

# Brand Avoidance Record Edit

## Boundary

Use this skill for **加入/修改資料** only.

Do not run broad discovery scans here. If sources are incomplete, perform minimal source confirmation for the exact target only, or return `needs evidence`.

Do not claim completion until the verification-publish skill has run local checks.

## Source Of Truth

- Canonical source: `scripts/merge-risk-records.mjs`.
- Generated output: `brands.json`.
- Do not hand-edit `brands.json` as the source of truth.
- Preserve unrelated dirty files.

## Matching Rules

Hits should come only from `name`, `aliases`, and `identifiers`.

Aliases must be exact:

- Good: exact brand, company, product line, SKU, app, domain, package label, public person name, public alias,統編, barcode, model.
- Bad: generic categories or phrases such as `水`, `牙刷`, `飲料店`, `藝人`, `政治人物`, `中國製`, `反罷免`, `贈品`, `包屁衣`, `APP`, `導演`, `飛彈`, `導彈`.

Because app matching is substring-based, avoid alias strings that make an unrelated shorter query hit. If a useful exact phrase contains a generic short name, add that short generic query to `GENERIC_QUERY_BLOCKLIST` in `app-core.mjs`.

## Evidence Labels

- `confirmed`: strong direct support such as sanctions, government warnings, PRC state ownership, CCP party-building, court/government records, official pages.
- `watchlist`: usable but indirect, narrower, pending, or developing evidence.
- `personal`: user-defined avoidance, political preference, product-origin list, public-figure list, shop/person public statement, or evidence-backed personal scope.
- `high`: direct strong source support for the exact claim.
- `medium`: usable but limited, indirect, social-plus-official, user-provided list, or missing stable official URLs.
- `low`: weak or conservative placeholder.

Never describe a `personal` record as CCP-linked, PRC-state-linked, illegal, sanctioned, unsafe, or pro-CCP unless sources support that exact claim.

## Editing Steps

1. Inspect current state:

```powershell
git status -sb
rg -n "<target variants>" brands.json scripts/merge-risk-records.mjs app-core.mjs
```

2. Edit `scripts/merge-risk-records.mjs` with `apply_patch`.

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
- `lastReviewed` when different from script default

3. Keep `summary` explicit about why the record exists.

4. Keep `aiNotes` explicit about what must **not** be inferred.

5. If needed, edit `app-core.mjs` only for generic query blocklist entries that prevent false positives.

6. Regenerate:

```powershell
node .\scripts\merge-risk-records.mjs
```

## Handoff

After editing and regeneration, hand off to `brand-avoidance-verify-publish`.

Do not commit or push from this skill.
