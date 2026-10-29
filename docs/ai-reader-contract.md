# AI Reader Contract v1

This is the implemented-interface target for the single cutover. Only the new manifest/index/record protocol is supported. No legacy brands.json fallback is permitted.

## Transport

Default entry: `https://ml0427.github.io/brand-avoidance-query/manifest.json`.
All artifact URLs are relative to the JSON document containing them. Readers restrict artifact requests to the manifest origin and project path. HTTPS is required except localhost test servers. A file descriptor is `{url, sha256, bytes}`. Verify exact response bytes before parsing artifact JSON. SHA-256 strings are lowercase hex.

## Manifest

Required fields: `schemaVersion: 1`, `searchVersion: 1`, `dataVersion`, `sourceCommit`, `sourceCommitTime`, `recordCount`, `inventory`, `indexes`, `catalog`, `recordBase`, `schemas`. `sourceDirty` is a boolean identifying a local working-tree build, not a deployed release. `dataVersion` is the SHA-256 of inventory.json bytes. Versioned files live under `v1/<dataVersion>/`. No compatibilityUrl.

`indexes` is an ordered array of file descriptors with inclusive `firstKey`, `lastKey`, `entryCount`. Ranges must not overlap. Keys are compared as UTF-8 bytes. Exact requests select at most one range; partial requests scan every index. Empty corpora use an empty indexes array. `inventory` and `catalog` are descriptors; `recordBase` is a relative directory URL; `schemas` maps schema names to descriptors.

## Index

Each shard is `{schemaVersion: 1, entries: [...]}` and is at most 65536 bytes. An entry is `{key, matches}`. Each match is `{recordId, name, field, value, record, page}` where field is name/aliases/identifiers and record/page are descriptors relative to this index shard. A key is never split across shards. Repeated names preserve every matching record and original field/value.

Normalization: collapse whitespace, trim, NFKC, then Unicode lowercase (not casefold). Identifier display labels are stripped only from the explicit whitelist shared by app-core and reader: 條碼, barcode, SKU, 型號, 網域, 地址, 公開帳號, 官方網站. Never strip arbitrary colons, URL schemes or ports. Index keys never include country, summary, categories, reasons or source text.

## Record

Envelope: `{schemaVersion: 1, record: <complete compiled source record>, sourceLinks: [...]}`.
Each source link is `{sourceIndex, originalUrl, url}` and covers one nonempty source URL. External HTTP(S) references keep their URL. Approved relative evidence resolves as `../evidence/...` relative to this record document. Empty source URLs remain notes in record.sources without a fabricated link. Preserve all original record values and internal array order, especially aiNotes, sources.note, lastReviewed, temporaryUntil, reviewAfter and temporaryAlertReason.

Independent people, brands and product SKUs are separate records, not members
hidden in another record's aliases. Alternate names of the same subject stay
aliases. Source files may explicitly share context through splitRecord(), but
each emitted record has its own ID, name, scoped summary and identity fields.
Shared sources do not attribute other members' actions, allegations or ownership
scope to this subject. Existing same-name records are not automatically merged;
read every matching record and its limits. A structural split is not a new
source review and must not reset lastReviewed.

## Reader Result

`schemaVersion`, `dataVersion`, `sourceCommit`, `query`, `mode`, `evaluationDate`, `totalMatches`, `returnedMatches`, `hasMore`, `matches`, `note`.
Each result match contains `recordId`, `matchedTerms` (field/value/key/kind), `record`, `sourceLinks` (absolute resolved URLs), and `timeliness`.
Deduplicate results by recordId, not name. Count all matching records before applying a positive limit. Exact mode is the default; partial mode produces candidates, never an identity conclusion. No match does not imply safety. Query failures exit nonzero with an error JSON, not an empty successful result.

Timeliness is evaluated in the reader at the supplied/current Asia/Taipei calendar date. `temporaryUntil` is inclusive; reviewAfter is due on its date. Return `temporaryExpired` and `reviewDue` alongside the evaluation date; never store clock-dependent flags in site artifacts.

On missing artifacts, checksum/size mismatch, invalid JSON/schema/version or inconsistent data: discard this attempt, reload the manifest and retry the entire query once. Still failing means unavailable, never not-found. Do not fetch evidence images automatically.

## Browser-Only Name Lookup

The root website and llms.txt link to the current catalog. Its A-Z, Han-character,
digit and other-character links use visible name prefixes, not UTF-8 range labels.
Follow the query's normalized first character, then any longer matching prefix,
and open every exact-name/alias/identifier collision's complete record page.
Small groups are leaves; only oversized groups subdivide. HTML pages are bounded
at 65536 bytes, with explicit pagination and end markers when subdivision alone
cannot fit. The catalog uses a clickable ASCII-style indented text tree without
lookup-key counters; only the root shows a record total, not a person/product count.

Catalog pages are generated independently of JSON index shards. Catalog paths
are implementation details discovered through actual links; do not invent page
numbers or calculate Unicode-codepoint routes. A partial-name search must visit
all potentially relevant groups and pages, not just its first-character group.
This is not semantic category discovery: a search for juice does not prove all
juice products have been enumerated. HTML-only reading does not by itself prove
byte/hash verification; disclose truncation, missing pages or version uncertainty
rather than reporting a complete miss. The JSON reader contract is unchanged.

## Deterministic Publication

canonical JSON is UTF-8, LF-terminated, with object keys sorted by UTF-8 bytes and array order preserved. Versioned artifacts contain relative links and no build clock, source commit or self-referencing dataVersion. inventory.json is `{schemaVersion:1, files:[{path,sha256,bytes}]}` sorted by relative UTF-8 path and does not list itself. Mutable root manifest/entry files are generated after the content hash is known. Only the current version is deployed.
