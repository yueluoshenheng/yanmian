"""生成 Mock 数据的脚本，运行后在 mock_data/ 下生成 3 个 JSON 文件"""
import json
import random
from pathlib import Path

DATA_DIR = Path(__file__).parent / "mock_data"

# ========== 发货单数据 ==========

CUSTOMERS = [
    "黄山华康新材料科技股份有限公司",
    "马鞍山圣菲特保温材料科技有限公司",
    "苏州新江阳保温材料有限公司",
    "无锡市纵海新型建材科技有限公司",
    "徐州太展建材科技有限公司",
    "安徽亚强节能科技有限公司",
    "安徽知行节能工程有限公司",
    "杭州塔塑科技有限公司",
    "江阴市天润新建材有限公司",
    "安徽泰辰建材科技有限公司",
    "鑫通华霞（北京）建材有限公司",
    "南京恒尔森节能科技有限公司",
    "安徽矜悦建筑科技有限公司",
    "南京玖金建材有限公司",
    "安徽振博保温建材有限公司",
]

PRODUCTS = [
    ("岩棉板", 0.85),
    ("岩棉条", 0.10),
    ("贴铝箔岩棉板", 0.05),
]

SPEC_MODELS = [
    "容重70", "容重80", "容重90", "容重95", "容重100",
    "容重105", "容重120", "容重130", "容重140",
    "容重155", "容重160", "容重180",
]

DIMENSIONS = [
    (1200, 600), (1200, 600), (1200, 600),
    (2400, 1225), (1200, 600), (1125, 93.5),
    (1184, 96), (1200, 140),
]

THICKNESSES = [30, 40, 43.5, 45, 50, 70, 75, 80, 88.5, 99, 100]

UNIT_PRICES = [1600, 1700, 1710, 1750, 1800, 1900, 2600, 2633.33]

# 日期分布: 02-01 多, 后面少
DATE_DISTRIBUTION = [
    ("2026-02-01", 80),
    ("2026-02-03", 5),
    ("2026-02-05", 9),
    ("2026-02-06", 3),
    ("2026-02-07", 7),
    ("2026-02-08", 7),
]


def generate_shipping_data():
    random.seed(42)
    records = []
    seq = 1
    order_base = 20260201140

    for date, count in DATE_DISTRIBUTION:
        for _ in range(count):
            product_name = random.choices(
                [p[0] for p in PRODUCTS],
                weights=[p[1] for p in PRODUCTS],
            )[0]
            length, width = random.choice(DIMENSIONS)
            thickness = random.choice(THICKNESSES)
            spec = random.choice(SPEC_MODELS)
            cubic_volume = round(random.uniform(2.0, 140.0), 4)
            quantity = round(random.uniform(0.15, 18.0), 4)
            cubic_price = round(random.uniform(100.0, 310.0), 2)
            unit_price = random.choice(UNIT_PRICES)
            total_price = round(cubic_volume * cubic_price, 2)

            records.append({
                "seq": seq,
                "reviewer": "赵学鹏",
                "shipping_date": date,
                "shipping_order_no": str(order_base + seq),
                "customer_name": random.choice(CUSTOMERS),
                "product_name": product_name,
                "length": length,
                "width": width,
                "thickness": thickness,
                "spec_model": spec,
                "cubic_volume": cubic_volume,
                "quantity": quantity,
                "cubic_price": cubic_price,
                "total_price_with_tax": total_price,
                "unit_price_with_tax": unit_price,
            })
            seq += 1

    return records


# ========== 设备数据（基础配置，运行时动态波动） ==========

