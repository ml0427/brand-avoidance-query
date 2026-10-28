#!/usr/bin/env python3
"""Query the v1 brand-avoidance snapshot using only the Python standard library."""

import argparse
import datetime as dt
import hashlib
import http.client
import json
import math
import os
import posixpath
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request


DEFAULT_MANIFEST_URL = "https://ml0427.github.io/brand-avoidance-query/manifest.json"
TIMEOUT_SECONDS = 15
MAX_MANIFEST_BYTES = 1024 * 1024
MAX_INDEX_BYTES = 65536
MAX_RECORD_BYTES = 4 * 1024 * 1024
MAX_DESCRIPTOR_BYTES = 128 * 1024 * 1024
TAIPEI = dt.timezone(dt.timedelta(hours=8), "Asia/Taipei")
HASH_PATTERN = re.compile(r"[0-9a-f]{64}\Z")
# ECMAScript whitespace, including BOM but excluding Python-only whitespace.
WHITESPACE = re.compile(
    r"[\u0009-\u000d\u0020\u00a0\u1680\u2000-\u200a"
    r"\u2028\u2029\u202f\u205f\u3000\ufeff]+"
)
IDENTIFIER_LABELS = (
    "\u689d\u78bc", "barcode", "SKU", "\u578b\u865f", "\u7db2\u57df",
    "\u5730\u5740", "\u516c\u958b\u5e33\u865f", "\u5b98\u65b9\u7db2\u7ad9",
)
IDENTIFIER_PREFIX = re.compile(r"^([^:\uff1a]+)[:\uff1a] *(.+)$")
NORMALIZED_LABELS = {label.lower() for label in IDENTIFIER_LABELS}


class ReaderError(Exception):
    """Invalid input, transport failure, or inconsistent snapshot."""


def require(condition, message):
    if not condition:
        raise ReaderError(message)


def text_value(value, label, nonempty=True):
    require(isinstance(value, str), label + " must be a string")
    require(not nonempty or bool(value.strip()), label + " must not be empty")
    return value


def integer(value, label, minimum=0):
    require(type(value) is int and value >= minimum, label + " has an invalid integer")
    return value


def version(document, label):
    require(isinstance(document, dict), label + " must be an object")
    require(type(document.get("schemaVersion")) is int
            and document["schemaVersion"] == 1, label + " has unsupported schemaVersion")


def normalize(value):
    cleaned = WHITESPACE.sub(" ", value).strip(" ")
    return unicodedata.normalize("NFKC", cleaned).lower()


def identity_key(value, field="name"):
    if field == "identifiers":
        cleaned = WHITESPACE.sub(" ", value).strip(" ")
        match = IDENTIFIER_PREFIX.fullmatch(cleaned)
        if match and normalize(match[1]) in NORMALIZED_LABELS:
            value = match[2]
    return normalize(value)


def calendar_date(value):
    require(isinstance(value, str) and re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", value),
            "date must use YYYY-MM-DD")
    try:
        return dt.date.fromisoformat(value)
    except ValueError as exc:
        raise ReaderError("invalid calendar date: " + value) from exc


def taipei_today():
    # A fixed UTC+8 zone avoids a third-party tzdata dependency on Windows.
    return dt.datetime.now(TAIPEI).date()


def parse_json(raw):
    def object_pairs(pairs):
        result = {}
        for key, value in pairs:
            require(key not in result, "duplicate JSON object key: " + key)
            result[key] = value
        return result

    def reject_constant(value):
        raise ReaderError("invalid JSON constant: " + value)

    def check_unicode(value):
        if isinstance(value, str):
            value.encode("utf-8")
        elif isinstance(value, float):
            require(math.isfinite(value), "non-finite JSON number")
        elif isinstance(value, list):
            for item in value:
                check_unicode(item)
        elif isinstance(value, dict):
            for key, item in value.items():
                check_unicode(key)
                check_unicode(item)

    try:
        result = json.loads(raw.decode("utf-8"), object_pairs_hook=object_pairs,
                            parse_constant=reject_constant)
        check_unicode(result)
        return result
    except (ValueError, UnicodeError, RecursionError) as exc:
        raise ReaderError("invalid UTF-8 JSON: " + str(exc)) from exc


