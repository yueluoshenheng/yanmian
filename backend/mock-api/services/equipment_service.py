import json
import random
import time
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path

DATA_PATH = Path(__file__).parent.parent / "mock_data" / "equipment_data.json"

_config: dict = {}
_server_start_time: float = time.time()


def _load():
    global _config
    if not _config:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            _config = json.load(f)


def _fluctuate_value(base: float, fluctuation: float) -> float:
    """基于正态分布生成波动值"""
    return round(base + random.gauss(0, fluctuation / 2), 2)


def _fluctuate_pct(base: float, pct: float) -> float:
    """基于百分比生成波动值"""
    delta = abs(base) * pct
    return round(base + random.uniform(-delta, delta), 2)


def _check_status(parameters: dict, normal_range: dict) -> str:
    """根据参数是否超出正常范围自动判定 status"""
    for param_name, value in parameters.items():
        if param_name not in normal_range:
            continue
        r = normal_range[param_name]
        if value < r["min"] or value > r["max"]:
            return "warning"
    return "running"


def _generate_dynamic_equipment(eq_config: dict, scenario: str | None = None) -> dict:
    """根据基础配置动态生成设备数据"""
    eq = {
        "id": eq_config["id"],
        "name": eq_config["name"],
        "normal_range": eq_config["normal_range"],
        "last_update": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"),
    }

    base_params = eq_config["base_parameters"]
    parameters = {}

    # scenario 覆盖
    if scenario == "all_normal":
        # 所有设备在正常范围中间小幅波动
        for param_name, base_val in base_params.items():
            r = eq_config["normal_range"].get(param_name)
            if r:
                mid = (r["min"] + r["max"]) / 2
                parameters[param_name] = _fluctuate_pct(mid, 0.02)
            else:
                parameters[param_name] = _fluctuate_pct(base_val, 0.02)
    elif scenario == "multi_fault" and eq_config["id"] == "EQ_A1_002":
        # A1 离心机振动偏高
        for param_name, base_val in base_params.items():
            if param_name == "vibration":
                parameters[param_name] = round(random.uniform(3.5, 4.5), 2)
            else:
                parameters[param_name] = _fluctuate_pct(base_val, 0.03)
    elif scenario == "degrading" and eq_config["id"] == "EQ_A1_001":
        # A1 熔炉温度逐分钟下降
        minutes_since_start = (time.time() - _server_start_time) / 60
        degraded_temp = 1450 - minutes_since_start * 1
        parameters["temperature"] = round(degraded_temp + random.gauss(0, 5), 2)
        parameters["fuel_flow"] = _fluctuate_pct(base_params["fuel_flow"], 0.03)
        parameters["air_pressure"] = _fluctuate_pct(base_params["air_pressure"], 0.03)
    else:
        # 默认场景：按配置波动
        if "fluctuation" in eq_config:
            for param_name, base_val in base_params.items():
                fl = eq_config["fluctuation"].get(param_name, 0)
                parameters[param_name] = _fluctuate_value(base_val, fl)
        else:
            pct = eq_config.get("fluctuation_pct", 0.03)
            for param_name, base_val in base_params.items():
                parameters[param_name] = _fluctuate_pct(base_val, pct)

    eq["parameters"] = parameters
    eq["status"] = _check_status(parameters, eq_config["normal_range"])
    return eq


def _generate_line_data(line_config: dict, scenario: str | None = None) -> dict:
    """生成整条产线的动态数据"""
    return {
        "line_number": line_config["line_number"],
        "line_name": line_config["line_name"],
        "equipment_list": [
            _generate_dynamic_equipment(eq, scenario)
            for eq in line_config["equipment_list"]
        ],
    }


def query_by_line(line_number: str, scenario: str | None = None) -> dict | None:
    _load()
    for line in _config["production_lines"]:
        if line["line_number"] == line_number:
            return _generate_line_data(line, scenario)
    return None


def query_by_equipment_id(equipment_id: str, scenario: str | None = None) -> dict | None:
    _load()
    for line in _config["production_lines"]:
        for eq in line["equipment_list"]:
            if eq["id"] == equipment_id:
                return {
                    "line_number": line["line_number"],
                    "line_name": line["line_name"],
                    "equipment_list": [_generate_dynamic_equipment(eq, scenario)],
                }
    return None


def query_by_equipment_name(equipment_name: str, scenario: str | None = None) -> dict | None:
    _load()
    results = []
    result_line = None
    for line in _config["production_lines"]:
        for eq in line["equipment_list"]:
            if equipment_name in eq["name"]:
                if result_line is None:
                    result_line = line
                results.append(_generate_dynamic_equipment(eq, scenario))
    if results and result_line:
        return {
            "line_number": result_line["line_number"],
            "line_name": result_line["line_name"],
            "equipment_list": results,
        }
    return None
