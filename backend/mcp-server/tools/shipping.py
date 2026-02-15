"""MCP 工具：发货数据查询"""
import httpx
from config import MOCK_API_BASE_URL


async def query_shipment_plan(start_date: str, end_date: str,
                               customer_name: str = None, product_name: str = None) -> dict:
    """从用友ERP系统查询发货数据，支持按日期范围、客户、产品筛选

    Args:
        start_date: 开始日期（YYYY-MM-DD）
        end_date: 结束日期（YYYY-MM-DD）
        customer_name: 客户名称（模糊匹配，可选）
        product_name: 产品名称（模糊匹配，可选）
    """
    if not start_date or not end_date:
        return {"code": 422, "message": "开始日期和结束日期不能为空"}

    params = {"start_date": start_date, "end_date": end_date}
    if customer_name:
        params["customer_name"] = customer_name
    if product_name:
        params["product_name"] = product_name

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{MOCK_API_BASE_URL}/api/shipping/list", params=params)
        data = resp.json()

    if data.get("code") != 200:
        return {"code": data.get("code", 500), "message": data.get("message", "发货查询失败")}

    return data["data"]
