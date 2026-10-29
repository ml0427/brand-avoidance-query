---
name: brand-avoidance-query
description: Query the user's personal brand-avoidance database through its published manifest, identity indexes and complete records. Use for brand, company, product line, app, public figure, shop or package-identifier avoidance questions; a match is not a legal finding.
---

# Brand Avoidance Query

With code execution, use the bundled Python standard-library reader through
`https://ml0427.github.io/brand-avoidance-query/manifest.json`.
Do not download a whole inventory, evidence images, or an old record array.
This skill queries existing records; it does not authorize adding or publishing records.

## Without Python

Open `https://ml0427.github.io/brand-avoidance-query/` and follow the name catalog.
Choose the visible A-Z, Chinese first-character, digit or other-character link,
then any longer matching prefix. For example, 文姿雲 follows 文 to the full name.
Aliases and identifiers use the same navigation. Open every matching record and
read the full reasons and scope; a list entry alone is not an avoidance conclusion.
Do not calculate UTF-8 ranges or invent catalog URLs. Follow actual links and
all indicated continuation pages. The catalog is an indented text tree; a record
may cover multiple people or products. Partial-name discovery may require multiple prefix groups; these
pages are not semantic product-category search. If the tool cannot read the
required pages, is truncated, or the version is uncertain, report incomplete
lookup, not no-match. Do not claim cryptographic verification from HTML alone.

## Run

Resolve `scripts/search_brand.py` relative to the installed directory containing
this `SKILL.md`, not the project checkout or the shell's initial directory.
Run the following commands from that skill directory:

```sh
python scripts/search_brand.py "DJI"
python scripts/search_brand.py "brand fragment" --mode partial --limit 20
python scripts/search_brand.py "identifier" --evaluation-date 2026-10-28
```

Exact mode is the default and compares complete normalized names, aliases and
identifiers. It does not search country, categories, summary, reasons or sources.
Only recognized identifier display labels are stripped; URL schemes, ports and
arbitrary colon prefixes are preserved. Generic queries may be explored using
partial mode, but a candidate is never an identity conclusion.

Optional `--manifest-url` overrides `BRAND_AVOIDANCE_MANIFEST_URL`, which overrides
the default entry. `--limit` must be positive. `--evaluation-date` is a strict
`YYYY-MM-DD` Taipei calendar date; when omitted, the reader uses the current date
in Asia/Taipei. There is no legacy URL, category-list command or array fallback.

## Interpret

Read the JSON and answer in Traditional Chinese unless requested otherwise.

- Report `dataVersion`, `sourceCommit`, `mode` and `evaluationDate`. A deployment's
  source commit is not a claim that it is the latest remote main.
- Use `totalMatches`, `returnedMatches` and `hasMore`; a limit is not a full count.
  If truncated, disclose that and increase the limit before making an exhaustive claim.
- For each selected record, identify its name and `matchedTerms` field/value/kind.
  Read the complete `record`, especially `summary`, `aiNotes`, `sources.note`,
  status, confidence, scope, review dates and temporary-alert reasons.
- Cite relevant titles with the resolved `sourceLinks` URLs, matched by
  `sourceIndex` to `record.sources`. An empty original source URL is a note,
  not a link. Do not reinterpret a raw relative evidence URL as a live root URL.
- `personal` is the user's avoidance judgment; `watchlist` and `low` require
  explicit caution; `confirmed` is a source-backed risk label, not necessarily
  a conviction, ban or proof that every product or branch is unsafe.
- Exact alias/name/identifier matches still need scope review. A listed member,
  SKU, branch or group alias does not prove personal wrongdoing, ownership, or
  applicability to the whole brand and its other products or branches.
- A partial result is only a candidate, even when a field equals the query. Verify
  identity and scope from the complete record and sources before concluding.
- `temporaryUntil` is inclusive; `temporaryExpired` starts the next Taipei day.
  `reviewAfter` is due on its date. Disclose historical alerts or pending review;
  do not silently change record status or turn an old event into a current finding.
- A successful zero count means only no direct match in this snapshot and mode,
  never safety, innocence or a purchasing guarantee. An exact miss does not rule
  out partial candidates. Ask for a precise brand/company/identifier when needed.
- A nonzero exit or error JSON means the lookup is unavailable or incomplete,
  never not-found. The reader already retries the complete snapshot once; report
  the failure instead of using stale data or an unsupported fallback.

The reader validates versions, URL boundaries, sizes and hashes before parsing
artifacts. These checks establish snapshot consistency, not independent proof of
the underlying claims. Preserve source attribution and the user's personal
choice separately from externally confirmed facts and legal conclusions.