def generate_equipment_data():
    """生成设备基础配置数据，参数名和范围对齐设计文档"""
    return {
        "production_lines": [
            {
                "line_number": "A1",
                "line_name": "A车间1号产线",
                "equipment_list": [
                    {
                        "id": "EQ_A1_001",
                        "name": "熔炉",
                        "base_parameters": {
                            "temperature": 1280,
                            "fuel_flow": 115,
                            "air_pressure": 0.32
                        },
                        "fluctuation": {
                            "temperature": 30,
                            "fuel_flow": 5,
                            "air_pressure": 0.02
                        },
                        "normal_range": {
                            "temperature": {"min": 1400, "max": 1500, "unit": "℃"},
                            "fuel_flow": {"min": 100, "max": 140, "unit": "m³/h"},
                            "air_pressure": {"min": 0.3, "max": 0.4, "unit": "MPa"}
                        }
                    },
                    {
                        "id": "EQ_A1_002",
                        "name": "离心机",
                        "base_parameters": {
                            "speed": 5800,
                            "vibration": 2.1,
                            "bearing_temp": 65
                        },
                        "fluctuation_pct": 0.03,
                        "normal_range": {
                            "speed": {"min": 5500, "max": 6500, "unit": "rpm"},
                            "vibration": {"min": 0, "max": 3.0, "unit": "mm/s"},
                            "bearing_temp": {"min": 40, "max": 80, "unit": "℃"}
                        }
                    },
                    {
                        "id": "EQ_A1_003",
                        "name": "集棉机",
                        "base_parameters": {
                            "negative_pressure": -850,
                            "conveyor_speed": 12,
                            "cotton_thickness": 80
                        },
                        "fluctuation_pct": 0.03,
                        "normal_range": {
                            "negative_pressure": {"min": -1000, "max": -800, "unit": "Pa"},
                            "conveyor_speed": {"min": 8, "max": 15, "unit": "m/min"},
                            "cotton_thickness": {"min": 60, "max": 120, "unit": "mm"}
                        }
                    },
                    {
                        "id": "EQ_A1_004",
                        "name": "固化炉",
                        "base_parameters": {
                            "temperature": 230,
                            "conveyor_speed": 5,
                            "air_volume": 6500
                        },
                        "fluctuation_pct": 0.03,
                        "normal_range": {
                            "temperature": {"min": 200, "max": 250, "unit": "℃"},
                            "conveyor_speed": {"min": 3, "max": 8, "unit": "m/min"},
                            "air_volume": {"min": 5000, "max": 8000, "unit": "m³/h"}
                        }
                    },
                    {
                        "id": "EQ_A1_005",
                        "name": "切割机",
                        "base_parameters": {
                            "cutting_speed": 12,
                            "blade_temp": 45,
                            "positioning_accuracy": 0.5
                        },
                        "fluctuation_pct": 0.03,
                        "normal_range": {
                            "cutting_speed": {"min": 10, "max": 20, "unit": "m/min"},
                            "blade_temp": {"min": 30, "max": 60, "unit": "℃"},
                            "positioning_accuracy": {"min": 0, "max": 1.0, "unit": "mm"}
                        }
                    },
                ],
            },
            {
                "line_number": "A2",
                "line_name": "A车间2号产线",
                "equipment_list": [
                    {
                        "id": "EQ_A2_001",
                        "name": "熔炉",
                        "base_parameters": {
                            "temperature": 1450,
                            "fuel_flow": 125,
                            "air_pressure": 0.35
                        },
                        "fluctuation": {
                            "temperature": 20,
                            "fuel_flow": 5,
                            "air_pressure": 0.02
                        },
                        "normal_range": {
                            "temperature": {"min": 1400, "max": 1500, "unit": "℃"},
                            "fuel_flow": {"min": 100, "max": 140, "unit": "m³/h"},
                            "air_pressure": {"min": 0.3, "max": 0.4, "unit": "MPa"}
                        }
                    },
                    {
                        "id": "EQ_A2_002",
                        "name": "离心机",
                        "base_parameters": {
                            "speed": 6000,
                            "vibration": 1.8,
                            "bearing_temp": 60
                        },
                        "fluctuation_pct": 0.03,
                        "normal_range": {
                            "speed": {"min": 5500, "max": 6500, "unit": "rpm"},
                            "vibration": {"min": 0, "max": 3.0, "unit": "mm/s"},
                            "bearing_temp": {"min": 40, "max": 80, "unit": "℃"}
                        }
                    },
                    {
                        "id": "EQ_A2_003",
                        "name": "集棉机",
                        "base_parameters": {
                            "negative_pressure": -900,
                            "conveyor_speed": 11,
                            "cotton_thickness": 85
                        },
                        "fluctuation_pct": 0.03,
                        "normal_range": {
                            "negative_pressure": {"min": -1000, "max": -800, "unit": "Pa"},
                            "conveyor_speed": {"min": 8, "max": 15, "unit": "m/min"},
                            "cotton_thickness": {"min": 60, "max": 120, "unit": "mm"}
                        }
                    },
                    {
                        "id": "EQ_A2_004",
                        "name": "固化炉",
                        "base_parameters": {
                            "temperature": 240,
                            "conveyor_speed": 5.5,
                            "air_volume": 6800
                        },
                        "fluctuation_pct": 0.03,
                        "normal_range": {
                            "temperature": {"min": 200, "max": 250, "unit": "℃"},
                            "conveyor_speed": {"min": 3, "max": 8, "unit": "m/min"},
                            "air_volume": {"min": 5000, "max": 8000, "unit": "m³/h"}
                        }
                    },
                    {
                        "id": "EQ_A2_005",
                        "name": "切割机",
                        "base_parameters": {
                            "cutting_speed": 13,
                            "blade_temp": 42,
                            "positioning_accuracy": 0.3
                        },
                        "fluctuation_pct": 0.03,
                        "normal_range": {
                            "cutting_speed": {"min": 10, "max": 20, "unit": "m/min"},
                            "blade_temp": {"min": 30, "max": 60, "unit": "℃"},
                            "positioning_accuracy": {"min": 0, "max": 1.0, "unit": "mm"}
                        }
                    },
                ],
            },
        ]
    }


