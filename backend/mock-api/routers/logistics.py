from fastapi import APIRouter, Query
from models.common import ApiResponse
from services import logistics_service

router = APIRouter(prefix="/api/logistics", tags=["物流查询"])


@router.get("/query")
def query_logistics(
    shipping_order_no: str = Query(..., description="发货单号", examples=["20260201141"]),
) -> ApiResponse:
    result = logistics_service.query_by_order_no(shipping_order_no)
    if result is None:
        return ApiResponse(code=404, message=f"未找到发货单号 {shipping_order_no} 的物流信息")
    return ApiResponse(data=result)
