"""MCP 工具：Excel 报表生成与查询"""
import httpx
from config import MOCK_API_BASE_URL


async def generate_shipping_excel(report_date: str, report_type: str,
                                   start_date: str, end_date: str,
                                   customer_name: str = None, product_name: str = None) -> dict:
    """生成发货统计Excel报表，内部自动查询发货数据

    Args:
        report_date: 报表日期（YYYY-MM-DD）
        report_type: 报表类型：daily（日报）/weekly（周报）/monthly（月报）
        start_date: 数据查询开始日期（YYYY-MM-DD）
        end_date: 数据查询结束日期（YYYY-MM-DD）
        customer_name: 按客户名称筛选（可选）
        product_name: 按产品名称筛选（可选）
    """
    if not report_date or not report_type:
        return {"code": 400, "message": "缺少必填字段：report_date 和 report_type"}
    if report_type not in ("daily", "weekly", "monthly"):
        return {"code": 400, "message": "报表类型必须为 daily/weekly/monthly"}
    if not start_date or not end_date:
        return {"code": 400, "message": "缺少必填字段：start_date 和 end_date"}

    payload = {
        "report_date": report_date,
        "report_type": report_type,
        "start_date": start_date,
        "end_date": end_date,
    }
    if customer_name:
        payload["customer_name"] = customer_name
    if product_name:
        payload["product_name"] = product_name

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{MOCK_API_BASE_URL}/api/excel/generate", json=payload)
        data = resp.json()

    if data.get("code") != 200:
        return {"code": data.get("code", 500), "message": data.get("message", "Excel 报表生成失败")}

    return data["data"]


async def query_shipping_reports(start_date: str, end_date: str, report_type: str = None) -> dict:
    """查询已生成的历史报表列表

    Args:
        start_date: 开始日期（YYYY-MM-DD）
        end_date: 结束日期（YYYY-MM-DD）
        report_type: 报表类型筛选（可选）：daily/weekly/monthly
    """
    if not start_date or not end_date:
        return {"code": 422, "message": "开始日期和结束日期不能为空"}

    params = {"start_date": start_date, "end_date": end_date}
    if report_type:
        params["report_type"] = report_type

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{MOCK_API_BASE_URL}/api/excel/reports", params=params)
        data = resp.json()

    if data.get("code") != 200:
        return {"code": data.get("code", 500), "message": data.get("message", "报表查询失败")}

    return data["data"]
