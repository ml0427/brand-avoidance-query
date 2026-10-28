"""Offline protocol tests; all HTTP traffic stays on an in-process localhost server."""

import contextlib
import datetime as dt
import hashlib
import io
import json
import os
import socket
import subprocess
import sys
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest import mock

import search_brand as reader


def encode(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
            + "\n").encode("utf-8")


def file_descriptor(url, raw):
    return {"url": url, "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def record(record_id="alpha", name="Alpha", aliases=None, identifiers=None):
    return {
        "id": record_id, "name": name, "aliases": aliases or [],
        "identifiers": identifiers or [], "country": "\u81fa\u7063",
        "categories": ["category two", "category one"],
        "avoidReasons": ["personal decision", "not a legal finding"],
        "confidence": "medium", "status": "personal", "summary": "Complete scope " * 50,
        "aiNotes": "Do not expand to other branches. " * 100,
        "lastReviewed": "2026-10-01", "temporaryUntil": "2026-10-28",
        "reviewAfter": "2026-10-28", "temporaryAlertReason": "One specific batch only",
        "sources": [
            {"title": "External source", "url": "https://example.test/report:443?a=1#part",
             "date": "2026-10-01", "note": "Unverified personal allegation, not a finding. " * 40},
            {"title": "User evidence", "url": "evidence/proof.png", "date": "2026-10-02",
             "note": "Single branch only"},
            {"title": "URL-free note", "url": "", "date": "", "note": "Keep this note"},
        ],
        "futureField": {"nested": [3, 2, 1], "keep": True},
    }


class Snapshot:
    def __init__(self, records, one_shard=False):
        self.files = {}
        matches_by_key = {}
        for item in records:
            record_id = item["id"]
            links = [{"sourceIndex": index, "originalUrl": source["url"],
                      "url": ("../" + source["url"] if source["url"].startswith("evidence/")
                              else source["url"])}
                     for index, source in enumerate(item["sources"]) if source["url"]]
            raw = encode({"schemaVersion": 1, "record": item, "sourceLinks": links})
            html = ("<h1>" + item["name"] + "</h1>").encode("utf-8")
            self.files["records/" + record_id + ".json"] = raw
            self.files["records/" + record_id + ".html"] = html
            for field in ("name", "aliases", "identifiers"):
                values = [item["name"]] if field == "name" else item.get(field, [])
                for value in values:
                    key = reader.identity_key(value, field)
                    matches_by_key.setdefault(key, []).append({
                        "recordId": record_id, "name": item["name"], "field": field, "value": value,
                        "record": file_descriptor("../records/" + record_id + ".json", raw),
                        "page": file_descriptor("../records/" + record_id + ".html", html),
                    })
        keys = sorted(matches_by_key, key=lambda key: key.encode("utf-8"))
        groups = [keys] if keys and one_shard else [[key] for key in keys]
        self.index_descriptors = []
        for index, group in enumerate(groups):
            path = "index/%04d.json" % index
            raw = encode({"schemaVersion": 1,
                          "entries": [{"key": key, "matches": matches_by_key[key]} for key in group]})
            self.files[path] = raw
            self.index_descriptors.append(dict(file_descriptor(path, raw), firstKey=group[0],
                                               lastKey=group[-1], entryCount=len(group)))
        self.files["catalog/index.html"] = b"<html>catalog</html>\n"
        self.files["schemas/record.json"] = encode({"type": "object"})
        self.files["evidence/proof.png"] = b"not downloaded"
        inventory = encode({"schemaVersion": 1, "files": [
            {"path": path, "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
            for path, raw in sorted(self.files.items())
        ]})
        self.data_version = hashlib.sha256(inventory).hexdigest()
        self.prefix = "/project/v1/" + self.data_version + "/"
        self.files["inventory.json"] = inventory
        self.routes = {self.prefix + path: raw for path, raw in self.files.items()}

        def root_descriptor(path):
            return file_descriptor("v1/" + self.data_version + "/" + path, self.files[path])

        self.manifest = {
            "schemaVersion": 1, "searchVersion": 1, "dataVersion": self.data_version,
            "sourceCommit": "a" * 40, "sourceCommitTime": "2026-10-28T00:00:00Z",
            "sourceDirty": False, "recordCount": len(records),
            "inventory": root_descriptor("inventory.json"),
            "catalog": root_descriptor("catalog/index.html"),
            "recordBase": "v1/" + self.data_version + "/records/",
            "schemas": {"record": root_descriptor("schemas/record.json")},
            "indexes": [dict(item, url="v1/" + self.data_version + "/" + item["url"])
                        for item in self.index_descriptors],
        }

    def rewrite_index(self, index, change):
        path = self.prefix + "index/%04d.json" % index
        document = json.loads(self.routes[path])
        change(document)
        raw = encode(document)
        self.routes[path] = raw
        self.manifest["indexes"][index].update(file_descriptor(
            self.manifest["indexes"][index]["url"], raw))


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.server.requests.append(self.path)
        value = self.server.routes.get(self.path)
        if isinstance(value, list):
            value = value.pop(0) if len(value) > 1 else value[0]
        if value is None:
            status, headers, body = 404, {}, b"missing"
        elif isinstance(value, tuple):
            status, headers, body = value
        else:
            status, headers, body = 200, {}, value
        self.send_response(status)
        for name, value in headers.items():
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


class ReaderTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        cls.server.routes = {}
        cls.server.requests = []
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = "http://127.0.0.1:%s" % cls.server.server_port
        cls.url = cls.base + "/project/manifest.json"
        connect = socket.create_connection

        def local_only(address, *args, **kwargs):
            if address[0] not in ("127.0.0.1", "localhost", "::1"):
                raise AssertionError("test attempted non-local network: " + str(address))
            return connect(address, *args, **kwargs)

        cls.network_guard = mock.patch("socket.create_connection", side_effect=local_only)
        cls.network_guard.start()

    @classmethod
    def tearDownClass(cls):
        cls.network_guard.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def setUp(self):
        self.server.requests.clear()
        self.server.routes = {}

    def deploy(self, snapshot):
        self.server.routes = dict(snapshot.routes)
        self.server.routes["/project/manifest.json"] = encode(snapshot.manifest)

    def search(self, query="Alpha", **kwargs):
        return reader.search(query, manifest_url=self.url, evaluation_date="2026-10-28", **kwargs)

    def cli(self, args):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            status = reader.main(args)
        return status, json.loads(output.getvalue())

    def assert_unavailable(self, snapshot, query="Alpha", mode="exact"):
        self.deploy(snapshot)
        status, result = self.cli([query, "--manifest-url", self.url, "--mode", mode])
        self.assertNotEqual(status, 0)
        self.assertIn("error", result)
        self.assertNotIn("matches", result)
        self.assertNotIn("totalMatches", result)
        self.assertEqual(self.server.requests.count("/project/manifest.json"), 2)

    def test_exact_reads_one_shard_and_preserves_every_original_field(self):
        items = [record(), record("beta", "Beta", ["Alpha partner"])]
        snapshot = Snapshot(items)
        self.deploy(snapshot)
        result = self.search(" \uff21\uff2c\uff30\uff28\uff21\t")
        self.assertEqual(result["mode"], "exact")
        self.assertEqual(result["totalMatches"], 1)
        self.assertEqual(result["matches"][0]["record"], items[0])
        self.assertEqual(result["matches"][0]["matchedTerms"], [
            {"field": "name", "value": "Alpha", "key": "alpha", "kind": "exact"}])
        self.assertEqual(len([path for path in self.server.requests if "/index/" in path]), 1)
        self.assertEqual(len([path for path in self.server.requests if "/records/" in path]), 1)
        self.assertFalse(any("inventory" in path or "evidence" in path or "catalog" in path
                             or "schemas" in path or ".html" in path for path in self.server.requests))
        links = result["matches"][0]["sourceLinks"]
        self.assertEqual(links[0]["url"], items[0]["sources"][0]["url"])
        self.assertEqual(links[1]["url"], self.base + snapshot.prefix + "evidence/proof.png")
        self.assertEqual(len(links), 2)

    def test_partial_scans_all_shards_and_all_selected_records_are_complete(self):
        items = [record(), record("second", "Second", ["Alpha", "Alpha partner"]),
                 record("third", "Third")]
        snapshot = Snapshot(items)
        self.deploy(snapshot)
        result = self.search("alpha", mode="partial")
        self.assertEqual(result["totalMatches"], 2)
        self.assertEqual(result["matches"][1]["record"], items[1])
        self.assertEqual([term["kind"] for term in result["matches"][1]["matchedTerms"]],
                         ["partial", "partial"])
        self.assertIn("candidates", result["note"])
        self.assertEqual(len([path for path in self.server.requests if "/index/" in path]),
                         len(snapshot.manifest["indexes"]))

    def test_collisions_deduplicate_by_id_before_count_and_limit(self):
        snapshot = Snapshot([record("a", "Same", ["SAME"]), record("b", "Same"),
                             record("c", "Other", ["same"])])
        self.deploy(snapshot)
        result = self.search("same", limit=1)
        self.assertEqual(result["totalMatches"], 3)
        self.assertEqual(result["returnedMatches"], 1)
        self.assertTrue(result["hasMore"])
        self.assertEqual(len(result["matches"][0]["matchedTerms"]), 2)
        self.assertEqual(len([path for path in self.server.requests if "/records/" in path]), 1)

    def test_missing_aliases_is_accepted_without_adding_or_changing_original_fields(self):
        original = record(identifiers=["SKU: AB-123"])
        del original["aliases"]
        self.deploy(Snapshot([original]))
        for query in ("Alpha", "AB-123"):
            match = self.search(query)["matches"][0]
            self.assertEqual(match["record"], original)
            self.assertNotIn("aliases", match["record"])

    def test_valid_nohit_does_not_claim_safety_or_fetch_records(self):
        self.deploy(Snapshot([record()]))
        result = self.search("not-in-any-range")
        self.assertEqual(result["totalMatches"], 0)
        self.assertFalse(result["hasMore"])
        self.assertIn("does not imply safety", result["note"])
        self.assertEqual(self.server.requests, ["/project/manifest.json"])

    def test_no_exact_hit_inside_valid_range(self):
        self.deploy(Snapshot([record(), record("z", "Zulu")], one_shard=True))
        result = self.search("beta")
        self.assertEqual(result["totalMatches"], 0)
        self.assertEqual(len(self.server.requests), 2)

    def test_empty_corpus(self):
        self.deploy(Snapshot([]))
        self.assertEqual(self.search()["totalMatches"], 0)

    def test_required_query_invalid_limit_date_and_removed_options_are_json_errors(self):
        for args in ([], [" "], ["Alpha", "--limit", "0"], ["Alpha", "--limit", "-1"],
                     ["Alpha", "--limit", "1.2"], ["Alpha", "--limit", "abc"],
                     ["Alpha", "--evaluation-date", "2026-02-30"],
                     ["Alpha", "--evaluation-date", "20261028"],
                     ["Alpha", "--data-url", self.url], ["--categories"],
                     ["Alpha", "--mode", "fuzzy"]):
            with self.subTest(args=args):
                status, result = self.cli(args)
                self.assertNotEqual(status, 0)
                self.assertIn("error", result)
        self.assertEqual(self.server.requests, [])

    def test_new_environment_variable_and_cli_override(self):
        self.deploy(Snapshot([record()]))
        with mock.patch.dict(os.environ, {"BRAND_AVOIDANCE_MANIFEST_URL": self.url,
                                          "BRAND_AVOIDANCE_DATA_URL": "https://invalid.test/old"}):
            status, result = self.cli(["Alpha"])
            self.assertEqual(status, 0)
            self.assertEqual(result["totalMatches"], 1)
        with mock.patch.dict(os.environ, {"BRAND_AVOIDANCE_MANIFEST_URL": "https://invalid.test/new"}):
            status, _ = self.cli(["Alpha", "--manifest-url", self.url])
            self.assertEqual(status, 0)

    def test_timeliness_is_query_time_taipei_date_and_does_not_mutate_record(self):
        original = record()
        self.deploy(Snapshot([original]))
        for day, expired, due in (("2026-10-27", False, False), ("2026-10-28", False, True),
                                  ("2026-10-29", True, True)):
            result = reader.search("Alpha", manifest_url=self.url, evaluation_date=day)
            match = result["matches"][0]
            self.assertEqual(match["record"], original)
            self.assertEqual(match["timeliness"], {"evaluationDate": day,
                                                  "temporaryExpired": expired, "reviewDue": due})
        frozen = mock.Mock(wraps=dt.datetime)
        frozen.now.return_value = dt.datetime(2026, 10, 29, 0, 1, tzinfo=reader.TAIPEI)
        with mock.patch.object(reader.dt, "datetime", frozen):
            result = reader.search("Alpha", manifest_url=self.url)
        self.assertEqual(result["evaluationDate"], "2026-10-29")
        frozen.now.assert_called_once_with(reader.TAIPEI)

    def test_retry_reloads_manifest_and_every_selected_artifact_after_version_switch(self):
        old = Snapshot([record()])
        changed = record()
        changed["aiNotes"] = "New snapshot must replace every old field"
        new = Snapshot([changed])
        self.deploy(old)
        self.server.routes.update(new.routes)
        self.server.routes["/project/manifest.json"] = [encode(old.manifest), encode(new.manifest)]
        self.server.routes.pop(old.prefix + "records/alpha.json")
        result = self.search()
        self.assertEqual(result["dataVersion"], new.data_version)
        self.assertEqual(result["matches"][0]["record"], changed)
        self.assertEqual(self.server.requests.count("/project/manifest.json"), 2)
        self.assertEqual(len([path for path in self.server.requests if "/index/" in path]), 2)

    def test_unknown_version_can_recover_on_second_manifest(self):
        snapshot = Snapshot([record()])
        bad = dict(snapshot.manifest, schemaVersion=2)
        self.deploy(snapshot)
        self.server.routes["/project/manifest.json"] = [encode(bad), encode(snapshot.manifest)]
        self.assertEqual(self.search()["totalMatches"], 1)
        self.assertEqual(self.server.requests.count("/project/manifest.json"), 2)

    def test_invalid_index_or_record_hash_is_unavailable_not_nohit(self):
        for path in ("index/0000.json", "records/alpha.json"):
            with self.subTest(path=path):
                self.server.requests.clear()
                snapshot = Snapshot([record()])
                raw = snapshot.routes[snapshot.prefix + path]
                snapshot.routes[snapshot.prefix + path] = raw.replace(b"Alpha", b"Xlpha", 1)
                self.assert_unavailable(snapshot)

    def test_invalid_versions_missing_fields_types_and_legacy_array_are_unavailable(self):
        changes = [lambda m: m.update(schemaVersion=True), lambda m: m.update(searchVersion=2),
                   lambda m: m.pop("catalog"), lambda m: m.update(sourceDirty="false"),
                   lambda m: m.update(compatibilityUrl="old.json"), lambda m: m.update(recordCount=-1),
                   lambda m: m.update(recordBase="../escape/"), lambda m: m.update(schemas={}),
                   lambda m: m["inventory"].update(sha256="b" * 64)]
        for change in changes:
            with self.subTest(change=change):
                self.server.requests.clear()
                snapshot = Snapshot([record()])
                change(snapshot.manifest)
                self.assert_unavailable(snapshot)
        self.server.requests.clear()
        snapshot = Snapshot([record()])
        snapshot.manifest = [record()]
        self.assert_unavailable(snapshot)

    def test_overlapping_unsorted_and_mismatched_ranges_are_unavailable(self):
        for fault in ("overlap", "unsorted", "boundary", "count"):
            with self.subTest(fault=fault):
                self.server.requests.clear()
                snapshot = Snapshot([record(), record("b", "Beta")])
                if fault == "overlap":
                    snapshot.manifest["indexes"][1]["firstKey"] = "alpha"
                elif fault == "unsorted":
                    snapshot.manifest["indexes"].reverse()
                elif fault == "boundary":
                    snapshot.manifest["indexes"][0]["lastKey"] = "alphaz"
                else:
                    snapshot.manifest["indexes"][0]["entryCount"] = 2
                self.assert_unavailable(snapshot)

    def test_invalid_matched_field_value_and_record_descriptors(self):
        changes = [lambda m: m.update(field="country"), lambda m: m.update(value="wrong"),
                   lambda m: m.update(name="wrong"), lambda m: m.update(recordId="missing-id"),
                   lambda m: m["record"].update(url="../../../../outside.json"),
                   lambda m: m["page"].update(url="../evidence/proof.png")]
        for change in changes:
            with self.subTest(change=change):
                self.server.requests.clear()
                snapshot = Snapshot([record()])
                snapshot.rewrite_index(0, lambda doc: change(doc["entries"][0]["matches"][0]))
                self.assert_unavailable(snapshot)

    def test_index_value_must_exist_verbatim_in_selected_record(self):
        snapshot = Snapshot([record(aliases=["ALPHA"])])
        snapshot.rewrite_index(0, lambda doc: doc["entries"][0]["matches"][1].update(value="alpha"))
        self.assert_unavailable(snapshot)

    def test_invalid_record_shape_and_source_links_are_unavailable(self):
        changes = [lambda d: d.update(schemaVersion=2), lambda d: d["record"].pop("aiNotes"),
                   lambda d: d["record"].update(sources="not a list"),
                   lambda d: d["record"].update(temporaryUntil="2026-02-30"),
                   lambda d: d.update(sourceLinks=[]),
                   lambda d: d["sourceLinks"][0].update(originalUrl="wrong"),
                   lambda d: d["sourceLinks"][0].update(url="javascript:alert(1)"),
                   lambda d: d["sourceLinks"][1].update(url="../../outside/proof.png")]
        for change in changes:
            with self.subTest(change=change):
                self.server.requests.clear()
                snapshot = Snapshot([record()])
                path = snapshot.prefix + "records/alpha.json"
                doc = json.loads(snapshot.routes[path])
                change(doc)
                raw = encode(doc)
                snapshot.routes[path] = raw
                snapshot.rewrite_index(0, lambda index: index["entries"][0]["matches"][0].update(
                    record=file_descriptor("../records/alpha.json", raw)))
                self.assert_unavailable(snapshot)

    def test_unsafe_manifest_descriptors_never_make_escape_requests(self):
        bad_urls = ["https://outside.test/index.json", "//outside.test/index.json",
                    "/outside/index.json", "../outside.json", "v1/other/index.json",
                    "v1/{v}/../../../outside.json", "v1/{v}/%2e%2e/outside.json",
                    "v1/{v}/%252e%252e/outside.json", "v1/{v}/index%2foutside.json",
                    "v1/{v}/index\\outside.json", "v1/{v}/index.json?extra=1",
                    "v1/{v}/index.json#part", "v1/{v}/\nindex/0000.json"]
        for url in bad_urls:
            with self.subTest(url=url):
                self.server.requests.clear()
                snapshot = Snapshot([record()])
                snapshot.manifest["indexes"][0]["url"] = url.format(v=snapshot.data_version)
                self.assert_unavailable(snapshot)
                self.assertEqual(self.server.requests, ["/project/manifest.json"] * 2)

    def test_parent_traversal_cannot_leave_and_reenter_snapshot(self):
        snapshot = Snapshot([record()])
        escape = "../../" + snapshot.data_version + "/records/alpha.json"
        snapshot.rewrite_index(0, lambda doc: doc["entries"][0]["matches"][0]["record"].update(url=escape))
        self.assert_unavailable(snapshot)

    def test_redirect_cannot_escape_project_snapshot_or_origin(self):
        for target in ("/outside/manifest.json", "https://outside.test/manifest.json"):
            self.server.requests.clear()
            self.server.routes = {"/project/manifest.json": (302, {"Location": target}, b"")}
            status, result = self.cli(["Alpha", "--manifest-url", self.url])
            self.assertEqual(status, 2)
            self.assertIn("error", result)
            self.assertEqual(self.server.requests, ["/project/manifest.json"] * 2)
        self.server.requests.clear()
        snapshot = Snapshot([record()])
        snapshot.routes[snapshot.prefix + "index/0000.json"] = (
            302, {"Location": "/project/v1/other/index.json"}, b"")
        self.assert_unavailable(snapshot)
        self.assertFalse(any(path.endswith("other/index.json") for path in self.server.requests))

    def test_safe_redirect_resolves_links_relative_to_final_document(self):
        snapshot = Snapshot([record()])
        original = snapshot.prefix + "index/0000.json"
        moved = snapshot.prefix + "moved/0000.json"
        snapshot.routes[moved] = snapshot.routes[original]
        snapshot.routes[original] = (302, {"Location": moved}, b"")
        self.deploy(snapshot)
        self.assertEqual(self.search()["totalMatches"], 1)
        self.assertIn(moved, self.server.requests)

    def test_safe_manifest_redirect_and_its_relative_artifact_urls(self):
        snapshot = Snapshot([record()])
        manifest = snapshot.manifest
        for field in ("inventory", "catalog"):
            manifest[field]["url"] = "../" + manifest[field]["url"]
        for file in manifest["indexes"] + list(manifest["schemas"].values()):
            file["url"] = "../" + file["url"]
        manifest["recordBase"] = "../" + manifest["recordBase"]
        self.deploy(snapshot)
        self.server.routes["/project/manifest.json"] = (
            302, {"Location": "/project/entry/manifest.json"}, b"")
        self.server.routes["/project/entry/manifest.json"] = encode(manifest)
        self.assertEqual(self.search()["totalMatches"], 1)

    def test_incomplete_chunked_response_is_retried_and_returns_json_error(self):
        snapshot = Snapshot([record()])
        snapshot.routes[snapshot.prefix + "index/0000.json"] = (
            200, {"Transfer-Encoding": "chunked"}, b"3\r\nab")
        self.assert_unavailable(snapshot)

    def test_size_caps_apply_to_manifest_and_records(self):
        snapshot = Snapshot([record()])
        self.deploy(snapshot)
        with mock.patch.object(reader, "MAX_MANIFEST_BYTES", 100):
            status, result = self.cli(["Alpha", "--manifest-url", self.url])
            self.assertEqual(status, 2)
            self.assertIn("error", result)
        self.assertEqual(self.server.requests.count("/project/manifest.json"), 2)
        self.server.requests.clear()
        with mock.patch.object(reader, "MAX_RECORD_BYTES", 100):
            self.assert_unavailable(snapshot)

    def test_nonlocal_http_credentials_and_unsafe_manifest_paths_are_rejected_before_io(self):
        for url in ("http://example.test/project/manifest.json",
                    "https://user:password@example.test/project/manifest.json",
                    "https://example.test/project/../manifest.json",
                    "https://example.test/project/%2e%2e/manifest.json",
                    "file:///project/manifest.json"):
            status, result = self.cli(["Alpha", "--manifest-url", url])
            self.assertEqual(status, 2)
            self.assertIn("error", result)
        self.assertEqual(self.server.requests, [])

    def test_404_manifest_index_record_and_partial_failure_never_return_nohit(self):
        for path in ("manifest.json", "index/0000.json", "records/alpha.json"):
            with self.subTest(path=path):
                self.server.requests.clear()
                snapshot = Snapshot([record()])
                if path == "manifest.json":
                    self.server.routes = {}
                    status, result = self.cli(["Alpha", "--manifest-url", self.url])
                    self.assertEqual(status, 2)
                    self.assertIn("error", result)
                else:
                    snapshot.routes.pop(snapshot.prefix + path)
                    self.assert_unavailable(snapshot)
        self.server.requests.clear()
        snapshot = Snapshot([record(), record("z", "Zulu")])
        snapshot.routes.pop(snapshot.prefix + "index/0001.json")
        self.assert_unavailable(snapshot, query="missing", mode="partial")

    def test_size_limits_timeouts_and_malformed_json_are_errors(self):
        snapshot = Snapshot([record()])
        snapshot.manifest["indexes"][0]["bytes"] = 65537
        self.assert_unavailable(snapshot)
        self.server.requests.clear()
        snapshot = Snapshot([record()])
        snapshot.routes[snapshot.prefix + "index/0000.json"] += b" "
        self.assert_unavailable(snapshot)
        self.server.requests.clear()
        self.deploy(Snapshot([record()]))
        with mock.patch.object(reader, "TIMEOUT_SECONDS", 0):
            status, result = self.cli(["Alpha", "--manifest-url", self.url])
            self.assertEqual(status, 2)
            self.assertIn("error", result)
        for raw in (b"{bad", b'{"schemaVersion":1,"schemaVersion":1}', b'{"x":NaN}', b'{"x":1e999}',
                    b'{"x":"\\ud800"}', b"\xff"):
            self.server.requests.clear()
            self.server.routes = {"/project/manifest.json": raw}
            status, result = self.cli(["Alpha", "--manifest-url", self.url])
            self.assertEqual(status, 2)
            self.assertIn("error", result)
            self.assertEqual(self.server.requests.count("/project/manifest.json"), 2)

    def test_identifier_whitelist_lowercase_not_casefold_and_url_ports(self):
        self.assertEqual(reader.normalize("  \uff21\tB\ufeffC  "), "a b c")
        self.assertEqual(reader.normalize("Stra\u00dfe"), "stra\u00dfe")
        self.assertNotEqual(reader.normalize("Stra\u00dfe"), "strasse")
        for label in reader.IDENTIFIER_LABELS:
            self.assertEqual(reader.identity_key(label + "\uff1a AB-123", "identifiers"), "ab-123")
        self.assertEqual(reader.identity_key("SKU:", "identifiers"), "sku:")
        self.assertEqual(reader.identity_key("SKU\ufe55 AB", "identifiers"), "sku: ab")
        self.assertEqual(reader.identity_key("SKU: \u00a8", "identifiers"), " \u0308")
        for value in ("https://example.test:8443/path", "example.test:8443", "unknown: Value"):
            self.assertEqual(reader.identity_key(value, "identifiers"), reader.normalize(value))
        snapshot = Snapshot([record(identifiers=["\u689d\u78bc\uff1a 123456",
                                                 "https://example.test:8443/path", "SKU: AB-123"])])
        self.deploy(snapshot)
        for query in ("123456", "AB-123", "https://example.test:8443/path"):
            match = self.search(query)["matches"][0]
            self.assertEqual(match["matchedTerms"][0]["field"], "identifiers")
        self.assertEqual(self.search("8443/path")["totalMatches"], 0)

    def test_utf8_range_comparison_and_no_country_summary_or_note_indexing(self):
        snapshot = Snapshot([record("private", "\ue000"), record("astral", "\U00010000")])
        self.deploy(snapshot)
        result = self.search("\U00010000")
        self.assertEqual(result["matches"][0]["recordId"], "astral")
        self.assertEqual(len([path for path in self.server.requests if "/index/" in path]), 1)
        self.deploy(Snapshot([record()]))
        for query in ("\u81fa\u7063", "category", "Complete scope", "Do not expand", "personal decision"):
            self.assertEqual(self.search(query, mode="partial")["totalMatches"], 0)

    def test_conflicting_record_descriptors_across_shards_fail_before_limiting(self):
        snapshot = Snapshot([record(aliases=["Alpha second"])])
        snapshot.rewrite_index(1, lambda doc: doc["entries"][0]["matches"][0]["record"].update(sha256="b" * 64))
        self.assert_unavailable(snapshot, query="alpha", mode="partial")

    def test_cli_process_exit_status_is_nonzero_with_json_error(self):
        script = Path(reader.__file__).resolve()
        result = subprocess.run([sys.executable, "-B", str(script), "Alpha", "--manifest-url", self.url],
                                capture_output=True, text=True, timeout=15)
        self.assertEqual(result.returncode, 2)
        self.assertIn("error", json.loads(result.stdout))
        self.assertEqual(result.stderr, "")


if __name__ == "__main__":
    unittest.main()
