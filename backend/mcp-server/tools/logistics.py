"""MCP 工具：物流查询"""
import httpx
from config import MOCK_API_BASE_URL


async def query_logistics(shipping_order_no: str) -> dict:
    """根据发货单号查询物流跟踪信息

    Args:
        shipping_order_no: 发货单号，如 20260201141
    """
    if not shipping_order_no or not shipping_order_no.strip():
        return {"code": 422, "message": "发货单号不能为空"}

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{MOCK_API_BASE_URL}/api/logistics/query",
            params={"shipping_order_no": shipping_order_no},
        )
        data = resp.json()

    if data.get("code") != 200:
        return {"code": data.get("code", 500), "message": data.get("message", "物流查询失败")}

    return data["data"]
