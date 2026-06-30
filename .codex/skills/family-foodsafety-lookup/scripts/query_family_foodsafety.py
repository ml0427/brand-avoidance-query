#!/usr/bin/env python3
import argparse
import json
import sys
import urllib.error
import urllib.request

BASE_URL = "https://foodsafety.family.com.tw/Web_FFD_2022/"


def request_json(path, payload=None):
    url = BASE_URL + path
    headers = {
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "brand-avoidance-query family-foodsafety-lookup",
    }
    data = None
    method = "GET"
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json;charset=utf-8"
        method = "POST"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code} from {url}: {body[:300]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Request failed for {url}: {exc}") from exc
    return json.loads(raw)


def flatten_products(search_response):
    for category in search_response.get("LIST") or []:
        category_id = category.get("CATEGORY_ID")
        category_name = category.get("CATEGORY_NAME")
        for item in category.get("ITEM") or []:
            row = dict(item)
            row["CATEGORY_ID"] = row.get("CATEGORY_ID") or category_id
            row["CATEGORY_NAME"] = row.get("CATEGORY_NAME") or category_name
            yield row


def product_url(cmno):
    return f"{BASE_URL}product/{cmno}"


def summarize_detail(detail):
    row = dict(detail)
    cmno = row.get("CMNO")
    if cmno:
        row["PRODUCT_URL"] = product_url(cmno)
    return row


def main():
    parser = argparse.ArgumentParser(description="Query Taiwan FamilyMart food-safety product data.")
    parser.add_argument("query", nargs="?", help="Product keyword, package wording, CMNO, or barcode.")
    parser.add_argument("--cmno", help="FamilyMart CMNO to fetch product details directly.")
    parser.add_argument("--barcode", help="Barcode / PRODUCT_ID to search through QueryFsProductListByFilter.")
    parser.add_argument("--limit", type=int, default=20, help="Maximum products to fetch details for keyword/barcode search.")
    parser.add_argument("--raw", action="store_true", help="Print the raw API response instead of normalized detail rows.")
    args = parser.parse_args()

    if not args.query and not args.cmno and not args.barcode:
        parser.error("provide a query, --cmno, or --barcode")

    if args.cmno:
        response = request_json("ws/QueryFsProductByItem", {"CMNO": args.cmno})
        output = response if args.raw else [summarize_detail(row) for row in (response.get("LIST") or [])]
        print(json.dumps(output, ensure_ascii=False, indent=2))
        return 0

    payload = {"MEMBER": "N"}
    if args.barcode:
        payload["PRODUCT_ID"] = args.barcode
    else:
        payload["KEYWORD"] = args.query

    search_response = request_json("ws/QueryFsProductListByFilter", payload)
    if args.raw:
        print(json.dumps(search_response, ensure_ascii=False, indent=2))
        return 0

    products = list(flatten_products(search_response))
    details = []
    selected_products = products[: max(args.limit, 0)]
    for product in selected_products:
        cmno = product.get("CMNO")
        if not cmno:
            continue
        detail_response = request_json("ws/QueryFsProductByItem", {"CMNO": cmno})
        rows = detail_response.get("LIST") or []
        details.extend(summarize_detail(row) for row in rows)

    output = {
        "query": args.barcode or args.query,
        "search_count": len(products),
        "detail_count": len(details),
        "truncated": len(products) > len(selected_products),
        "items": details,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
