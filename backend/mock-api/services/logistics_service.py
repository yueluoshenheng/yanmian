import json
from pathlib import Path

DATA_PATH = Path(__file__).parent.parent / "mock_data" / "logistics_data.json"

_data: list[dict] = []


def _load():
    global _data
    if not _data:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            _data = json.load(f)


def query_by_order_no(shipping_order_no: str) -> dict | None:
    _load()
    for item in _data:
        if item["shipping_order_no"] == shipping_order_no:
            return item
    return None