def split_url(url, reference=False):
    text_value(url, "URL")
    require(not re.search(r"[\x00-\x20\x7f\\]", url), "unsafe URL characters")
    try:
        parsed = urllib.parse.urlsplit(url)
        require(parsed.scheme in ("https", "http"), "URL must use HTTP(S)")
        require(parsed.hostname is not None and parsed.username is None
                and parsed.password is None, "invalid URL authority")
        parsed.port
    except ValueError as exc:
        raise ReaderError("invalid URL: " + str(exc)) from exc
    if not reference:
        require(parsed.scheme == "https" or parsed.hostname in ("localhost", "127.0.0.1", "::1"),
                "HTTPS required except for localhost test servers")
        require(not parsed.query and not parsed.fragment, "artifact URL cannot have query or fragment")
    return parsed


def decoded_path(path):
    require(not re.search(r"%(?![0-9a-fA-F]{2})", path), "invalid URL encoding")
    require(not re.search(r"%(?:2f|5c)", path, re.I), "encoded path separator")
    try:
        decoded = urllib.parse.unquote(path, errors="strict")
    except UnicodeError as exc:
        raise ReaderError("invalid URL path encoding") from exc
    require(not re.search(r"[%\\\x00-\x20\x7f]", decoded), "unsafe decoded URL path")
    return decoded


def origin(parsed):
    port = parsed.port if parsed.port is not None else (443 if parsed.scheme == "https" else 80)
    return (parsed.scheme, parsed.hostname, port)


class URLPolicy:
    def __init__(self, manifest_url):
        parsed = split_url(manifest_url)
        path = decoded_path(parsed.path)
        require(path.startswith("/") and not path.endswith("/"), "manifest URL must name a file")
        require(all(part not in (".", "..") for part in path.split("/")), "unsafe manifest path")
        self.origin = origin(parsed)
        self.project_path = posixpath.dirname(path).rstrip("/") + "/"
        self.snapshot_path = None

    def check(self, url, snapshot=True):
        parsed = split_url(url)
        require(origin(parsed) == self.origin, "URL escapes manifest origin")
        path = decoded_path(parsed.path)
        root = self.snapshot_path if snapshot else self.project_path
        require(root is not None and path.startswith(root), "URL escapes allowed project/snapshot path")
        require(all(part not in (".", "..") for part in path.split("/")), "unsafe resolved URL path")
        return url

    def resolve(self, reference, document_url, snapshot=True):
        text_value(reference, "relative artifact URL")
        require(not re.search(r"[\x00-\x20\x7f\\]", reference), "unsafe relative URL characters")
        parsed = urllib.parse.urlsplit(reference)
        require(not parsed.scheme and not parsed.netloc and not reference.startswith("/")
                and not parsed.query and not parsed.fragment, "artifact URL must be relative")
        path = decoded_path(parsed.path)
        root = self.snapshot_path if snapshot else self.project_path
        base_path = decoded_path(urllib.parse.urlsplit(document_url).path)
        stack = base_path.split("/")[:-1]
        base_directory = posixpath.dirname(base_path).rstrip("/") + "/"
        traversal_root = root if base_directory.startswith(root) else self.project_path
        floor = len(traversal_root.rstrip("/").split("/"))
        # Permit ../records and ../evidence, but never leave even then reenter a snapshot.
        for part in path.split("/"):
            if part == "..":
                require(len(stack) > floor, "relative URL escapes snapshot")
                stack.pop()
            elif part not in ("", "."):
                stack.append(part)
                if "/".join(stack) + "/" == root:
                    floor = len(stack)
        resolved = urllib.parse.urljoin(document_url, reference)
        return self.check(resolved, snapshot=snapshot)


