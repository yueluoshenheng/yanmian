from pydantic import BaseModel


class ParameterRange(BaseModel):
    """参数正常范围"""
    min: float
    max: float
    unit: str


class Equipment(BaseModel):
    """设备信息"""
    id: str
    name: str
    status: str                                 # running / warning / stopped / maintenance
    parameters: dict[str, float]
    normal_range: dict[str, ParameterRange]
    last_update: str


class EquipmentStatusResponse(BaseModel):
    """设备状态响应"""
    line_number: str
    line_name: str
    equipment_list: list[Equipment]
