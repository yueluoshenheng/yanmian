"""MCP 工具：设备实时监控"""
import httpx
from config import MOCK_API_BASE_URL


async def get_equipment_status(line_number: str = None, equipment_id: str = None,
                                equipment_name: str = None) -> dict:
    """获取生产线设备的实时运行状态和参数

    Args:
        line_number: 产线编号，如 A1、A2
        equipment_id: 设备ID，如 EQ_A1_001
        equipment_name: 设备名称，如 熔炉、离心机
    """
    if not any([line_number, equipment_id, equipment_name]):
        return {"code": 400, "message": "请提供 line_number、equipment_id 或 equipment_name 中的至少一个参数"}

    params = {}
    if line_number:
        params["line_number"] = line_number
    elif equipment_id:
        params["equipment_id"] = equipment_id
    elif equipment_name:
        params["equipment_name"] = equipment_name

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{MOCK_API_BASE_URL}/api/equipment/status", params=params)
        data = resp.json()

    if data.get("code") != 200:
        return {"code": data.get("code", 500), "message": data.get("message", "设备查询失败")}

    return data["data"]
