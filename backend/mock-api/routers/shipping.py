import re
from fastapi import APIRouter, Query
from models.common import ApiResponse
from services import shipping_service

router = APIRouter(prefix="/api/shipping", tags=["发货单"])

DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")


@router.get("/list")
def get_shipping_list(
    start_date: str = Query(..., description="开始日期 YYYY-MM-DD", examples=["2026-02-01"]),
    end_date: str = Query(..., description="结束日期 YYYY-MM-DD", examples=["2026-02-01"]),
    customer_name: str | None = Query(None, description="客户名称（模糊匹配）"),
    product_name: str | None = Query(None, description="产品名称（模糊匹配）"),
) -> ApiResponse:
    if not DATE_PATTERN.match(start_date) or not DATE_PATTERN.match(end_date):
        return ApiResponse(code=400, message="日期格式错误，请使用 YYYY-MM-DD")

    data = shipping_service.query_shipping_list(
        start_date, end_date, customer_name, product_name
    )
    return ApiResponse(data=data)


@router.get("/daily-summary")
def get_daily_summary(
    start_date: str = Query(..., description="开始日期 YYYY-MM-DD", examples=["2026-02-01"]),
    end_date: str = Query(..., description="结束日期 YYYY-MM-DD", examples=["2026-02-08"]),
) -> ApiResponse:
    if not DATE_PATTERN.match(start_date) or not DATE_PATTERN.match(end_date):
        return ApiResponse(code=400, message="日期格式错误，请使用 YYYY-MM-DD")

    data = shipping_service.query_daily_summary(start_date, end_date)
    return ApiResponse(data=data)