# ========== 物流数据 ==========

CARRIERS = ["顺丰物流", "德邦物流", "中通快运", "安能物流", "百世快运"]
STATUSES = ["pending", "shipped", "in_transit", "in_transit", "delivered", "delivered"]
LOCATIONS = [
    ("泰安仓库", "已发货"),
    ("济南中转站", "运输中"),
    ("南京分拨中心", "运输中"),
    ("合肥分拨中心", "运输中"),
    ("目的地城市", "派送中"),
    ("客户签收", "已签收"),
]


def generate_logistics_data(shipping_records):
    random.seed(123)
    logistics = []
    for rec in shipping_records:
        order_no = rec["shipping_order_no"]
        status = random.choice(STATUSES)
        carrier = random.choice(CARRIERS)
        ship_date = rec["shipping_date"]

        num_events = {"pending": 0, "shipped": 1, "in_transit": 3, "delivered": 5}
        n = num_events.get(status, 2)
        tracking = []
        for i in range(min(n, len(LOCATIONS))):
            loc, evt = LOCATIONS[i]
            day_offset = i
            d = int(ship_date[-2:]) + day_offset
            tracking.append({
                "time": f"{ship_date[:-2]}{d:02d} {8 + i * 4:02d}:00",
                "location": loc,
                "event": evt,
            })

        arrival_day = int(ship_date[-2:]) + 3
        logistics.append({
            "shipping_order_no": order_no,
            "logistics_no": f"{carrier[:2]}{random.randint(1000000000, 9999999999)}",
            "carrier": carrier,
            "status": status,
            "estimated_arrival": f"{ship_date[:-2]}{min(arrival_day, 28):02d}",
            "tracking": tracking,
        })
    return logistics


# ========== 主函数 ==========

def main():
    DATA_DIR.mkdir(exist_ok=True)

    shipping = generate_shipping_data()
    with open(DATA_DIR / "shipping_data.json", "w", encoding="utf-8") as f:
        json.dump(shipping, f, ensure_ascii=False, indent=2)
    print(f"生成发货单数据: {len(shipping)} 条")

    equipment = generate_equipment_data()
    with open(DATA_DIR / "equipment_data.json", "w", encoding="utf-8") as f:
        json.dump(equipment, f, ensure_ascii=False, indent=2)
    lines = equipment["production_lines"]
    total_eq = sum(len(l["equipment_list"]) for l in lines)
    print(f"生成设备数据: {len(lines)} 条产线, {total_eq} 个设备")

    logistics = generate_logistics_data(shipping)
    with open(DATA_DIR / "logistics_data.json", "w", encoding="utf-8") as f:
        json.dump(logistics, f, ensure_ascii=False, indent=2)
    print(f"生成物流数据: {len(logistics)} 条")


if __name__ == "__main__":
    main()
