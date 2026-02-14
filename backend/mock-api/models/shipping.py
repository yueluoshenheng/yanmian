from pydantic import BaseModel


class ShippingRecord(BaseModel):
    """发货单记录 - 字段对照用友 ERP 截图"""
    seq: int                        # 序号
    reviewer: str                   # 审核人
    shipping_date: str              # 发货日期
    shipping_order_no: str          # 发货单号
    customer_name: str              # 客户简称
    product_name: str               # 存货名称
    length: float                   # 长 mm
    width: float                    # 宽 mm
    thickness: float                # 厚 mm
    spec_model: str                 # 规格型号
    cubic_volume: float             # 立方数
    quantity: float                 # 数量
    cubic_price: float              # 立方价
    total_price_with_tax: float     # 价税合计
    unit_price_with_tax: float      # 含税单价


class ShippingSummary(BaseModel):
    """发货单汇总"""
    total_records: int
    total_cubic_volume: float
    total_quantity: float
    total_price_with_tax: float


class ShippingListResponse(BaseModel):
    """发货单列表响应"""
    records: list[ShippingRecord]
    summary: ShippingSummary


class DailySummaryItem(BaseModel):
    """按日汇总项"""
    date: str
    total_orders: int
    total_cubic_volume: float
    total_quantity: float
    total_price_with_tax: float
    customers: list[str]


class PeriodSummary(BaseModel):
    """时段汇总"""
    start_date: str
    end_date: str
    total_days_with_shipment: int
    total_orders: int
    total_cubic_volume: float
    total_quantity: float
    total_price_with_tax: float
