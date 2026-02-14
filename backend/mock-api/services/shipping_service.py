import json
from pathlib import Path
from collections import defaultdict

DATA_PATH = Path(__file__).parent.parent / "mock_data" / "shipping_data.json"

_data: list[dict] = []


def _load():
    global _data
    if not _data:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            _data = json.load(f)


def query_shipping_list(
    start_date: str,
    end_date: str,
    customer_name: str | None = None,
    product_name: str | None = None,
) -> dict:
    _load()
    filtered = [
        r for r in _data
        if start_date <= r["shipping_date"] <= end_date
    ]
    if customer_name:
        filtered = [r for r in filtered if customer_name in r["customer_name"]]
    if product_name:
        filtered = [r for r in filtered if product_name in r["product_name"]]

    summary = {
        "total_records": len(filtered),
        "total_cubic_volume": round(sum(r["cubic_volume"] for r in filtered), 4),
        "total_quantity": round(sum(r["quantity"] for r in filtered), 4),
        "total_price_with_tax": round(sum(r["total_price_with_tax"] for r in filtered), 2),
    }
    return {"records": filtered, "summary": summary}


def query_daily_summary(start_date: str, end_date: str) -> dict:
    _load()
    filtered = [
        r for r in _data
        if start_date <= r["shipping_date"] <= end_date
    ]

    grouped: dict[str, list[dict]] = defaultdict(list)
    for r in filtered:
        grouped[r["shipping_date"]].append(r)

    daily_summary = []
    for date in sorted(grouped.keys()):
        items = grouped[date]
        daily_summary.append({
            "date": date,
            "total_orders": len(items),
            "total_cubic_volume": round(sum(r["cubic_volume"] for r in items), 4),
            "total_quantity": round(sum(r["quantity"] for r in items), 4),
            "total_price_with_tax": round(sum(r["total_price_with_tax"] for r in items), 2),
            "customers": sorted(set(r["customer_name"] for r in items)),
        })

    period_summary = {
        "start_date": start_date,
        "end_date": end_date,
        "total_days_with_shipment": len(daily_summary),
        "total_orders": len(filtered),
        "total_cubic_volume": round(sum(r["cubic_volume"] for r in filtered), 4),
        "total_quantity": round(sum(r["quantity"] for r in filtered), 4),
        "total_price_with_tax": round(sum(r["total_price_with_tax"] for r in filtered), 2),
    }

    return {"daily_summary": daily_summary, "period_summary": period_summary}
