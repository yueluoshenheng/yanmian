from typing import Optional
from pydantic import BaseModel, Field


class ExcelGenerateRequest(BaseModel):
    """生成 Excel 报表请求 — Agent 只传查询条件，API 内部自己查数据"""
    report_date: str = Field(..., description="报表日期", examples=["2026-02-01"])
    report_type: str = Field(..., description="报表类型：daily/weekly/monthly", examples=["daily"])
    start_date: str = Field(..., description="数据查询开始日期", examples=["2026-02-01"])
    end_date: str = Field(..., description="数据查询结束日期", examples=["2026-02-01"])
    customer_name: Optional[str] = Field(None, description="可选：按客户名称筛选", examples=["安徽泰辰"])
    product_name: Optional[str] = Field(None, description="可选：按产品名称筛选", examples=["岩棉板"])


class ExcelGenerateResponse(BaseModel):
    """生成 Excel 报表响应"""
    success: bool
    file_name: str
    file_path: str
    storage_id: str
    download_url: str


class ReportMeta(BaseModel):
    """报表元数据"""
    storage_id: str
    file_name: str
    report_date: str
    report_type: str
    created_at: str
    download_url: str