class CheckedRedirect(urllib.request.HTTPRedirectHandler):
    def __init__(self, check):
        super().__init__()
        self.check = check

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        self.check(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch_bytes(url, check, maximum):
    check(url)
    request = urllib.request.Request(url, headers={
        "Accept": "application/json", "Accept-Encoding": "identity",
        "User-Agent": "brand-avoidance-query/1",
    })
    handlers = [CheckedRedirect(check)]
    if urllib.parse.urlsplit(url).hostname in ("localhost", "127.0.0.1", "::1"):
        handlers.append(urllib.request.ProxyHandler({}))
    opener = urllib.request.build_opener(*handlers)
    deadline = time.monotonic() + TIMEOUT_SECONDS
    try:
        with opener.open(request, timeout=TIMEOUT_SECONDS) as response:
            check(response.geturl())
            require(response.status == 200, "artifact HTTP response is not 200")
            require(response.headers.get("Content-Encoding", "identity").lower() == "identity",
                    "unexpected artifact content encoding")
            declared = response.headers.get("Content-Length")
            if declared is not None:
                require(declared.isdecimal() and int(declared) <= maximum, "response size exceeds limit")
            chunks = []
            length = 0
            while True:
                require(time.monotonic() < deadline, "artifact read timeout")
                chunk = response.read1(min(65536, maximum + 1 - length))
                if not chunk:
                    break
                chunks.append(chunk)
                length += len(chunk)
                require(length <= maximum, "response size exceeds limit")
            require(declared is None or length == int(declared), "response Content-Length mismatch")
            return b"".join(chunks), response.geturl()
    except (OSError, urllib.error.URLError, http.client.HTTPException, ValueError) as exc:
        raise ReaderError("artifact request failed: " + str(exc)) from exc


def descriptor(value, document_url, policy, maximum=MAX_DESCRIPTOR_BYTES):
    require(isinstance(value, dict), "file descriptor must be an object")
    require(isinstance(value.get("sha256"), str) and HASH_PATTERN.fullmatch(value["sha256"]),
            "invalid descriptor sha256")
    size = integer(value.get("bytes"), "descriptor.bytes", 1)
    require(size <= maximum, "descriptor exceeds size limit")
    return {"url": policy.resolve(value.get("url"), document_url),
            "sha256": value["sha256"], "bytes": size}


def fetch_document(file, policy, maximum):
    raw, final_url = fetch_bytes(file["url"], policy.check, min(file["bytes"], maximum))
    require(len(raw) == file["bytes"], "artifact byte count mismatch")
    require(hashlib.sha256(raw).hexdigest() == file["sha256"], "artifact SHA-256 mismatch")
    return parse_json(raw), final_url


def read_manifest(manifest_url):
    policy = URLPolicy(manifest_url)
    raw, final_url = fetch_bytes(manifest_url, lambda url: policy.check(url, snapshot=False),
                                 MAX_MANIFEST_BYTES)
    manifest = parse_json(raw)
    version(manifest, "manifest")
    require(type(manifest.get("searchVersion")) is int and manifest["searchVersion"] == 1,
            "unsupported searchVersion")
    require("compatibilityUrl" not in manifest, "legacy compatibilityUrl is not supported")
    data_version = manifest.get("dataVersion")
    require(isinstance(data_version, str) and HASH_PATTERN.fullmatch(data_version), "invalid dataVersion")
    policy.snapshot_path = policy.project_path + "v1/" + data_version + "/"
    commit = text_value(manifest.get("sourceCommit"), "sourceCommit")
    require(re.fullmatch(r"[0-9a-f]{40}", commit), "invalid sourceCommit")
    timestamp = text_value(manifest.get("sourceCommitTime"), "sourceCommitTime")
    try:
        require("T" in timestamp and dt.datetime.fromisoformat(timestamp.replace("Z", "+00:00")).tzinfo
                is not None, "sourceCommitTime must have a timezone")
    except ValueError as exc:
        raise ReaderError("invalid sourceCommitTime") from exc
    if "sourceDirty" in manifest:
        require(type(manifest["sourceDirty"]) is bool, "sourceDirty must be boolean")
    count = integer(manifest.get("recordCount"), "recordCount")
    inventory = descriptor(manifest.get("inventory"), final_url, policy)
    require(inventory["sha256"] == data_version, "inventory hash does not match dataVersion")
    descriptor(manifest.get("catalog"), final_url, policy)
    record_base = policy.resolve(manifest.get("recordBase"), final_url)
    require(record_base.endswith("/"), "recordBase must be a directory")
    schemas = manifest.get("schemas")
    require(isinstance(schemas, dict) and bool(schemas), "schemas must be a nonempty map")
    for name, file in schemas.items():
        text_value(name, "schema name")
        descriptor(file, final_url, policy)
    indexes = manifest.get("indexes")
    require(isinstance(indexes, list), "indexes must be an array")
    require(bool(indexes) == (count > 0), "indexes and recordCount disagree")
    previous = None
    seen_urls = set()
    shards = []
    for index in indexes:
        file = descriptor(index, final_url, policy, MAX_INDEX_BYTES)
        first = text_value(index.get("firstKey"), "firstKey")
        last = text_value(index.get("lastKey"), "lastKey")
        require(first.encode("utf-8") <= last.encode("utf-8"), "reversed index range")
        require(previous is None or previous < first.encode("utf-8"), "overlapping/unsorted index ranges")
        require(file["url"] not in seen_urls, "repeated index URL")
        seen_urls.add(file["url"])
        previous = last.encode("utf-8")
        shards.append(dict(file, firstKey=first, lastKey=last,
                           entryCount=integer(index.get("entryCount"), "entryCount", 1)))
    return manifest, shards, record_base, policy


def read_index(shard, policy, record_base):
    document, document_url = fetch_document(shard, policy, MAX_INDEX_BYTES)
    version(document, "index")
    entries = document.get("entries")
    require(isinstance(entries, list) and len(entries) == shard["entryCount"], "index entryCount mismatch")
    previous = None
    for entry in entries:
        require(isinstance(entry, dict), "index entry must be an object")
        key = text_value(entry.get("key"), "entry.key")
        key_bytes = key.encode("utf-8")
        require(previous is None or previous < key_bytes, "index keys must be unique and ordered")
        previous = key_bytes
        matches = entry.get("matches")
        require(isinstance(matches, list) and bool(matches), "entry.matches must be nonempty")
        for match in matches:
            require(isinstance(match, dict), "index match must be an object")
            for field in ("recordId", "name", "value"):
                text_value(match.get(field), "match." + field)
            require(match.get("field") in ("name", "aliases", "identifiers"), "invalid matched field")
            require(identity_key(match["value"], match["field"]) == key,
                    "entry key disagrees with matched field/value")
            if match["field"] == "name":
                require(match["value"] == match["name"], "matched name disagrees with value")
            for field, suffix in (("record", ".json"), ("page", ".html")):
                file = descriptor(match.get(field), document_url, policy,
                                  MAX_RECORD_BYTES if field == "record" else MAX_DESCRIPTOR_BYTES)
                require(file["url"].startswith(record_base) and file["url"].endswith(suffix),
                        "match descriptor is outside recordBase or has wrong type")
                match[field] = file
    require(entries[0]["key"] == shard["firstKey"] and entries[-1]["key"] == shard["lastKey"],
            "index boundaries disagree with manifest")
    return entries


def string_array(value, label):
    require(isinstance(value, list), label + " must be an array")
    for item in value:
        text_value(item, label + " item", nonempty=False)


def validate_record(record, expected_id):
    require(isinstance(record, dict) and record.get("id") == expected_id, "record ID mismatch")
    for field in ("id", "name", "country", "confidence", "status", "summary", "aiNotes", "lastReviewed"):
        text_value(record.get(field), "record." + field,
                   nonempty=field in ("id", "name", "confidence", "status"))
    require(re.fullmatch(r"[a-z0-9][a-z0-9._-]*", record["id"]), "invalid record ID")
    for field in ("categories", "avoidReasons"):
        string_array(record.get(field), "record." + field)
    for field in ("aliases", "identifiers"):
        if field in record:
            string_array(record[field], "record." + field)
    require(record["confidence"] in ("high", "medium", "low"), "invalid confidence")
    require(record["status"] in ("personal", "watchlist", "confirmed"), "invalid status")
    for field in ("lastReviewed", "temporaryUntil", "reviewAfter"):
        if field in record and record[field]:
            calendar_date(record[field])
        elif field in record:
            text_value(record[field], "record." + field, nonempty=False)
    if "temporaryAlertReason" in record:
        text_value(record["temporaryAlertReason"], "temporaryAlertReason", nonempty=False)
    require(not record.get("temporaryUntil") or bool(record.get("temporaryAlertReason")),
            "temporaryUntil requires temporaryAlertReason")
    sources = record.get("sources")
    require(isinstance(sources, list), "record.sources must be an array")
    for source in sources:
        require(isinstance(source, dict), "source must be an object")
        for field in ("title", "url", "date", "note"):
            text_value(source.get(field), "source." + field, nonempty=False)


def resolve_source_links(document, record_url, policy):
    sources = document["record"]["sources"]
    links = document.get("sourceLinks")
    require(isinstance(links, list), "sourceLinks must be an array")
    expected = {index for index, source in enumerate(sources) if source["url"]}
    seen = set()
    result = []
    for link in links:
        require(isinstance(link, dict), "sourceLink must be an object")
        index = integer(link.get("sourceIndex"), "sourceIndex")
        require(index in expected and index not in seen, "invalid or repeated sourceIndex")
        seen.add(index)
        original = sources[index]["url"]
        require(link.get("originalUrl") == original, "sourceLink originalUrl mismatch")
        url = text_value(link.get("url"), "sourceLink.url")
        if urllib.parse.urlsplit(original).scheme:
            split_url(original, reference=True)
            require(url == original, "external source URL was changed")
            resolved = url
        else:
            require(original.startswith("evidence/"), "relative source is not approved evidence")
            resolved = policy.resolve(url, record_url)
            expected_path = policy.snapshot_path + decoded_path(original)
            require(decoded_path(urllib.parse.urlsplit(resolved).path) == expected_path
                    and "/../" not in expected_path and "/./" not in expected_path,
                    "relative sourceLink does not resolve to snapshot evidence")
        result.append(dict(link, url=resolved))
    require(seen == expected, "sourceLinks do not cover all nonempty source URLs")
    return result


def query_attempt(query, mode, manifest_url, limit, evaluation):
    manifest, shards, record_base, policy = read_manifest(manifest_url)
    key = normalize(query)
    key_bytes = key.encode("utf-8")
    candidates = {}
    metadata = {}
    for shard in shards:
        if mode == "exact" and not (shard["firstKey"].encode("utf-8") <= key_bytes
                                     <= shard["lastKey"].encode("utf-8")):
            continue
        for entry in read_index(shard, policy, record_base):
            for match in entry["matches"]:
                record_id = match["recordId"]
                identity = (match["name"], match["record"], match["page"])
                require(record_id not in metadata or metadata[record_id] == identity,
                        "conflicting descriptors/name for one recordId")
                metadata[record_id] = identity
            if not (entry["key"] == key if mode == "exact" else key in entry["key"]):
                continue
            for match in entry["matches"]:
                terms = candidates.setdefault(match["recordId"], [])
                term = {"field": match["field"], "value": match["value"], "key": entry["key"],
                        "kind": mode}
                if term not in terms:
                    terms.append(term)
    total = len(candidates)
    require(total <= manifest["recordCount"], "matched record count exceeds recordCount")
    matches = []
    for record_id in sorted(candidates, key=lambda value: value.encode("utf-8"))[:limit]:
        name, file, _page = metadata[record_id]
        document, record_url = fetch_document(file, policy, MAX_RECORD_BYTES)
        version(document, "record envelope")
        record = document.get("record")
        validate_record(record, record_id)
        require(record["name"] == name, "index name disagrees with record")
        for term in candidates[record_id]:
            values = [record["name"]] if term["field"] == "name" else record.get(term["field"], [])
            require(term["value"] in values, "matched value is absent from record")
        timeliness = {
            "evaluationDate": evaluation.isoformat(),
            "temporaryExpired": bool(record.get("temporaryUntil")
                                     and evaluation > calendar_date(record["temporaryUntil"])),
            "reviewDue": bool(record.get("reviewAfter")
                              and evaluation >= calendar_date(record["reviewAfter"])),
        }
        matches.append({"recordId": record_id, "matchedTerms": candidates[record_id], "record": record,
                        "sourceLinks": resolve_source_links(document, record_url, policy),
                        "timeliness": timeliness})
    note = "No match does not imply safety. Read each complete record, scope, caveats and sources."
    if mode == "partial":
        note += " Partial matches are candidates, not identity conclusions."
    return {"schemaVersion": 1, "dataVersion": manifest["dataVersion"],
            "sourceCommit": manifest["sourceCommit"], "query": query, "mode": mode,
            "evaluationDate": evaluation.isoformat(), "totalMatches": total,
            "returnedMatches": len(matches), "hasMore": total > len(matches),
            "matches": matches, "note": note}


def search(query, mode="exact", manifest_url=None, limit=20, evaluation_date=None):
    text_value(query, "query")
    require(bool(normalize(query)), "query must not be blank")
    require(mode in ("exact", "partial"), "mode must be exact or partial")
    integer(limit, "limit", 1)
    evaluation = calendar_date(evaluation_date) if evaluation_date is not None else taipei_today()
    manifest_url = manifest_url or os.environ.get("BRAND_AVOIDANCE_MANIFEST_URL", DEFAULT_MANIFEST_URL)
    for attempt in range(2):
        try:
            return query_attempt(query, mode, manifest_url, limit, evaluation)
        except (ReaderError, ValueError, UnicodeError, RecursionError) as exc:
            if attempt == 1:
                raise ReaderError("query unavailable after two complete attempts: " + str(exc)) from exc


class JSONArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        raise ReaderError(message)


def positive_limit(value):
    require(bool(re.fullmatch(r"[0-9]+", value)) and int(value) > 0, "--limit must be a positive integer")
    return int(value)


def main(argv=None):
    parser = JSONArgumentParser(description="Search a manifest/index/record v1 avoidance snapshot.")
    parser.add_argument("query", help="Brand, company, product line or identifier (required).")
    parser.add_argument("--mode", choices=("exact", "partial"), default="exact")
    parser.add_argument("--manifest-url", default=os.environ.get("BRAND_AVOIDANCE_MANIFEST_URL",
                                                                 DEFAULT_MANIFEST_URL))
    parser.add_argument("--limit", type=positive_limit, default=20)
    parser.add_argument("--evaluation-date", help="Asia/Taipei calendar date, YYYY-MM-DD.")
    try:
        args = parser.parse_args(argv)
        result = search(args.query, args.mode, args.manifest_url, args.limit, args.evaluation_date)
    except (ReaderError, ValueError, UnicodeError) as exc:
        print(json.dumps({"schemaVersion": 1, "error": {"message": str(exc)}}, ensure_ascii=True))
        return 2
    print(json.dumps(result, ensure_ascii=True, indent=2, allow_nan=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
