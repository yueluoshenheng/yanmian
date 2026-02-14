from pydantic import BaseModel


class TrackingEvent(BaseModel):
    """物流跟踪事件"""
    time: str
    location: str
    event: str


class LogisticsResponse(BaseModel):
    """物流查询响应"""
    shipping_order_no: str
    logistics_no: str
    carrier: str
    status: str             # pending / shipped / in_transit / delivered
    estimated_arrival: str
    tracking: list[TrackingEvent]
