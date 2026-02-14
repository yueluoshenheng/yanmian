from fastapi import APIRouter, Query
from models.common import ApiResponse
from services import equipment_service

router = APIRouter(prefix="/api/equipment", tags=["设备监控"])


@router.get("/status")
def get_equipment_status(
    line_number: str | None = Query(None, description="产线编号，如 A1（三选一）", examples=["A1"]),
    equipment_id: str | None = Query(None, description="设备 ID，如 EQ_A1_001（三选一）"),
    equipment_name: str | None = Query(None, description="设备名称，如 熔炉（三选一）"),
    scenario: str | None = Query(None, description="模拟场景：all_normal / multi_fault / degrading"),
) -> ApiResponse:
    if line_number:
        result = equipment_service.query_by_line(line_number, scenario)
    elif equipment_id:
        result = equipment_service.query_by_equipment_id(equipment_id, scenario)
    elif equipment_name:
        result = equipment_service.query_by_equipment_name(equipment_name, scenario)
    else:
        return ApiResponse(
            code=400,
            message="请提供 line_number、equipment_id 或 equipment_name 中的至少一个参数",
        )

    if result is None:
        return ApiResponse(code=404, message="未找到匹配的设备数据")

    return ApiResponse(data=result)
