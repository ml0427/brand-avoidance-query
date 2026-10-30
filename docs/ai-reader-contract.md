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
For HTML routing only, skip a leading run of Unicode opening punctuation (Ps),
initial quotes (Pi), ASCII single/double quotes and whitespace. Keep the original
key if nothing remains. Then skip one leading @ only when immediately followed
by a Unicode letter, number or underscore. Thus 《功夫道長》 follows 功,
《陽光女子合唱團》 follows 陽 and @cheapaoe follows C. A lone @, @@, embedded @,
#, +, dots and other symbols are retained. This does not change exact-match
normalization, JSON keys, record fields or visible names.
Follow the resulting first character, then any longer matching content prefix,
and open every exact-name/alias/identifier collision's complete record page.
Each catalog node (including its pagination chain) lists each recordId only once.
Its representative is a name match when present, otherwise an alias, then an
identifier. Different recordIds are never merged by equal display names. The
same record remains reachable through its different name/alias prefix branches:
Cheap and 鄭才暐 retain both C and 鄭 entries, not one global representative. All lookup
keys stay in the JSON indexes and full record; they are not all printed in the
catalog. A missing literal alias in a catalog is not a no-match: open candidate
records in the relevant branch and verify their complete identity fields.
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

## Browser-Only Judicial Category Discovery

The root homepage and llms.txt expose a separate ordinary link named 司法案件.
It leads to the same versioned snapshot's judicial/index.html, included in the
existing inventory bytes/SHA-256 system, not an external site or a new JSON API.
The manifest and JSON identity-query schemas and semantics are unchanged.

This directory selects only exact existing compiled categories: 司法／人物案件,
司法／企業案件 and 司法／公眾人物. Do not infer membership from summary keywords,
confirmed status, political rosters or another person's case. It is not a complete
judicial case registry or evidence that any ongoing person-by-person audit has
finished. The homepage and every directory page explicitly state:
「司法相關分類不代表全是被告、有罪或定讞；具體角色及最新已核程序請讀完整紀錄；舊紀錄不是本輪新複查完成。」

Follow actual links to the six party views first, then the preserved all-records
and three original judicial-category views. Party views partition only that same
judicial selection, using the **same compiled record's categories**. Collect the
distinct complete strings starting exactly with `政黨／`, without trimming or alias
mapping. Exactly one distinct string must match one of these five tags:

| View | Exact source tag | Directory under `judicial/` |
| --- | --- | --- |
| 中國國民黨 | 政黨／中國國民黨 | `party/kmt/` |
| 民主進步黨 | 政黨／民主進步黨 | `party/dpp/` |
| 台灣民眾黨 | 政黨／台灣民眾黨 | `party/tpp/` |
| 其他政黨 | 政黨／其他政黨 | `party/other/` |
| 無黨籍 | 政黨／無黨籍 | `party/independent/` |
| 未確認／未分類 | missing, unsupported or conflicting tags | `party/unknown/` |

Repeated copies of the same tag are not a conflict. Multiple distinct prefix tags,
including a valid tag plus an unsupported tag, go only to unknown. An arbitrary
small-party tag does not automatically mean other. The six views are mutually
exclusive by recordId and their union equals all-records. No party is inferred
from names, IDs, summary/source prose, political rosters, nomination, relatives or
other people's roles. No tags are added by the renderer. Unknown is a navigation
bucket, not an affiliation fact; untagged people and companies are not presumed
independent or uniformly non-political.

Source writers must support each explicit tag, including independent/other, with
evidence for this subject at a stated source time in existing sources.note/aiNotes.
The renderer does not extract dates from prose, use the newest source date or
lastReviewed as affiliation dates, or treat historical affiliation as present-day
or incident-time affiliation. Each judicial page also states:
「政黨導覽只依本筆紀錄明確標籤及其來源時點分類，不代表即時黨籍、案發時黨籍或政黨責任；退黨、轉黨與來源日期請讀完整紀錄。未確認／未分類包含尚未核實、標籤衝突及公司等不適用對象，不等於無黨籍；本目錄不是各黨涉案人數或完整案件統計。」

Each row links the complete canonical name to the existing complete record HTML
and shows its full source summary, without synthesizing a verdict, role or latest procedure.
Read that complete record's aiNotes, sources.note, dates and sources for procedural
and evidence limits. The directory neither creates case-fact records nor changes
lastReviewed, personal reasons, sources or any existing record/index bytes.

Each view, across its whole pagination chain, deduplicates by recordId before
pagination and retains same-name records with different IDs. A record belonging
to multiple categories can appear in each category; the all-records view lists it
once. Rows sort deterministically by UTF-8 canonical name then recordId. HTML pages
share the 65536-byte budget with explicit previous/next links and an end marker;
all pages are reachable without JavaScript. A summary too large for one page fails
the build rather than being truncated. Empty categories remain linked with a true
empty state, not a claim of innocence, safety or completed review. HTML reading
alone does not establish bytes/SHA-256 verification or latest external progress.

## Deterministic Publication

canonical JSON is UTF-8, LF-terminated, with object keys sorted by UTF-8 bytes and array order preserved. Versioned artifacts contain relative links and no build clock, source commit or self-referencing dataVersion. inventory.json is `{schemaVersion:1, files:[{path,sha256,bytes}]}` sorted by relative UTF-8 path and does not list itself. Mutable root manifest/entry files are generated after the content hash is known. Only the current version is deployed.
