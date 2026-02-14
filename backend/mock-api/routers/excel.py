import re
from fastapi import APIRouter, Query
from fastapi.responses import FileResponse
from models.common import ApiResponse
from models.excel import ExcelGenerateRequest
from services import excel_service

router = APIRouter(prefix="/api/excel", tags=["Excel 报表"])

DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
VALID_REPORT_TYPES = {"daily", "weekly", "monthly"}


@router.post("/generate")
def generate_excel(request: ExcelGenerateRequest) -> ApiResponse:
    if not request.report_date:
        return ApiResponse(code=400, message="缺少必填字段：report_date")
    if not request.report_type:
        return ApiResponse(code=400, message="缺少必填字段：report_type")
    if request.report_type not in VALID_REPORT_TYPES:
        return ApiResponse(code=400, message="报表类型必须为 daily/weekly/monthly")
    if not request.start_date or not request.end_date:
        return ApiResponse(code=400, message="缺少必填字段：start_date 和 end_date")

    try:
        result = excel_service.generate_report(
            report_date=request.report_date,
            report_type=request.report_type,
            start_date=request.start_date,
            end_date=request.end_date,
            customer_name=request.customer_name,
            product_name=request.product_name,
        )
        if not result.get("success"):
            return ApiResponse(code=400, message=result.get("message", "生成失败"))
        return ApiResponse(data=result)
    except Exception as e:
        return ApiResponse(code=500, message=f"Excel 报表生成失败: {str(e)}")


@router.get("/reports")
def query_reports(
    start_date: str = Query(..., description="开始日期 YYYY-MM-DD", examples=["2026-01-01"]),
    end_date: str = Query(..., description="结束日期 YYYY-MM-DD", examples=["2026-02-28"]),
    report_type: str | None = Query(None, description="报表类型：daily/weekly/monthly"),
) -> ApiResponse:
    if not DATE_PATTERN.match(start_date) or not DATE_PATTERN.match(end_date):
        return ApiResponse(code=400, message="日期格式错误，请使用 YYYY-MM-DD")

    reports = excel_service.query_reports(start_date, end_date, report_type)
    return ApiResponse(data={"reports": reports})


@router.get("/download/{storage_id}", response_model=None)
def download_report(storage_id: str):
    file_path = excel_service.get_file_path(storage_id)
    if file_path is None:
        return ApiResponse(code=404, message=f"未找到报表 {storage_id}")
    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=file_path.split("/")[-1],
    )
