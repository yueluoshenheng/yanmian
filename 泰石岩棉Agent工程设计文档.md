# 泰石岩棉 Agent 系统 — 工程设计文档

> 版本：V1.0
> 日期：2026-02-08
> 编制：产品部 / 技术部
> 状态：初稿

---

## 一、系统架构概览

```
┌─────────────────────────────────────────────────┐
│                   用户交互层                      │
│         （Web 对话界面 / 企业 IM 集成）            │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                Agent 调度层（LLM）                │
│  接收用户意图 → 规划工具调用 → 生成最终回答        │
└──┬──────────┬──────────┬──────────┬─────────────┘
   │          │          │          │
┌──▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼──────┐
│ 工具1 │ │ 工具2  │ │ 工具3  │ │  工具4    │
│技术文档│ │设备监控│ │物流查询│ │ 用友 API  │
│检索工具│ │  工具  │ │  工具  │ │  接口    │
└──┬───┘ └───┬───┘ └───┬───┘ └───┬──────┘
   │         │         │         │
┌──▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼──────┐
│ RAG  │ │设备监控│ │ 物流  │ │ 用友 ERP │
│知识库 │ │ 系统  │ │ 系统  │ │  系统    │
└──────┘ └───────┘ └───────┘ └──────────┘
```

### 1.0 项目目录结构

> 项目按前后端分离组织，`frontend/` 存放前端代码，`backend/` 存放所有后端服务（3 个 Docker 容器）。

```
yanmian/
├── docker-compose.yml                  # 统一编排 5 个容器（含 PostgreSQL）
├── CLAUDE.md                           # 项目规范文档
├── 泰石岩棉Agent工程设计文档.md          # 工程设计文档
├── 泰石岩棉Agent业务系统需求设计表.md     # 需求设计表
├── specs/                              # 设计文档与技术方案
│   ├── 开发建议与技术方案.md
│   ├── api/                            # Mock API 相关文档
│   │   ├── 设计文档.md
│   │   ├── 开发进度文档.md
│   │   └── 决策文档.md
│   ├── mcp/                            # MCP Server 相关文档
│   │   ├── 设计文档.md
│   │   ├── 开发进度文档.md
│   │   └── 决策文档.md
│   ├── agent/                          # Agent 相关文档
│   │   ├── 设计文档.md
│   │   ├── 开发进度文档.md
│   │   └── 决策文档.md
│   ├── frontend/                       # 前端相关文档
│   │   ├── 设计文档.md
│   │   ├── 开发进度文档.md
│   │   └── 决策文档.md
│   └── db/                             # 数据库相关文档
│       ├── 设计文档.md
│       ├── 开发进度文档.md
│       └── 决策文档.md
│
├── frontend/                           # ===== 前端 =====
│   ├── Dockerfile                      # Docker 4: Nginx 托管
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx                    # 入口
│       ├── App.tsx                     # 路由
│       ├── pages/
│       │   ├── LoginPage.tsx           # 登录/角色选择
│       │   └── ChatPage.tsx            # 对话主界面
│       ├── components/
│       │   ├── ChatMessage.tsx         # 消息组件
│       │   ├── ChatInput.tsx           # 输入框
│       │   ├── SessionList.tsx         # 会话列表
│       │   ├── SceneSelector.tsx       # 场景切换
│       │   ├── EquipmentCard.tsx       # 设备状态卡片
│       │   ├── ShippingTable.tsx       # 发货统计表格
│       │   ├── LogisticsTimeline.tsx   # 物流轨迹时间线
│       │   └── ToolCallStatus.tsx      # 工具调用状态
│       ├── stores/
│       │   ├── chatStore.ts            # 会话状态
│       │   └── userStore.ts            # 用户角色状态
│       └── services/
│           └── api.ts                  # 与 Agent 后端通信
│
└── backend/                            # ===== 后端 =====
    ├── mock-api/                       # Docker 1: FastAPI 模拟接口
    │   ├── Dockerfile
    │   ├── requirements.txt
    │   ├── main.py                     # FastAPI 入口
    │   ├── models/
    │   │   ├── common.py               # 统一响应模型
    │   │   ├── shipping.py             # 发货数据模型
    │   │   ├── equipment.py            # 设备数据模型
    │   │   ├── logistics.py            # 物流数据模型
    │   │   └── excel.py                # Excel 报表数据模型
    │   ├── services/
    │   │   ├── shipping_service.py     # 发货查询逻辑
    │   │   ├── equipment_service.py    # 设备查询逻辑
    │   │   ├── logistics_service.py    # 物流查询逻辑
    │   │   └── excel_service.py        # Excel 生成 + 存储逻辑（openpyxl）
    │   ├── routers/
    │   │   ├── shipping.py             # 发货 API 端点
    │   │   ├── equipment.py            # 设备 API 端点
    │   │   ├── logistics.py            # 物流 API 端点
    │   │   └── excel.py                # Excel 报表 API 端点
    │   ├── mock_data/
    │   │   ├── shipping_data.json
    │   │   ├── equipment_data.json
    │   │   └── logistics_data.json
    │   └── generate_mock_data.py       # Mock 数据生成脚本
    │
    ├── mcp-server/                     # Docker 2: MCP Server
    │   ├── Dockerfile
    │   ├── requirements.txt
    │   ├── server.py                   # MCP Server 入口
    │   ├── tools/
    │   │   ├── knowledge_search.py     # 知识库检索工具
    │   │   ├── knowledge_write.py      # 知识库写入工具
    │   │   ├── equipment.py            # 设备监控工具（调用 Mock API）
    │   │   ├── shipping.py             # 发货统计工具（调用 Mock API）
    │   │   └── logistics.py            # 物流查询工具（调用 Mock API）
    │   ├── knowledge_base/
    │   │   └── documents/              # 原始文档（Markdown/TXT）
    │   ├── shipping_reports/           # 发货统计知识库（Excel 报表归档）
    │   │   ├── index.json              # 报表元数据索引
    │   │   └── 2026/02/                # 按年月归档
    │   │       ├── 发货日报_2026-02-01.xlsx
    │   │       └── ...
    │   └── # 向量数据和关系数据统一存储在 PostgreSQL + pgvector（独立容器）
    │
    └── agent/                          # Docker 3: Agent
        ├── Dockerfile
        ├── requirements.txt
        ├── main.py                     # Agent 入口 + HTTP API
        ├── prompts/
        │   ├── equipment_tuning.py     # 场景一 System Prompt
        │   ├── doc_search.py           # 场景二 System Prompt
        │   └── shipping_stats.py       # 场景三 System Prompt
        ├── agents/
        │   ├── router.py               # 场景路由（意图识别）
        │   ├── tuning_agent.py         # 设备调优 Agent
        │   ├── search_agent.py         # 文档检索 Agent
        │   └── shipping_agent.py       # 发货统计 Agent
        └── mcp_client/
            └── client.py               # MCP Client（连接 MCP Server）
```

**前后端分离说明：**

| 目录 | 职责 | Docker 容器 | 端口 |
|------|------|------------|------|
| `frontend/` | 用户界面，React Web 应用 | Docker 4（Nginx） | 80 |
| `backend/mock-api/` | 模拟用友 ERP / 设备监控 / 物流系统 | Docker 1（FastAPI） | 8000 |
| `backend/mcp-server/` | MCP 工具层 + RAG 知识库 | Docker 2（MCP SDK） | 3000 |
| `backend/agent/` | LLM Agent 智能层 | Docker 3（Python） | 8080 |

**容器间调用链路：**

```
用户浏览器 → frontend(:80) → agent(:8080) → mcp-server(:3000) → mock-api(:8000)
                                  ↓
                           mcp-server(:3000) → PostgreSQL + pgvector（知识库 + 业务数据）
```

### 1.1 用户角色与日常交互场景

> 本系统面向泰石岩棉不同岗位的员工，以下按角色描述他们在日常工作中如何与 Agent 交互。

---

#### 角色一：生产车间组长

| 项目 | 说明 |
|------|------|
| 岗位职责 | 负责某条产线的日常运行，监控产量和设备状态，出现异常时做出调整决策 |
| 使用场景 | 场景一（生产设备智能调优）、场景二（技术文档检索） |
| 使用频率 | 每天多次，产量异常时高频使用 |
| 交互方式 | 手机或车间工位电脑，通过对话界面与 Agent 交流 |

**典型日常交互流程：**

```
━━━ 早班巡检（08:00）━━━

组长: "帮我看一下A车间1号产线现在所有设备的运行状态"

  Agent 提取参数 → line_number="A1"
  调用工具 → T2 get_equipment_status(line_number="A1")
  API 返回 → {
    "line_number": "A1",
    "line_name": "A车间1号产线",
    "equipment_list": [
      {"id":"EQ_A1_001","name":"熔炉","status":"warning",
       "parameters":{"temperature":1280,"fuel_flow":115,"air_pressure":0.32},
       "normal_range":{"temperature":{"min":1400,"max":1500,"unit":"℃"}, ...}},
      {"id":"EQ_A1_002","name":"离心机","status":"running",
       "parameters":{"speed":5800,"vibration":2.1,"bearing_temp":65}, ...},
      ... 共5台设备
    ]
  }

Agent: "A1产线当前状态：
        ✅ 离心机 — 转速5800rpm，正常
        ✅ 集棉机 — 负压-850Pa，正常
        ✅ 固化炉 — 温度230℃，正常
        ✅ 切割机 — 速度12m/min，正常
        ⚠️ 熔炉 — 温度1280℃，低于标准范围(1400-1500℃)"

组长: "熔炉温度偏低会有什么影响？"

  Agent 提取参数 → query="熔炉温度偏低 影响", category="技术手册"
  调用工具 → T1 search_knowledge_base(query="熔炉温度偏低 影响", top_k=5, category="技术手册")
  API 返回 → {
    "results": [
      {"content":"熔炉温度低于1400℃时，岩石熔融不充分，纤维直径偏粗，产量下降15-20%",
       "source":"岩棉生产工艺手册","section":"第3.2节-熔炉温度控制","score":0.92},
      {"content":"温度过低还会导致渣球含量增加，影响产品质量等级",
       "source":"岩棉生产工艺手册","section":"第3.3节-质量影响因素","score":0.85}
    ]
  }

Agent: "根据《岩棉生产工艺手册》第3章：熔炉温度低于1400℃时，
        岩石熔融不充分，会导致纤维直径偏粗、产量下降约15-20%。
        来源：KB01-岩棉生产工艺手册-第3.2节"

━━━ 产量异常处理（10:30）━━━

组长: "1号产线产量下降了，帮我分析一下原因"

  ── Step1: 查询标准流程 ──
  Agent 提取参数 → query="岩棉标准生产流程", category="技术手册"
  调用工具 → T1 search_knowledge_base(query="岩棉标准生产流程", top_k=5, category="技术手册")
  API 返回 → {
    "results": [
      {"content":"标准参数：熔炉1400-1500℃，离心机5500-6500rpm，集棉机-800~-1000Pa...",
       "source":"standard_process.md","section":"全流程参数总表","score":0.95}
    ]
  }

  ── Step2: 获取全部设备状态 ──
  Agent 提取参数 → line_number="A1"（从用户消息中提取"1号产线"→"A1"）
  调用工具 → T2 get_equipment_status(line_number="A1")
  API 返回 → （同上，5台设备的完整参数）

  ── Step3: LLM 对比分析 ──
  Agent 将 Step1 的标准参数与 Step2 的实时参数逐一对比：
    熔炉: 实际1280℃ vs 标准1400-1500℃ → ⚠️ 偏低
    离心机: 实际5800rpm vs 标准5500-6500rpm → ✅ 正常
    集棉机: 实际-850Pa vs 标准-800~-1000Pa → ✅ 正常
    固化炉: 实际230℃ vs 标准200-250℃ → ✅ 正常
    切割机: 实际12m/min vs 标准10-20m/min → ✅ 正常

  ── Step4: 查询解决方案 ──
  Agent 提取参数 → query="熔炉温度偏低 解决方案", category="经验记录"
  调用工具 → T1 search_knowledge_base(query="熔炉温度偏低 解决方案", top_k=3, category="经验记录")
  API 返回 → {
    "results": [
      {"content":"EXP-001: 熔炉温度1280℃，将燃气流量从110调至130m³/h，15分钟后温度恢复至1450℃",
       "source":"troubleshooting_records.md","section":"EXP-001","score":0.94},
      {"content":"EXP-004: 熔炉温度波动大，更换温控传感器后稳定",
       "source":"troubleshooting_records.md","section":"EXP-004","score":0.78}
    ]
  }

Agent: "分析结果：1号产线熔炉温度1280℃，低于标准1400-1500℃。
        这是导致产量下降的主要原因。
        建议：将熔炉温度调整至1450℃。
        依据：历史案例#EXP-001，相同问题调至1450℃后产量恢复。
        请问是否执行调整？"

组长: "好的，我去调"
Agent: "收到，请调整后观察约10分钟，然后告诉我产量是否恢复。"

[10分钟后]

组长: "调完了，产量恢复正常了"

  Agent 提取参数 → 从对话上下文整理本次事件
  调用工具 → T1 write_knowledge_base({
    title: "A1产线熔炉温度偏低导致产量下降",
    problem: "A车间1号产线产量下降，熔炉温度仅1280℃，低于标准1400-1500℃",
    solution: "将熔炉温度调整至1450℃",
    result: "10分钟后产量恢复正常",
    equipment: "熔炉",
    operator: "组长",
    date: "2026-02-12"
  })
  API 返回 → {"success": true, "record_id": "EXP-20260212-001"}

Agent: "已将本次调整记录写入知识库：
        问题：A1产线熔炉温度偏低(1280℃)
        方案：调整至1450℃
        效果：10分钟后产量恢复正常
        记录编号：EXP-20260212-001"

━━━ 调整无效的情况 ━━━

组长: "调了温度但是产量还是没恢复"

  Agent 排除已尝试方案（熔炉温度），重新分析其他设备
  调用工具 → T1 search_knowledge_base(
    query="产量下降 离心机转速 调整", top_k=3, category="经验记录"
  )
  API 返回 → {
    "results": [
      {"content":"EXP-018: 熔炉温度偏低+离心机转速偏低，同时调整后产量恢复",
       "source":"troubleshooting_records.md","section":"EXP-018","score":0.88}
    ]
  }

Agent: "已排除熔炉温度方案。正在检查其他设备……
        发现离心机转速5800rpm虽在正常范围(5500-6500rpm)，
        但结合当前熔炉温度，建议将转速提高至6200rpm以优化纤维成型。
        依据：历史案例#EXP-018，类似工况下调高转速有效。
        是否尝试？"
```

---

#### 角色二：会计 / 非生产岗位人员

| 项目 | 说明 |
|------|------|
| 岗位职责 | 财务核算、成本分析、发货统计报表制作，需要了解生产流程但不直接参与生产 |
| 使用场景 | 场景二（技术文档检索）、场景三（发货统计） |
| 使用频率 | 每天至少1次（发货日报），成本核算时查询技术文档 |
| 交互方式 | 办公电脑，通过 Web 对话界面 |

**典型日常交互流程：**

```
━━━ 成本核算时查询生产知识（周一上午）━━━

会计: "岩棉板的生产流程大概是什么样的？"

  Agent 提取参数 → query="岩棉板 生产流程"
  调用工具 → T1 search_knowledge_base(query="岩棉板 生产流程", top_k=5)
  API 返回 → {
    "results": [
      {"content":"岩棉板生产流程：1.熔炉熔融(1400-1500℃) 2.离心成纤 3.集棉铺毡 4.固化定型 5.切割包装",
       "source":"standard_process.md","section":"第1章-生产流程概述","score":0.96}
    ]
  }

Agent: "岩棉板的生产流程共5个主要环节：
        1. 熔炉熔融 — 将玄武岩等原料在1400-1500℃高温下熔化
        2. 离心成纤 — 熔融液通过离心机甩成纤维
        3. 集棉铺毡 — 纤维在集棉机上铺成棉毡
        4. 固化定型 — 棉毡在固化炉中200-250℃加热固化
        5. 切割包装 — 按规格切割成板材
        来源：KB01-岩棉生产工艺手册-第1章"

会计: "每个环节的主要能耗是什么？"

  Agent 提取参数 → query="岩棉生产 各环节 能耗"
  调用工具 → T1 search_knowledge_base(query="岩棉生产 各环节 能耗", top_k=3)
  API 返回 → {
    "results": [
      {"content":"能耗分布：熔炉(天然气)约60%，离心机(电力)约15%，固化炉(天然气+电力)约20%，其他约5%",
       "source":"standard_process.md","section":"第6章-能耗分析","score":0.91}
    ]
  }

Agent: "各环节主要能耗：
        - 熔炉：天然气，约占总能耗60%
        - 离心机：电力，约占15%
        - 固化炉：天然气+电力，约占20%
        - 其他：电力，约占5%
        来源：KB01-岩棉生产工艺手册-第6章"

会计: "容重95和容重105的区别是什么？"

  Agent 提取参数 → query="容重95 容重105 区别"
  调用工具 → T1 search_knowledge_base(query="容重95 容重105 区别", top_k=3)
  API 返回 → {
    "results": [
      {"content":"容重95：密度95kg/m³，适用于一般保温；容重105：密度105kg/m³，强度更高，适用于承重场景",
       "source":"product_specs.md","section":"第2.1节-产品规格对比","score":0.93}
    ]
  }

Agent: "容重指岩棉板的密度（kg/m³）：
        - 容重95：密度95kg/m³，适用于一般保温场景
        - 容重105：密度105kg/m³，强度更高，适用于有承重要求的场景
        容重越高，单位体积用料越多，生产成本相应增加。
        来源：KB02-产品规格手册-第2.1节"

━━━ 不确定的问题 ━━━

会计: "今年岩棉的市场价格走势怎么样？"
Agent: "抱歉，我的知识库中没有市场价格相关的数据。
        我只能回答岩棉生产工艺、设备操作、产品规格等技术类问题。
        市场价格建议咨询销售部门。"

━━━ 每日发货日报（次日早上统计前一天）━━━

会计: "帮我生成昨天的发货统计"

  ── Step1: 查询发货数据 ──
  Agent 提取参数 → start_date="2026-02-12", end_date="2026-02-12"（自动识别"昨天"为前一天日期）
  调用工具 → T4 query_shipment_plan(start_date="2026-02-12", end_date="2026-02-12")
  API 返回 → {
    "records": [
      {"seq":1,"shipping_date":"2026-02-12","shipping_order_no":"20260212141",
       "customer_name":"安徽泰辰建材科技有限公司","product_name":"岩棉板",
       "spec_model":"容重95","cubic_volume":32.80,"quantity":13.30,
       "total_price_with_tax":7941.96},
      ... 共15条记录
    ],
    "summary": {"total_records":15,"total_cubic_volume":856.34,
                "total_quantity":198.46,"total_price_with_tax":185432.50}
  }

  ── Step2: 补充物流状态 ──
  Agent 提取参数 → 逐条提取 shipping_order_no
  调用工具 → T3 query_logistics(shipping_order_no="20260212141")
  API 返回 → {"shipping_order_no":"20260212141","status":"shipped","carrier":"中通快运",...}
  调用工具 → T3 query_logistics(shipping_order_no="20260212142")
  API 返回 → {"shipping_order_no":"20260212142","status":"shipped","carrier":"顺丰物流",...}
  ... 逐条查询

  ── Step3: 生成 Excel 报表 ──
  Agent 提取参数 → 将 Step1 的 records + summary 整理后传入
  调用工具 → T5 generate_shipping_excel(
    report_date="2026-02-12", report_type="daily",
    records=[...15条记录...],
    summary={"total_records":15,"total_cubic_volume":856.34,...}
  )
  API 返回 → {
    "success": true,
    "file_path": "/shipping_reports/2026/02/发货日报_2026-02-12.xlsx",
    "file_name": "发货日报_2026-02-12.xlsx",
    "storage_id": "RPT_20260212_001"
  }

Agent: "【2026-02-12 发货日报】

        汇总：今日发货 15 单，总方量 856.34 m³，
              总重量 198.46 吨，总金额 ¥185,432.50

        | 客户 | 产品 | 方量(m³) | 重量(吨) | 金额(元) | 物流状态 |
        |------|------|---------|---------|---------|---------|
        | 安徽泰辰建材 | 岩棉板-容重95 | 32.80 | 13.30 | 7,941.96 | 已发货 |
        | 无锡纵海建材 | 岩棉板-容重95 | 34.11 | 10.90 | 7,430.59 | 已发货 |
        | 马鞍山圣菲特 | 岩棉板-容重90 | 98.34 | 6.22 | 13,045.23 | 运输中 |
        | ... | ... | ... | ... | ... | ... |

        📎 Excel 报表已生成：发货日报_2026-02-12.xlsx [点击下载]
        📁 已存入发货统计知识库"

会计: "安徽泰辰那单的物流到哪了？"

  Agent 提取参数 → 从上下文找到安徽泰辰对应的 shipping_order_no="20260212141"
  调用工具 → T3 query_logistics(shipping_order_no="20260212141")
  API 返回 → {
    "shipping_order_no": "20260212141",
    "logistics_no": "中通7044057351",
    "carrier": "中通快运",
    "status": "in_transit",
    "estimated_arrival": "2026-02-15",
    "tracking": [
      {"time":"2026-02-12 08:00","location":"泰安仓库","event":"已发货"},
      {"time":"2026-02-12 14:00","location":"济南中转站","event":"运输中"}
    ]
  }

Agent: "发货单号：20260212141
        物流公司：中通快运
        物流单号：中通7044057351
        当前状态：运输中
        轨迹：
        - 02-12 08:00 泰安仓库 → 已发货
        - 02-12 14:00 济南中转站 → 运输中
        预计到达：2026-02-15"

━━━ 按条件筛选查询 ━━━

会计: "帮我查一下这周发给马鞍山圣菲特的所有订单"

  Agent 提取参数 → start_date="2026-02-10", end_date="2026-02-12", customer_name="马鞍山圣菲特"
  调用工具 → T4 query_shipment_plan(
    start_date="2026-02-10", end_date="2026-02-12", customer_name="马鞍山圣菲特"
  )
  API 返回 → {
    "records": [
      {"shipping_date":"2026-02-10","shipping_order_no":"20260210156",
       "customer_name":"马鞍山圣菲特保温材料科技有限公司","product_name":"岩棉板",
       "spec_model":"容重90","cubic_volume":45.20,"total_price_with_tax":5994.12},
      {"shipping_date":"2026-02-11","shipping_order_no":"20260211163",...},
      {"shipping_date":"2026-02-12","shipping_order_no":"20260212143",...}
    ],
    "summary": {"total_records":3,"total_cubic_volume":195.72,"total_price_with_tax":25958.42}
  }

Agent: "本周（02-10 至 02-12）发给马鞍山圣菲特保温材料科技有限公司的订单：

        | 日期 | 单号 | 产品 | 方量 | 金额 | 物流状态 |
        |------|------|------|------|------|---------|
        | 02-10 | 20260210156 | 岩棉板-容重90 | 45.20 | 5,994.12 | 已签收 |
        | 02-11 | 20260211163 | 岩棉板-容重90 | 52.18 | 6,919.07 | 运输中 |
        | 02-12 | 20260212143 | 岩棉板-容重90 | 98.34 | 13,045.23 | 运输中 |

        合计：3单，方量195.72m³，金额¥25,958.42"

━━━ 月度汇总 ━━━

会计: "帮我统计一下2月份到目前为止的发货总量"

  Agent 提取参数 → start_date="2026-02-01", end_date="2026-02-12"
  调用工具 → T4 query_daily_summary(start_date="2026-02-01", end_date="2026-02-12")
  API 返回 → {
    "daily_summary": [
      {"date":"2026-02-01","total_orders":15,"total_cubic_volume":856.34,...},
      {"date":"2026-02-02","total_orders":12,...},
      ... 共10天数据
    ],
    "period_summary": {
      "total_days_with_shipment":10,"total_orders":111,
      "total_cubic_volume":9856.42,"total_quantity":2345.67,
      "total_price_with_tax":2156789.50
    }
  }

  Agent 同时调用 → T5 generate_shipping_excel(
    report_date="2026-02-12", report_type="monthly", records=[...], summary={...}
  )
  API 返回 → {"success":true,"file_name":"发货月报_2026-02.xlsx","storage_id":"RPT_20260212_M01"}

Agent: "2026年2月发货汇总（02-01 至 02-12）：

        发货天数：10天
        总订单数：111单
        总方量：9,856.42 m³
        总重量：2,345.67 吨
        总金额：¥2,156,789.50

        按日均：11.1单/天，985.64 m³/天

        发货量前3客户：
        1. 马鞍山圣菲特 — 856.34 m³（占比8.7%）
        2. 安徽泰辰建材 — 723.45 m³（占比7.3%）
        3. 无锡纵海建材 — 654.21 m³（占比6.6%）

        📎 Excel 报表已生成：发货月报_2026-02.xlsx [点击下载]
        📁 已存入发货统计知识库"

━━━ 查询历史报表 ━━━

会计: "帮我找一下上周的发货日报"

  Agent 提取参数 → start_date="2026-02-03", end_date="2026-02-09", report_type="daily"
  调用工具 → T5 query_shipping_reports(
    start_date="2026-02-03", end_date="2026-02-09", report_type="daily"
  )
  API 返回 → {
    "reports": [
      {"storage_id":"RPT_20260203_001","file_name":"发货日报_2026-02-03.xlsx",
       "report_date":"2026-02-03","report_type":"daily","created_at":"2026-02-03 17:05"},
      {"storage_id":"RPT_20260204_001","file_name":"发货日报_2026-02-04.xlsx",...},
      {"storage_id":"RPT_20260205_001","file_name":"发货日报_2026-02-05.xlsx",...},
      ...
    ]
  }

Agent: "上周（02-03 至 02-09）的发货日报：

        | 日期 | 文件名 | 生成时间 |
        |------|--------|---------|
        | 02-03 | 发货日报_2026-02-03.xlsx | 02-03 17:05 |
        | 02-04 | 发货日报_2026-02-04.xlsx | 02-04 17:12 |
        | 02-05 | 发货日报_2026-02-05.xlsx | 02-05 16:58 |
        | ... | ... | ... |

        点击文件名即可下载。"
```

---

#### 角色三：生产部管理层

| 项目 | 说明 |
|------|------|
| 岗位职责 | 统筹管理多条产线，关注整体产能和设备运行情况 |
| 使用场景 | 场景一（查看设备状态）、场景三（查看发货数据） |
| 使用频率 | 每天1-2次，了解整体运行情况 |
| 交互方式 | 办公电脑或手机 |

**典型日常交互流程：**

```
━━━ 晨会前快速了解情况（07:50）━━━

主任: "A车间两条产线现在运行情况怎么样？"

  Agent 提取参数 → 识别"A车间两条产线"对应 line_number="A1" 和 line_number="A2"
  调用工具（并行） →
    T2 get_equipment_status(line_number="A1")
    T2 get_equipment_status(line_number="A2")
  API 返回（A1） → {
    "line_number": "A1",
    "line_name": "A车间1号产线",
    "equipment_list": [
      {"id":"EQ_A1_001","name":"熔炉","status":"warning",
       "parameters":{"temperature":1280,"fuel_flow":115,"air_pressure":0.32},
       "normal_range":{"temperature":{"min":1400,"max":1500,"unit":"℃"},...}},
      {"id":"EQ_A1_002","name":"离心机","status":"running",...},
      {"id":"EQ_A1_003","name":"集棉机","status":"running",...},
      {"id":"EQ_A1_004","name":"固化炉","status":"running",...},
      {"id":"EQ_A1_005","name":"切割机","status":"running",...}
    ]
  }
  API 返回（A2） → {
    "line_number": "A2",
    "line_name": "A车间2号产线",
    "equipment_list": [
      {"id":"EQ_A2_001","name":"熔炉","status":"running",...},
      {"id":"EQ_A2_002","name":"离心机","status":"running",...},
      {"id":"EQ_A2_003","name":"集棉机","status":"running",...},
      {"id":"EQ_A2_004","name":"固化炉","status":"running",...},
      {"id":"EQ_A2_005","name":"切割机","status":"running",...}
    ]
  }

Agent: "A车间产线状态：

        A1产线：⚠️ 有异常
        - 熔炉温度1280℃，低于标准(1400-1500℃)
        - 其余4台设备运行正常

        A2产线：✅ 全部正常
        - 5台设备均在标准参数范围内运行"

主任: "昨天的发货完成情况呢？"

  Agent 提取参数 → start_date="2026-02-11", end_date="2026-02-11"
  调用工具 → T4 query_daily_summary(start_date="2026-02-11", end_date="2026-02-11")
  API 返回 → {
    "daily_summary": [
      {"date":"2026-02-11","total_orders":12,"total_cubic_volume":756.23,
       "total_quantity":198.46,"total_price_with_tax":165432.00}
    ],
    "period_summary": {
      "total_days_with_shipment":1,"total_orders":12,
      "total_cubic_volume":756.23,"total_quantity":198.46,
      "total_price_with_tax":165432.00
    }
  }

Agent: "昨日（02-11）发货情况：
        订单数：12单
        总方量：756.23 m³
        总金额：¥165,432.00
        全部已发出，无滞留订单。"
```

---

#### 交互场景汇总矩阵

| 用户角色 | 场景一（设备调优） | 场景二（文档检索） | 场景三（发货统计） | 典型使用时段 |
|---------|:-:|:-:|:-:|------|
| 生产车间组长 | ★★★ 核心 | ★★ 辅助 | — | 全天，异常时高频 |
| 会计/非生产岗 | — | ★★★ 核心 | ★★★ 核心 | 每天早上（统计前一天日报）、工作日按需 |
| 生产部管理层 | ★★ 查看 | ★ 偶尔 | ★★ 查看 | 每天早晚各一次 |

---

## 二、技术选型（建议）

| 组件 | 建议方案 | 备选方案 |
|------|---------|---------|
| LLM | 支持本地部署 + 云端 API（多供应商可切换） | 见下方 LLM 配置方案 |
| Agent 框架 | Agno | LangChain / LlamaIndex |
| 工具协议 | MCP（Model Context Protocol） | Function Calling |
| 向量数据库 | PostgreSQL + pgvector（统一管理） | Milvus / Qdrant |
| 关系型数据库 | PostgreSQL（与向量库共用实例） | — |
| Embedding | BGE-large-zh | text2vec-large-chinese |
| 前端交互 | React 18 + TypeScript + Ant Design | Vue 3 + Element Plus |

### LLM 模型配置方案

系统支持灵活切换 LLM 供应商，用户可在前端设置页面选择本地模型或云端服务。

#### 支持的模型来源

| 类型 | 供应商 | 说明 |
|------|--------|------|
| 本地部署 | Ollama | 本地运行开源模型（Qwen、Llama、DeepSeek 等），无需 API Key |
| 本地部署 | vLLM / LocalAI / LM Studio | 其他本地推理框架，兼容 OpenAI API 格式 |
| 云端服务 | 阿里云百炼（通义千问） | 需填写 API Key |
| 云端服务 | 百度千帆（文心一言） | 需填写 API Key |
| 云端服务 | OpenAI | 需填写 API Key，可能需要代理 |
| 云端服务 | Anthropic（Claude） | 需填写 API Key |
| 云端服务 | DeepSeek | 需填写 API Key |
| 云端服务 | 自定义第三方 | 用户手动填写 Base URL + API Key + 模型名称 |

#### 配置数据结构

```json
{
  "provider_type": "cloud",          // "local" 或 "cloud"
  "provider_name": "aliyun",         // 供应商标识
  "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "api_key": "sk-xxx",              // 云端服务需要，本地可为空
  "model_name": "qwen-plus",        // 模型名称
  "temperature": 0.7,               // 可选，生成温度
  "max_tokens": 4096                // 可选，最大输出长度
}
```

#### 预置供应商配置

| 供应商标识 | 显示名称 | 默认 Base URL | 需要 API Key |
|-----------|---------|--------------|:-:|
| `ollama` | Ollama（本地） | `http://localhost:11434/v1` | 否 |
| `vllm` | vLLM（本地） | `http://localhost:8000/v1` | 否 |
| `lm_studio` | LM Studio（本地） | `http://localhost:1234/v1` | 否 |
| `aliyun` | 阿里云百炼 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 是 |
| `baidu` | 百度千帆 | `https://aip.baidubce.com/rpc/2.0/ai_custom/v1` | 是 |
| `openai` | OpenAI | `https://api.openai.com/v1` | 是 |
| `anthropic` | Anthropic | `https://api.anthropic.com` | 是 |
| `deepseek` | DeepSeek | `https://api.deepseek.com/v1` | 是 |
| `custom` | 自定义 | 用户手动填写 | 用户决定 |

#### Agent 后端对接方式

Agent 统一使用 OpenAI 兼容格式调用 LLM（大多数供应商和本地框架都支持此格式），
切换供应商只需更改 `base_url`、`api_key`、`model_name` 三个参数，无需修改代码。

```python
# Agent 中的 LLM 调用（伪代码）
from agno.models.openai import OpenAIChat

model = OpenAIChat(
    id=config.model_name,           # 如 "qwen-plus"
    api_key=config.api_key,         # 如 "sk-xxx"
    base_url=config.base_url,       # 如 "https://dashscope.aliyuncs.com/compatible-mode/v1"
)
```

---

## 三、后端设计

### 3.1 工具（Tool）详细设计

#### T1：技术文档检索工具（MCP）

| 项目 | 内容 |
|------|------|
| 实现方式 | MCP Server，基于 RAG（向量检索 + 重排序） |
| 知识库来源 | 岩棉制造手册、设备操作手册、近 5 年调整经验记录、FAQ |
| 向量数据库 | PostgreSQL + pgvector（统一管理） |
| Embedding 模型 | 待选型（需支持中文） |

#### 接口定义

```
工具名称: search_knowledge_base
描述: 检索岩棉制造相关的技术文档和历史经验记录
输入参数:
  - query: string        #【必填】自然语言查询内容
  - top_k: int           #【可选】返回结果数量，默认 5
  - category: string     #【可选】筛选类别（"技术手册" / "经验记录" / "FAQ"）
输出:
  - results: list
    - content: string    # 匹配的文档片段
    - source: string     # 来源文档名称
    - section: string    # 所在章节
    - score: float       # 相关性得分
错误响应:
  - query 为空 → code: 400, message: "查询内容不能为空"
  - 检索无匹配结果 → 正常返回，results 为空列表 []
  - Embedding 模型异常 → code: 500, message: "向量化服务异常"
```

#### 知识库写入接口

```
工具名称: write_knowledge_base
描述: 将新的经验记录写入知识库（用于场景一的知识进化）
输入参数:
  - title: string        #【必填】事件标题
  - problem: string      #【必填】异常现象描述
  - solution: string     #【必填】调整方案
  - result: string       #【必填】调整效果
  - equipment: string    #【必填】涉及设备
  - operator: string     #【必填】操作人
  - date: string         #【必填】日期
输出:
  - success: bool
  - record_id: string
错误响应:
  - 必填字段缺失 → code: 400, message: "缺少必填字段：{字段名}"
  - 向量化或写入失败 → code: 500, message: "知识库写入失败"
```

#### 工具封装链路

```
知识库文档（Markdown / 文本）
       ↓  Embedding 模型向量化
PostgreSQL + pgvector（向量存储 + 相似度检索）
       ↓
MCP Server 工具
  search_knowledge_base      → pgvector 相似度查询，返回 top_k 结果
  write_knowledge_base       → 向量化后写入 pgvector
```

---

#### T2：设备实时监控工具

| 项目 | 内容 |
|------|------|
| 实现方式 | MCP Server，对接设备监控系统 API |
| 数据来源 | 生产线设备监控系统（具体协议待确认） |

#### 接口定义

```
工具名称: get_equipment_status
描述: 获取指定设备或产线的实时运行状态
输入参数（以下至少提供一个）:
  - line_number: string        #【可选】产线编号
  - equipment_id: string       #【可选】设备 ID
  - equipment_name: string     #【可选】设备名称
输出:
  - equipment_list: list
    - name: string           # 设备名称
    - id: string             # 设备 ID
    - status: string         # 运行状态（正常/异常/停机）
    - parameters: object     # 当前运行参数
      - temperature: float   # 温度（如适用）
      - speed: float         # 转速（如适用）
      - pressure: float      # 压力（如适用）
      - ...                  # 其他设备特有参数
    - normal_range: object   # 各参数正常范围
    - last_update: string    # 数据更新时间
错误响应:
  - 全部参数为空 → code: 400, message: "请提供 line_number、equipment_id 或 equipment_name 中的至少一个参数"
  - 参数有值但查不到 → code: 404, message: "未找到匹配的设备数据"
```

#### 工具封装链路

```
设备监控系统（实时数据采集）
       ↓
FastAPI 接口（Mock API 层）
  GET /api/equipment/status?line_number=&equipment_id=&equipment_name=
       ↓
MCP Server 工具
  get_equipment_status       → 调用 GET /api/equipment/status
```

#### 动态模拟数据设计

> 为了让模拟更贴近真实场景，设备监控数据不使用静态 JSON 直接返回，
> 而是每次调用时基于基础配置动态生成波动数据。

**实现原理：**

```
equipment_data.json（基础配置）
  ↓ 定义设备列表、基准值、正常范围
equipment_service.py（动态生成）
  ↓ 每次调用时：基准值 ± 随机波动 → 自动判断 status → 设置 last_update 为当前时间
API 返回（每次数值不同）
```

**波动规则：**

| 设备 | 参数 | 基准值 | 波动方式 | 效果 |
|------|------|--------|---------|------|
| A1 熔炉 | temperature | 1280 | ±30（正态分布） | 始终在 1250~1310℃，持续低于标准 1400℃，每次查都是 warning |
| A1 熔炉 | fuel_flow | 115 | ±5 | 在 110~120 范围波动，偏低 |
| A1 熔炉 | air_pressure | 0.32 | ±0.02 | 在正常范围内小幅波动 |
| A2 熔炉 | temperature | 1450 | ±20 | 正常范围内波动，偶尔踩线触发 warning |
| 其他正常设备 | 各参数 | 当前值 | ±3% | 在正常范围内随机波动 |

**status 自动判定逻辑：**

```python
# 伪代码
for param_name, value in equipment.parameters:
    range = equipment.normal_range[param_name]
    if value < range.min or value > range.max:
        equipment.status = "warning"
        break
else:
    equipment.status = "running"
```

**场景模式（通过 API 参数切换）：**

```
GET /api/equipment/status?line_number=A1                    → 默认场景
GET /api/equipment/status?line_number=A1&scenario=all_normal → 全部正常
GET /api/equipment/status?line_number=A1&scenario=multi_fault → 多设备异常
GET /api/equipment/status?line_number=A1&scenario=degrading   → 渐进恶化
```

| 场景标识 | 名称 | 说明 |
|---------|------|------|
| 不传（默认） | 单设备异常 | A1 熔炉持续异常，其余设备正常范围内波动 |
| `all_normal` | 全部正常 | 所有设备基准值设在正常范围中间，小幅波动 |
| `multi_fault` | 多设备异常 | A1 熔炉温度偏低 + A1 离心机振动偏高，模拟连锁故障 |
| `degrading` | 渐进恶化 | A1 熔炉温度基于当前时间逐分钟下降 1℃，模拟设备逐渐劣化 |

**`degrading` 渐进恶化算法：**

```python
import time

base_temp = 1450  # 初始正常温度
minutes_since_start = (time.time() - server_start_time) / 60
current_temp = base_temp - minutes_since_start * 1  # 每分钟降 1℃

# 效果：启动后约 50 分钟，温度从 1450℃ 降到 1400℃ 触发 warning
#       约 170 分钟后降到 1280℃，模拟严重异常
```

**equipment_data.json 角色变化：**

改造前：直接作为 API 返回数据（静态）
改造后：作为基础配置文件，定义设备列表、基准参数值、正常范围，Service 层读取后动态生成波动值

---

#### T3：物流查询工具

| 项目 | 内容 |
|------|------|
| 实现方式 | MCP Server，对接物流系统 |
| 数据来源 | 物流管理系统 / 第三方物流平台 |

#### 接口定义

```
工具名称: query_logistics
描述: 查询发货和物流状态信息
输入参数:
  - shipping_order_no: string #【必填】发货单号
输出:
  - shipments: list
    - shipping_order_no: string # 发货单号
    - customer: string    # 客户名称
    - product: string     # 产品名称
    - planned_qty: float  # 计划发货量
    - actual_qty: float   # 实际发货量
    - status: string      # 状态（待发货/已发货/在途/已签收）
    - logistics_no: string # 物流单号
错误响应:
  - shipping_order_no 为空 → code: 422, message: "发货单号不能为空"
  - 查不到物流信息 → code: 404, message: "未找到发货单号 {shipping_order_no} 的物流信息"
```

#### 工具封装链路

```
物流管理系统 / 第三方物流平台
       ↓
FastAPI 接口（Mock API 层）
  GET /api/logistics/query?shipping_order_no=
       ↓
MCP Server 工具
  query_logistics            → 调用 GET /api/logistics/query
```

---

#### T4：用友 API 接口

| 项目 | 内容 |
|------|------|
| 实现方式 | MCP Server，对接用友 ERP OpenAPI |
| 数据来源 | 用友 ERP 系统 |

#### 接口定义 — 发货数据查询

```
工具名称: query_shipment_plan
描述: 从用友系统查询计划发货量和实际发货量
输入参数:
  - start_date: string    #【必填】开始日期
  - end_date: string      #【必填】结束日期
  - product_name: string  #【可选】产品名称（模糊匹配）
  - customer_name: string #【可选】客户名称（模糊匹配）
输出:
  - records: list
    - shipping_date: string     # 发货日期
    - shipping_order_no: string # 发货单号
    - customer_name: string     # 客户名称
    - product_name: string      # 产品名称
    - spec_model: string        # 规格型号（如"容重95"）
    - cubic_volume: float       # 方量
    - quantity: float           # 重量
    - total_price_with_tax: float # 含税金额
  - summary: object
    - total_records: int        # 总记录数
    - total_cubic_volume: float # 总方量
    - total_quantity: float     # 总重量
    - total_price_with_tax: float # 总金额
错误响应:
  - start_date 或 end_date 为空 → code: 422, message: "开始日期和结束日期不能为空"
  - 日期格式错误 → code: 400, message: "日期格式错误，请使用 YYYY-MM-DD"
  - 查询范围内无数据 → 正常返回，records 为空列表 []，summary 各字段为 0
```

#### 工具封装链路

```
用友 ERP 系统（OpenAPI）
       ↓
FastAPI 接口（Mock API 层）
  GET /api/shipping/list?start_date=&end_date=&customer_name=&product_name=
  GET /api/shipping/daily-summary?start_date=&end_date=
       ↓
MCP Server 工具
  query_shipment_plan        → 调用 GET /api/shipping/list + /daily-summary
```

---

#### T5：Excel 报表生成工具

| 项目 | 内容 |
|------|------|
| 实现方式 | 自研 Excel 生成工具 → 封装为 API 接口 → 封装为 MCP Server 工具 |
| 技术方案 | Python openpyxl 库生成 .xlsx 文件 |
| 存储位置 | 生成的 Excel 文件存入「发货统计知识库」，按日期归档 |

#### 接口定义 — 生成 Excel 报表

```
工具名称: generate_shipping_excel
描述: 将发货统计数据生成 Excel 报表，并存入发货统计知识库
输入参数:
  - report_date: string       #【必填】报表日期，如 "2026-02-12"
  - report_type: string       #【必填】报表类型（"daily" 日报 / "weekly" 周报 / "monthly" 月报）
  - records: list             #【必填】发货记录数据
    - shipping_date: string
    - shipping_order_no: string
    - customer_name: string
    - product_name: string
    - spec_model: string
    - cubic_volume: float
    - quantity: float
    - total_price_with_tax: float
  - summary: object           #【必填】汇总数据
    - total_records: int
    - total_cubic_volume: float
    - total_quantity: float
    - total_price_with_tax: float
输出:
  - success: bool
  - file_path: string         # 生成的 Excel 文件路径
  - file_name: string         # 文件名，如 "发货日报_2026-02-12.xlsx"
  - storage_id: string        # 知识库存储 ID
  - download_url: string      # 下载地址，如 "/api/excel/download/RPT_20260212_001"
错误响应:
  - 必填字段缺失 → code: 400, message: "缺少必填字段：{字段名}"
  - records 为空列表 → code: 400, message: "发货记录数据不能为空"
  - report_type 不合法 → code: 400, message: "报表类型必须为 daily/weekly/monthly"
  - 文件生成失败 → code: 500, message: "Excel 报表生成失败"
```

#### 接口定义 — 查询历史报表

```
工具名称: query_shipping_reports
描述: 从发货统计知识库中查询历史报表列表
输入参数:
  - start_date: string        #【必填】开始日期
  - end_date: string          #【必填】结束日期
  - report_type: string       #【可选】报表类型筛选
输出:
  - reports: list
    - storage_id: string
    - file_name: string
    - report_date: string
    - report_type: string
    - created_at: string
    - file_path: string       # 可下载路径
错误响应:
  - start_date 或 end_date 为空 → code: 422, message: "开始日期和结束日期不能为空"
  - 查询范围内无报表 → 正常返回，reports 为空列表 []
```

#### 工具封装链路

```
openpyxl 生成 Excel
       ↓
FastAPI 接口（Mock API 层）
  POST /api/excel/generate        → 生成报表并存储
  GET  /api/excel/reports         → 查询历史报表
  GET  /api/excel/download/{id}   → 下载指定报表
       ↓
MCP Server 工具
  generate_shipping_excel         → 调用 POST /api/excel/generate
  query_shipping_reports          → 调用 GET /api/excel/reports
```

---

### 3.2 知识库设计

#### 4.1 知识库分类

| 类别 | 内容 | 数据格式 | 更新频率 |
|------|------|---------|---------|
| 技术手册 | 岩棉制造工艺文档、设备操作手册 | PDF/Word → 分段向量化 | 低频（文档更新时） |
| 经验记录 | 近 5 年设备调整经验、老员工处理方案 | 结构化文本 → 向量化 | 持续增长（每次成功调优后写入） |
| FAQ | 常见问题与解答 | 问答对 → 向量化 | 低频 |
| 发货统计报表 | 每日/周/月发货统计 Excel 报表 | .xlsx 文件归档 + JSON 索引 | 每日（自动生成后存入） |

> **发货统计知识库说明：**
> - 存储路径：`backend/mcp-server/shipping_reports/`，按年月归档（如 `2026/02/`）
> - 文件命名：`发货日报_2026-02-12.xlsx`、`发货周报_2026-W07.xlsx`、`发货月报_2026-02.xlsx`
> - 元数据索引：每份报表的日期、类型、文件路径记录在 JSON 索引文件中，支持快速查询
> - 用途：会计可随时查询和下载历史报表，无需重复生成

#### 4.2 知识库数据准备清单

| 编号 | 资料名称 | 提供方 | 格式 | 状态 |
|------|---------|--------|------|------|
| KB01 | 岩棉生产工艺手册 | 生产部 | PDF/Word | 待提供 |
| KB02 | 各设备操作手册 | 生产部 | PDF/Word | 待提供 |
| KB03 | 设备参数正常范围表 | 生产部 | Excel | 待提供 |
| KB04 | 近 5 年设备调整记录 | 生产部 | Excel/文本 | 待提供 |
| KB05 | 常见生产问题 FAQ | 生产部 | 文本 | 待整理 |

#### 4.3 模拟数据完整准备方案

> 当前阶段目标是模拟整个业务场景，让系统跑通完整链路。以下列出所有需要准备的模拟数据，分为三层：Mock API 数据、知识库文档、Excel 报表样本。

---

#### 一、Mock API 层 — 业务数据（JSON）

##### ① 发货数据 `shipping_data.json` ✅ 已完成

| 项目 | 当前状态 |
|------|---------|
| 记录数 | 111 条 |
| 日期范围 | 2026-02-01 ~ 2026-02-08（8天） |
| 客户数 | 15 家（安徽泰辰建材、无锡纵海建材、马鞍山圣菲特等） |
| 产品种类 | 3 种（岩棉板、岩棉条、贴铝箔岩棉板） |
| 字段 | 序号、审核人、日期、单号、客户、产品、尺寸、容重、方量、重量、单价、金额 |

##### ② 设备监控数据 `equipment_data.json` ✅ 已完成

| 项目 | 当前状态 |
|------|---------|
| 产线数 | 2 条（A1、A2） |
| 每条产线设备 | 5 台（熔炉、离心机、集棉机、固化炉、切割机） |
| 异常场景 | A1 产线熔炉温度 1280℃（低于标准 1400-1500℃），状态 warning |
| 正常场景 | A2 产线全部设备参数在标准范围内，状态 running |

每台设备包含的参数：

| 设备 | 监控参数 | 标准范围 |
|------|---------|---------|
| 熔炉 | 温度、燃气流量、风压 | 1400-1500℃、100-140m³/h、0.3-0.4MPa |
| 离心机 | 转速、振动值、轴承温度 | 5500-6500rpm、0-3.0mm/s、40-80℃ |
| 集棉机 | 负压、传送速度、棉层厚度 | -800~-1000Pa、8-15m/min、60-120mm |
| 固化炉 | 温度、传送速度、风量 | 200-250℃、3-8m/min、5000-8000m³/h |
| 切割机 | 切割速度、刀片温度、定位精度 | 10-20m/min、30-60℃、±1mm |

##### ③ 物流数据 `logistics_data.json` ✅ 已完成

| 项目 | 当前状态 |
|------|---------|
| 记录数 | 111 条（与发货记录一一对应） |
| 物流公司 | 中通快运、顺丰物流等 |
| 状态分布 | pending(18)、shipped(16)、in_transit(47)、delivered(30) |
| 物流轨迹 | in_transit 和 delivered 状态包含 2-4 条轨迹记录 |

---

#### 二、知识库层 — 模拟文档（Markdown/TXT）

> 以下文档需要我们自己编写，模拟客户提供的真实资料。存放在 `backend/mcp-server/knowledge_base/documents/` 目录下。

##### ① `standard_process.md` — 岩棉标准生产流程

```
需要包含的内容：

1. 原料准备
   - 主要原料：玄武岩、辉绿�ite、白云石等
   - 配比标准：玄武岩 60-70%、辉绿岩 20-30%、白云石 5-10%
   - 原料粒度要求：≤50mm

2. 熔炉熔融（第一道工序）
   - 标准温度范围：1400-1500℃
   - 燃气流量：100-140 m³/h
   - 风压：0.3-0.4 MPa
   - 熔融时间：约 4-6 小时
   - 质量指标：熔液流动性良好，无明显未熔颗粒

3. 离心成纤（第二道工序）
   - 标准转速：5500-6500 rpm
   - 振动值：≤3.0 mm/s
   - 轴承温度：40-80℃
   - 纤维直径目标：4-7 μm
   - 渣球含量：≤10%

4. 集棉铺毡（第三道工序）
   - 负压范围：-800 ~ -1000 Pa
   - 传送速度：8-15 m/min
   - 棉层厚度：60-120 mm（根据产品规格调整）
   - 均匀度要求：厚度偏差 ≤±5%

5. 固化定型（第四道工序）
   - 固化温度：200-250℃
   - 传送速度：3-8 m/min
   - 风量：5000-8000 m³/h
   - 固化时间：根据厚度，一般 3-10 分钟
   - 粘结剂固化率：≥95%

6. 切割包装（第五道工序）
   - 切割速度：10-20 m/min
   - 刀片温度：30-60℃
   - 定位精度：±1 mm
   - 标准规格：1200×600mm，厚度 30-100mm
   - 包装方式：热缩膜包装，码垛入库
```

##### ② `equipment_manual_*.md` — 各设备操作手册（5 份）

```
每份设备手册需要包含：

1. 设备概述
   - 设备名称、型号、生产厂家
   - 在产线中的位置和作用
   - 主要技术参数

2. 操作规程
   - 开机前检查项目
   - 启动步骤
   - 正常运行监控要点
   - 停机步骤

3. 参数标准
   - 各监控参数的标准范围（与 equipment_data.json 中的 normal_range 一致）
   - 参数偏离时的影响说明
   - 参数调整方法和步骤

4. 常见故障与处理
   - 故障现象 → 可能原因 → 处理方法
   - 至少列出 3-5 种常见故障

5. 维护保养
   - 日常保养项目
   - 定期检修周期
```

需要编写的 5 份手册：

| 文件名 | 设备 | 重点内容 |
|--------|------|---------|
| `equipment_manual_furnace.md` | 熔炉 | 温度控制、燃气调节、耐火材料检查 |
| `equipment_manual_centrifuge.md` | 离心机 | 转速调节、振动监测、轴承润滑 |
| `equipment_manual_collector.md` | 集棉机 | 负压调节、棉层均匀度控制 |
| `equipment_manual_curing.md` | 固化炉 | 温度曲线、风量控制、粘结剂固化 |
| `equipment_manual_cutter.md` | 切割机 | 刀片维护、尺寸精度校准 |

##### ③ `troubleshooting_records.md` — 历史故障处理经验记录

> 这是场景一（设备调优）的核心数据，Agent 会从中检索解决方案。需要模拟多条真实的故障处理记录。

```
需要准备的模拟记录（至少 15-20 条），覆盖以下场景：

━━━ 熔炉相关（5条）━━━
EXP-001: 熔炉温度偏低（1280℃）→ 调高燃气流量至130m³/h → 温度恢复至1450℃，产量恢复
EXP-002: 熔炉温度偏高（1550℃）→ 降低燃气流量至105m³/h → 温度降至1480℃，纤维质量改善
EXP-003: 熔炉风压不足（0.25MPa）→ 检查鼓风机，清理进风口 → 风压恢复至0.35MPa
EXP-004: 熔炉温度波动大（±50℃）→ 更换温控传感器 → 温度稳定在1450±10℃
EXP-005: 熔炉出料口堵塞 → 停机清理，调整出料口角度 → 恢复正常出料

━━━ 离心机相关（4条）━━━
EXP-006: 离心机振动过大（4.2mm/s）→ 更换轴承 → 振动降至1.8mm/s
EXP-007: 离心机转速不稳（波动±500rpm）→ 检查变频器参数 → 转速稳定
EXP-008: 纤维直径偏粗（>10μm）→ 提高转速至6200rpm + 调高熔炉温度 → 纤维直径恢复至5μm
EXP-009: 离心机轴承温度过高（90℃）→ 补充润滑油，检查冷却系统 → 温度降至65℃

━━━ 集棉机相关（3条）━━━
EXP-010: 棉层厚度不均（偏差>10%）→ 调整负压分布，清理滤网 → 均匀度恢复
EXP-011: 集棉机负压不足（-600Pa）→ 检查风机皮带，更换密封条 → 负压恢复至-900Pa
EXP-012: 棉层出现空洞 → 检查喷胶系统，调整纤维分布器角度 → 空洞消除

━━━ 固化炉相关（3条）━━━
EXP-013: 固化炉温度偏低（180℃）→ 检查加热元件，更换损坏的电热管 → 温度恢复至230℃
EXP-014: 产品固化不完全（粘结剂固化率<90%）→ 降低传送速度至4m/min → 固化率提升至97%
EXP-015: 固化炉内温度不均匀 → 调整风道挡板，清理循环风机 → 温差缩小至±5℃

━━━ 切割机相关（2条）━━━
EXP-016: 切割尺寸偏差大（>3mm）→ 校准定位传感器，更换磨损刀片 → 精度恢复至±0.5mm
EXP-017: 切割面毛糙 → 更换刀片，调整切割速度至15m/min → 切割面光滑

━━━ 综合/多设备联动（3条）━━━
EXP-018: 产量整体下降15% → 排查发现熔炉温度偏低+离心机转速偏低 → 同时调整两台设备 → 产量恢复
EXP-019: 产品密度不达标（容重<90）→ 调整集棉机传送速度+固化炉温度 → 密度恢复至95
EXP-020: 换产品规格（从容重95切换到容重120）→ 调整全线参数 → 切换完成，首件合格
```

每条记录的标准格式：

```json
{
  "record_id": "EXP-001",
  "date": "2025-03-12",
  "line": "A1",
  "title": "熔炉温度偏低导致产量下降",
  "problem": "A车间1号产线产量下降约15%，巡检发现熔炉温度仅1280℃",
  "root_cause": "燃气流量偏低（110m³/h），未达到标准范围下限",
  "solution": "将燃气流量从110m³/h调高至130m³/h，等待温度回升",
  "result": "约15分钟后温度恢复至1450℃，产量恢复正常",
  "equipment": "熔炉",
  "operator": "张师傅",
  "parameters_before": {"temperature": 1280, "fuel_flow": 110},
  "parameters_after": {"temperature": 1450, "fuel_flow": 130}
}
```

##### ④ `faq.md` — 常见问题与解答

```
需要准备的 FAQ（至少 20 条），分类如下：

━━━ 生产工艺类（8条）━━━
Q: 岩棉板和岩棉条有什么区别？
Q: 容重95和容重120分别适用于什么场景？
Q: 岩棉的防火等级是多少？
Q: 生产一吨岩棉大约需要多少原料？
Q: 岩棉板的标准规格有哪些？
Q: 贴铝箔岩棉板的铝箔起什么作用？
Q: 岩棉的导热系数一般是多少？
Q: 岩棉生产过程中的主要能耗来源是什么？

━━━ 设备操作类（6条）━━━
Q: 熔炉温度多久能从冷态升到工作温度？
Q: 离心机的轴承多久需要更换一次？
Q: 固化炉的温度曲线怎么设置？
Q: 切割机刀片的使用寿命是多少？
Q: 集棉机的滤网多久清理一次？
Q: 设备巡检的标准流程是什么？

━━━ 质量控制类（4条）━━━
Q: 岩棉板的渣球含量标准是多少？
Q: 如何判断固化是否完全？
Q: 产品密度不达标怎么调整？
Q: 纤维直径偏粗的原因有哪些？

━━━ 安全规范类（2条）━━━
Q: 熔炉区域的安全注意事项有哪些？
Q: 岩棉生产车间的个人防护要求是什么？
```

##### ⑤ `product_specs.md` — 产品规格参数表

```
需要包含的内容：

| 产品 | 容重(kg/m³) | 厚度(mm) | 规格(mm) | 导热系数 | 防火等级 | 用途 |
|------|-----------|---------|---------|---------|---------|------|
| 岩棉板 | 80 | 30-100 | 1200×600 | ≤0.040 | A1 | 一般保温 |
| 岩棉板 | 95 | 30-100 | 1200×600 | ≤0.038 | A1 | 外墙保温 |
| 岩棉板 | 105 | 30-100 | 1200×600 | ≤0.036 | A1 | 承重保温 |
| 岩棉板 | 120 | 30-100 | 1200×600 | ≤0.036 | A1 | 幕墙保温 |
| 岩棉板 | 155 | 30-80 | 1200×600 | ≤0.034 | A1 | 屋面保温 |
| 岩棉条 | 80-120 | 50-200 | 1200×200 | ≤0.040 | A1 | 填充保温 |
| 贴铝箔岩棉板 | 80-120 | 30-100 | 1200×600 | ≤0.038 | A1 | 防潮保温 |
```

---

#### 三、Excel 报表层 — 示例报表

> 用于测试 Excel 生成工具和发货统计知识库的存储/查询功能。

| 文件名 | 内容 | 生成方式 |
|--------|------|---------|
| `发货日报_2026-02-01.xlsx` | 2月1日的发货明细 + 汇总 | 由 Excel 工具根据 shipping_data.json 自动生成 |
| `发货日报_2026-02-02.xlsx` | 2月2日的发货明细 + 汇总 | 同上 |
| `发货日报_2026-02-08.xlsx` | 2月8日的发货明细 + 汇总 | 同上 |
| `发货周报_2026-W05.xlsx` | 第5周汇总（02-01~02-07） | 同上 |

Excel 报表模板结构：

```
Sheet1: 发货明细
┌────┬──────┬──────────┬────────┬──────┬──────┬──────┬────────┬────────┐
│ 序号│ 日期  │ 发货单号  │ 客户    │ 产品  │ 规格  │ 方量  │ 重量    │ 金额    │
├────┼──────┼──────────┼────────┼──────┼──────┼──────┼────────┼────────┤
│ 1  │02-01 │20260201141│安徽泰辰 │岩棉板 │容重95 │32.80 │13.30   │7941.96 │
│ ...│      │          │        │      │      │      │        │        │
└────┴──────┴──────────┴────────┴──────┴──────┴──────┴────────┴────────┘

Sheet2: 汇总统计
┌──────────────────────────────────┐
│ 报表日期：2026-02-01             │
│ 总订单数：15                     │
│ 总方量：856.34 m³               │
│ 总重量：198.46 吨               │
│ 总金额：¥185,432.50             │
├──────────┬──────┬──────┬────────┤
│ 客户汇总  │ 方量  │ 重量  │ 金额   │
├──────────┼──────┼──────┼────────┤
│ 安徽泰辰  │32.80 │13.30 │7941.96 │
│ 无锡纵海  │34.11 │10.90 │7430.59 │
│ ...      │      │      │        │
└──────────┴──────┴──────┴────────┘
```

---

#### 模拟数据文件清单总览

| 编号 | 文件 | 中文名 | 所属层 | 存放位置 | 状态 |
|------|------|--------|--------|---------|------|
| D01 | `shipping_data.json` | 发货单模拟数据 | Mock API | `backend/mock-api/mock_data/` | ✅ 已完成 |
| D02 | `equipment_data.json` | 设备监控模拟数据 | Mock API | `backend/mock-api/mock_data/` | ✅ 已完成 |
| D03 | `logistics_data.json` | 物流信息模拟数据 | Mock API | `backend/mock-api/mock_data/` | ✅ 已完成 |
| D04 | `standard_process.md` | 岩棉标准生产流程 | 知识库 | `backend/mcp-server/knowledge_base/documents/` | 待编写 |
| D05 | `equipment_manual_furnace.md` | 熔炉操作手册 | 知识库 | 同上 | 待编写 |
| D06 | `equipment_manual_centrifuge.md` | 离心机操作手册 | 知识库 | 同上 | 待编写 |
| D07 | `equipment_manual_collector.md` | 集棉机操作手册 | 知识库 | 同上 | 待编写 |
| D08 | `equipment_manual_curing.md` | 固化炉操作手册 | 知识库 | 同上 | 待编写 |
| D09 | `equipment_manual_cutter.md` | 切割机操作手册 | 知识库 | 同上 | 待编写 |
| D10 | `troubleshooting_records.md`（或 .json） | 历史故障排查记录 | 知识库 | 同上 | 待编写 |
| D11 | `faq.md` | 常见问题与解答 | 知识库 | 同上 | 待编写 |
| D12 | `product_specs.md` | 岩棉产品规格参数表 | 知识库 | 同上 | 待编写 |
| D13 | 示例 Excel 日报（8份） | 发货日报表 | 发货统计知识库 | `backend/mcp-server/shipping_reports/` | 待生成 |
| D14 | 示例 Excel 周报（1份） | 发货周报表 | 发货统计知识库 | 同上 | 待生成 |

---

#### Agno 框架知识库实现方案

> 以下为基于 Agno 框架的知识库构建细节，MCP Server 启动时自动加载文档到 PostgreSQL + pgvector。

##### 知识库技术栈

```
文档（Markdown/PDF）
    ↓ Agno Reader 读取
文本内容
    ↓ Agno RecursiveChunking 分段
文本切片
    ↓ Agno Embedder 向量化
向量 + 文本
    ↓ Agno PgVector 存储
PostgreSQL + pgvector
```

##### 向量数据库配置

使用 Agno 的 `PgVector` 类连接 PostgreSQL + pgvector：

```python
from agno.vectordb.pgvector import PgVector

vector_db = PgVector(
    table_name="knowledge_documents",
    db_url="postgresql+psycopg://yanmian:yanmian123@postgres:5432/yanmian_agent",
)
```

##### Embedding 模型

使用 Agno 的 Embedder 接口，两种方案：

方案 A（推荐，兼容 OpenAI 格式）：
```python
from agno.embedder.openai import OpenAIEmbedder

embedder = OpenAIEmbedder(
    id="bge-large-zh",  # 中文 embedding 模型
    api_key="...",
    base_url="http://localhost:11434/v1",  # 本地 Ollama 或其他兼容服务
    dimensions=1024,
)
```

方案 B（使用 Ollama 本地模型）：
```python
from agno.embedder.ollama import OllamaEmbedder

embedder = OllamaEmbedder(
    id="bge-large-zh",
    dimensions=1024,
)
```

##### 文档分段策略

使用 Agno 的 `RecursiveChunking`（递归分段），适合技术文档：

```python
from agno.document.chunking.recursive import RecursiveChunking

chunking = RecursiveChunking(
    chunk_size=500,      # 每段约 500 字符
    overlap=50,          # 段间重叠 50 字符，保证上下文连贯
    separators=["\n\n", "\n", "。", "；", " "],  # 中文分隔符
)
```

##### 知识库初始化脚本

MCP Server 启动时，自动加载文档到向量数据库：

```python
from agno.knowledge.document import DocumentKnowledgeBase
from agno.document.reader.text import TextReader
from agno.vectordb.pgvector import PgVector

knowledge_base = DocumentKnowledgeBase(
    path="knowledge_base/documents/",  # 文档目录
    reader=TextReader(),               # 读取 Markdown/TXT
    vector_db=PgVector(
        table_name="knowledge_documents",
        db_url="postgresql+psycopg://...",
    ),
    chunking_strategy=RecursiveChunking(chunk_size=500, overlap=50),
    num_documents=5,  # 检索时返回 top 5
)

# 启动时加载（只在首次或文档更新时执行）
knowledge_base.load(recreate=False)  # recreate=False 不重复导入
```

##### MCP 工具中的知识库检索实现

```python
@mcp.tool()
async def search_knowledge_base(query: str, top_k: int = 5, category: str = None) -> dict:
    """检索岩棉制造相关的技术文档和历史经验记录"""
    # 1. 将 query 向量化
    query_embedding = embedder.get_embedding(query)

    # 2. pgvector 相似度搜索
    results = vector_db.search(
        query_embedding=query_embedding,
        limit=top_k,
        filters={"category": category} if category else None,
    )

    # 3. 返回结果
    return {
        "results": [
            {
                "content": r.content,
                "source": r.meta_data.get("source_file"),
                "section": r.meta_data.get("section"),
                "score": r.score,
            }
            for r in results
        ]
    }
```

##### 知识库文档分类与元数据

| 文档 | category 值 | 加载方式 |
|------|------------|---------|
| standard_process.md | `standard_process` | 启动时自动加载 |
| equipment_manual_*.md | `equipment_manual` | 启动时自动加载 |
| troubleshooting_records.md | `troubleshooting` | 启动时加载 + Agent 运行时写入 |
| faq.md | `faq` | 启动时自动加载 |
| product_specs.md | `product_specs` | 启动时自动加载 |

---

### 3.3 数据库设计（PostgreSQL + pgvector）

> 全部数据存储在同一个 PostgreSQL 实例中，通过 pgvector 扩展支持向量检索。
> 共 6 张表，对话记录按用户隔离，知识库和报表全局共享。

#### 表结构总览

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │──1:N──│    sessions     │──1:N──│    messages     │
│   用户信息表     │     │   会话表         │     │   消息记录表     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        │──1:N──┌─────────────────┐
        │       │ shipping_reports │
        │       │  报表元数据表    │
        │       └─────────────────┘
        │
┌─────────────────┐     ┌─────────────────────────┐
│   llm_configs   │     │   knowledge_documents   │
│  模型配置表（全局）│     │   知识库文档表（pgvector）│
└─────────────────┘     └─────────────────────────┘
```

#### 数据隔离原则

| 数据 | 隔离级别 | 说明 |
|------|---------|------|
| users | — | 用户只能访问自己的账户信息 |
| sessions + messages | 按用户隔离 | 每个用户只能看到自己的对话历史 |
| knowledge_documents | 全局共享 | 所有用户共用同一个知识库，任何人写入的经验记录所有人都能检索到 |
| shipping_reports | 全局共享 | 所有有权限的角色都能查到历史报表 |
| llm_configs | 全局共享 | 一套模型配置全公司统一使用 |

---

#### 表 1：users（用户信息表）

> 存储注册用户的基本信息和角色，用于登录认证和权限控制。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| user_id | SERIAL | PRIMARY KEY | 用户 ID，自增主键 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 登录账号 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希值（bcrypt 加密） |
| display_name | VARCHAR(100) | NOT NULL | 显示名称（如"张师傅""李会计"） |
| role | VARCHAR(30) | NOT NULL | 角色：`production_leader` / `accountant` / `manager` |
| avatar | VARCHAR(255) | NULL | 头像 URL（可选） |
| created_at | TIMESTAMP | DEFAULT NOW() | 注册时间 |
| last_login_at | TIMESTAMP | NULL | 最后登录时间 |

```sql
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100) NOT NULL,
    role          VARCHAR(30) NOT NULL CHECK (role IN ('production_leader', 'accountant', 'manager')),
    avatar        VARCHAR(255),
    created_at    TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);
```

**注册与认证流程：**

```
注册：用户名 + 密码 + 选择角色 → bcrypt 哈希密码 → 写入 users 表
登录：用户名 + 密码 → 校验哈希 → 签发 JWT Token（含 user_id、role）
鉴权：前端每次请求携带 JWT Token → 后端校验并提取用户信息
```

**示例数据：**

| user_id | username | display_name | role |
|---------|----------|-------------|------|
| 1 | zhangsan | 张师傅 | production_leader |
| 2 | lihui | 李会计 | accountant |
| 3 | wangzhu | 王主任 | manager |

---

#### 表 2：sessions（会话表）

> 存储用户与 Agent 的对话会话，每次用户发起新对话创建一条记录。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| session_id | VARCHAR(36) | PRIMARY KEY | 会话 ID（UUID） |
| user_id | INTEGER | FOREIGN KEY → users, NOT NULL | 所属用户 |
| scene | VARCHAR(30) | NOT NULL | 业务场景：`equipment_tuning` / `doc_search` / `shipping_stats` |
| title | VARCHAR(200) | NOT NULL | 会话标题（默认取用户第一句话，可修改） |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 最后活跃时间（每次新消息时更新） |

```sql
CREATE TABLE sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(user_id),
    scene      VARCHAR(30) NOT NULL CHECK (scene IN ('equipment_tuning', 'doc_search', 'shipping_stats')),
    title      VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_scene ON sessions(user_id, scene, updated_at DESC);
```

**查询场景：**

```sql
-- 左侧边栏：获取当前用户在"设备调优"场景下的对话历史
SELECT session_id, title, updated_at
FROM sessions
WHERE user_id = 1 AND scene = 'equipment_tuning'
ORDER BY updated_at DESC;
```

**示例数据：**

| session_id | user_id | scene | title |
|-----------|---------|-------|-------|
| s-001 | 1 | equipment_tuning | A车间1号产线产量异常 |
| s-002 | 1 | equipment_tuning | B车间熔炉温度偏高 |
| s-003 | 1 | doc_search | 离心机转速标准是多少 |
| s-004 | 2 | shipping_stats | 生成昨天的发货统计 |
| s-005 | 2 | doc_search | 岩棉板容重标准 |
| s-006 | 3 | equipment_tuning | A车间两条产线状态 |

---

#### 表 3：messages（消息记录表）

> 存储每个会话中的所有消息，包括用户输入、Agent 回复、工具调用记录。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| message_id | VARCHAR(36) | PRIMARY KEY | 消息 ID（UUID） |
| session_id | VARCHAR(36) | FOREIGN KEY → sessions, NOT NULL | 所属会话 |
| role | VARCHAR(20) | NOT NULL | 消息角色：`user` / `assistant` / `tool` |
| content | TEXT | NOT NULL | 消息内容（文本） |
| message_type | VARCHAR(20) | DEFAULT 'text' | 渲染类型：`text` / `table` / `card` / `timeline` / `file` |
| tool_calls | JSONB | NULL | 工具调用记录（工具名、参数、返回值） |
| attachments | JSONB | NULL | 附件信息（如 Excel 下载链接） |
| created_at | TIMESTAMP | DEFAULT NOW() | 发送时间 |

```sql
CREATE TABLE messages (
    message_id   VARCHAR(36) PRIMARY KEY,
    session_id   VARCHAR(36) NOT NULL REFERENCES sessions(session_id),
    role         VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
    content      TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    tool_calls   JSONB,
    attachments  JSONB,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id, created_at ASC);
```

**查询场景：**

```sql
-- 点击某个会话，加载全部消息
SELECT message_id, role, content, message_type, tool_calls, attachments, created_at
FROM messages
WHERE session_id = 's-001'
ORDER BY created_at ASC;
```

**示例数据（会话 s-001 的消息）：**

| message_id | role | message_type | content（摘要） | tool_calls |
|-----------|------|-------------|----------------|------------|
| m-001 | user | text | A车间1号产线产量异常，帮我分析一下 | NULL |
| m-002 | assistant | text | 正在查询标准生产流程... | NULL |
| m-003 | tool | text | 检索结果：岩棉标准生产流程... | `{"tool":"search_knowledge_base","params":{"query":"岩棉标准生产流程"}}` |
| m-004 | assistant | card | A1产线：熔炉⚠️温度1280℃，其余✅ | `{"tool":"get_equipment_status","params":{"line_number":"A1"}}` |
| m-005 | assistant | text | 建议将熔炉温度调整至1450℃ | NULL |
| m-006 | user | text | 好的我去调一下 | NULL |
| m-007 | user | text | 调完了，产量恢复了 | NULL |
| m-008 | assistant | text | 已将本次经验写入知识库 | `{"tool":"write_knowledge_base","params":{...}}` |

**tool_calls 字段 JSONB 结构示例：**

```json
{
  "tool": "get_equipment_status",
  "params": {"line_number": "A1"},
  "result": {
    "line_number": "A1",
    "equipment_list": [
      {"name": "熔炉", "status": "warning", "parameters": {"temperature": 1280}},
      {"name": "离心机", "status": "running", "parameters": {"speed": 5800}}
    ]
  },
  "duration_ms": 120
}
```

**attachments 字段 JSONB 结构示例：**

```json
{
  "type": "excel",
  "file_name": "发货日报_2026-02-12.xlsx",
  "download_url": "/api/excel/download/RPT_20260212_001",
  "storage_id": "RPT_20260212_001"
}
```

---

#### 表 4：llm_configs（模型配置表）

> 全局 LLM 模型配置，所有用户共用。支持保存多套配置，通过 is_active 标记当前启用的配置。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| config_id | SERIAL | PRIMARY KEY | 配置 ID，自增主键 |
| provider_type | VARCHAR(10) | NOT NULL | `local` / `cloud` |
| provider_name | VARCHAR(30) | NOT NULL | 供应商标识（ollama / aliyun / custom 等） |
| base_url | VARCHAR(500) | NOT NULL | 接口地址 |
| api_key_encrypted | VARCHAR(500) | NULL | 加密存储的 API Key（本地模型可为空） |
| model_name | VARCHAR(100) | NOT NULL | 模型名称 |
| temperature | DECIMAL(3,2) | DEFAULT 0.70 | 生成温度 |
| max_tokens | INTEGER | DEFAULT 4096 | 最大输出长度 |
| is_active | BOOLEAN | DEFAULT FALSE | 是否当前启用（全局仅一条为 TRUE） |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

```sql
CREATE TABLE llm_configs (
    config_id         SERIAL PRIMARY KEY,
    provider_type     VARCHAR(10) NOT NULL CHECK (provider_type IN ('local', 'cloud')),
    provider_name     VARCHAR(30) NOT NULL,
    base_url          VARCHAR(500) NOT NULL,
    api_key_encrypted VARCHAR(500),
    model_name        VARCHAR(100) NOT NULL,
    temperature       DECIMAL(3,2) DEFAULT 0.70,
    max_tokens        INTEGER DEFAULT 4096,
    is_active         BOOLEAN DEFAULT FALSE,
    updated_at        TIMESTAMP DEFAULT NOW()
);
```

**查询场景：**

```sql
-- Agent 启动时获取当前启用的模型配置
SELECT provider_type, provider_name, base_url, api_key_encrypted, model_name, temperature, max_tokens
FROM llm_configs
WHERE is_active = TRUE
LIMIT 1;
```

---

#### 表 5：knowledge_documents（知识库文档表，pgvector）

> 存储知识库文档的向量化切片，支持 RAG 语义检索。全局共享，所有用户都能检索和写入。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| doc_id | SERIAL | PRIMARY KEY | 文档切片 ID，自增主键 |
| category | VARCHAR(30) | NOT NULL | 类别：`standard_process` / `equipment_manual` / `troubleshooting` / `faq` |
| title | VARCHAR(200) | NOT NULL | 文档标题 |
| content | TEXT | NOT NULL | 文本切片内容 |
| source_file | VARCHAR(200) | NOT NULL | 来源文件名 |
| section | VARCHAR(200) | NULL | 所在章节 |
| embedding | VECTOR(1024) | NOT NULL | 文本向量（维度取决于 Embedding 模型） |
| created_at | TIMESTAMP | DEFAULT NOW() | 入库时间 |
| created_by | INTEGER | NULL | 写入者 user_id（系统导入时为空，用户写入时记录） |

```sql
-- 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_documents (
    doc_id      SERIAL PRIMARY KEY,
    category    VARCHAR(30) NOT NULL,
    title       VARCHAR(200) NOT NULL,
    content     TEXT NOT NULL,
    source_file VARCHAR(200) NOT NULL,
    section     VARCHAR(200),
    embedding   VECTOR(1024) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    created_by  INTEGER REFERENCES users(user_id)
);

-- 向量索引（IVFFlat，适合中小规模数据）
CREATE INDEX idx_knowledge_embedding ON knowledge_documents
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

-- 类别索引（加速按类别筛选）
CREATE INDEX idx_knowledge_category ON knowledge_documents(category);
```

**查询场景：**

```sql
-- RAG 检索：查找与用户问题最相似的 top 5 文档切片
SELECT doc_id, title, content, source_file, section,
       1 - (embedding <=> '[0.12, -0.34, ...]'::vector) AS score
FROM knowledge_documents
WHERE category = 'equipment_manual'  -- 可选：按类别筛选
ORDER BY embedding <=> '[0.12, -0.34, ...]'::vector
LIMIT 5;

-- 写入新经验记录（知识进化）
INSERT INTO knowledge_documents (category, title, content, source_file, section, embedding, created_by)
VALUES ('troubleshooting', '熔炉温度偏低导致产量下降', '...', 'agent_generated', '经验记录', '[...]', 1);
```

---

#### 表 6：shipping_reports（发货报表元数据表）

> 存储 Excel 报表的元数据信息，实际文件存储在文件系统中。全局共享。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| report_id | SERIAL | PRIMARY KEY | 报表 ID，自增主键 |
| storage_id | VARCHAR(50) | UNIQUE, NOT NULL | 存储标识（如 RPT_20260212_001） |
| file_name | VARCHAR(200) | NOT NULL | 文件名（如"发货日报_2026-02-12.xlsx"） |
| file_path | VARCHAR(500) | NOT NULL | 文件存储路径 |
| report_date | DATE | NOT NULL | 报表日期 |
| report_type | VARCHAR(20) | NOT NULL | 类型：`daily` / `weekly` / `monthly` |
| created_by | INTEGER | FOREIGN KEY → users | 生成者 user_id |
| created_at | TIMESTAMP | DEFAULT NOW() | 生成时间 |

```sql
CREATE TABLE shipping_reports (
    report_id   SERIAL PRIMARY KEY,
    storage_id  VARCHAR(50) UNIQUE NOT NULL,
    file_name   VARCHAR(200) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    report_date DATE NOT NULL,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
    created_by  INTEGER REFERENCES users(user_id),
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_date_type ON shipping_reports(report_date DESC, report_type);
```

**查询场景：**

```sql
-- 查询上周的发货日报
SELECT storage_id, file_name, report_date, created_at
FROM shipping_reports
WHERE report_date BETWEEN '2026-02-03' AND '2026-02-09'
  AND report_type = 'daily'
ORDER BY report_date DESC;
```

---

#### 数据库初始化脚本

> 部署时执行，自动创建全部表结构。

```sql
-- 文件：backend/db/init.sql

-- 1. 启用扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 创建表（按依赖顺序）
-- users → sessions → messages
-- users → shipping_reports
-- llm_configs（独立）
-- knowledge_documents（独立）

-- 3. 插入默认 LLM 配置
INSERT INTO llm_configs (provider_type, provider_name, base_url, model_name, is_active)
VALUES ('local', 'ollama', 'http://localhost:11434/v1', 'qwen2.5', TRUE);

-- 4. 插入演示用户（开发环境）
INSERT INTO users (username, password_hash, display_name, role) VALUES
('zhangsan', '$2b$12$...', '张师傅', 'production_leader'),
('lihui',    '$2b$12$...', '李会计', 'accountant'),
('wangzhu',  '$2b$12$...', '王主任', 'manager');
```

**Docker Compose 中的数据库初始化：**

PostgreSQL 容器支持自动执行 `/docker-entrypoint-initdb.d/` 目录下的 SQL 文件：

```yaml
postgres:
  image: pgvector/pgvector:pg16
  volumes:
    - pgdata:/var/lib/postgresql/data
    - ./backend/db/init.sql:/docker-entrypoint-initdb.d/init.sql  # 自动初始化
```

---

### 3.4 智能体记忆设计

> 使用 Agno 的 LearningMachine 新一代学习系统，为 Agent 提供跨会话的记忆能力，让 Agent 能记住用户偏好、设备信息和对话上下文。

#### 记忆系统架构

```python
from agno.learn import (
    LearningMachine, LearningMode,
    UserProfileConfig, UserMemoryConfig, EntityMemoryConfig,
)

learning = LearningMachine(
    # 用户画像：结构化字段（姓名、称呼）
    user_profile=UserProfileConfig(mode=LearningMode.ALWAYS),

    # 用户记忆：非结构化观察（偏好、经验、习惯）
    user_memory=UserMemoryConfig(mode=LearningMode.ALWAYS),

    # 会话上下文：结构化跟踪对话状态（讨论了什么、决定了什么、待办事项）
    session_context=True,

    # 实体记忆：记住外部实体信息（设备、产线），所有用户共享
    entity_memory=EntityMemoryConfig(mode=LearningMode.ALWAYS),
)
```

#### 四种记忆的分工

| 记忆类型 | 存储内容 | 隔离方式 | 项目中的作用 |
|---------|---------|---------|------------|
| UserProfile | 结构化身份：`{name: "张建国", preferred_name: "张工"}` | 按 user_id 隔离 | Agent 知道怎么称呼操作员 |
| UserMemory | 非结构化观察："偏好折线图""处理过传感器故障" | 按 user_id 隔离 | Agent 记住操作员的习惯和经验 |
| SessionContext | 对话状态：讨论主题、关键事实、决定、待办 | 按 session_id 隔离 | 故障排查时跟踪"排查到哪一步了" |
| EntityMemory | 外部实体："2号熔炉型号RMF-2000""T3传感器上月更换" | 所有用户共享 | 设备信息是公共知识，张工说的李工也能查到 |

#### 记忆提取规则

使用 `memory_capture_instructions` 约束 LLM 只提取有价值的工作信息：

```python
memory_capture_instructions = """
只提取与工作相关的信息，包括：
- 操作员负责的产线和设备
- 操作员的技术专长和经验
- 设备故障和处理经验
- 操作偏好（如偏好折线图还是表格）
忽略以下内容：
- 个人生活、爱好、闲聊
- 重复的寒暄和问候
"""
```

#### 多用户多会话隔离模型

```
user_id="zhang_gong_001"（从 JWT Token 提取）
  ├── session_id="s-001"（设备调优会话）→ 对话历史 A + SessionContext A
  ├── session_id="s-003"（文档检索会话）→ 对话历史 B + SessionContext B
  ├── UserProfile（跨会话共享）→ {name: "张建国", preferred_name: "张工"}
  ├── UserMemory（跨会话共享）→ "负责2号产线" "偏好折线图"
  └── EntityMemory（跨用户共享）→ "2号熔炉型号RMF-2000"

user_id="li_hui_002"（从 JWT Token 提取）
  ├── session_id="s-004"（发货统计会话）→ 对话历史 C + SessionContext C
  ├── UserProfile → {name: "李慧", preferred_name: "李会计"}
  ├── UserMemory → "负责发货日报" "偏好按客户汇总"
  └── EntityMemory（与张工共享）→ 同一份设备信息
```

#### 记忆优化策略

当用户记忆超过 20 条时，自动执行摘要压缩：

```python
from agno.memory import MemoryManager
from agno.memory.strategies.types import MemoryOptimizationStrategyType

memory_manager = MemoryManager(model=model, db=db)

# 定期执行（可做成定时任务）
memory_manager.optimize_memories(
    user_id=user_id,
    strategy=MemoryOptimizationStrategyType.SUMMARIZE,
    apply=True,
)
```

#### 数据库表说明

LearningMachine 会自动在 PostgreSQL 中创建记忆相关的表（由 Agno 框架管理），不需要手动建表。但需要确保 Agent 容器能连接到 PostgreSQL：

```yaml
# docker-compose.yml 中 agent 服务的环境变量
agent:
  environment:
    DATABASE_URL: postgresql+psycopg://yanmian:yanmian123@postgres:5432/yanmian_agent
```

---

### 3.5 各场景 Agent 工作流设计

#### 3.5.1 生产设备智能调优 Agent

```
用户输入: "A车间的1号产线产量发生了异常，应该怎么解决？"

Step 1 → 查询标准生产流程（提示词预设触发）
         调用 T1 search_knowledge_base(query="岩棉标准生产流程", category="技术手册")
         Agent 学习岩棉完整制造过程及各环节标准参数

Step 2 → 查询产线所有设备实时状态
         调用 T2 get_equipment_status(line_number="A1")
         获取 A 车间 1 号产线每个设备的实时运行参数

Step 3 → LLM 对比分析，定位异常设备
         - 将 Step 2 获取的实时参数与 Step 1 的标准参数逐一对比
         - 找出偏离标准范围的设备（如：熔炉温度 1280℃，标准 1400-1500℃）
         - 总结问题归属："熔炉温度异常"

Step 4 → 查询该类问题的解决方案
         调用 T1 search_knowledge_base(query="熔炉温度异常 解决方案", category="经验记录")
         从知识库匹配历史上熔炉温度异常的处理经验

Step 5 → LLM 生成调整方案并询问组长
         综合标准流程 + 设备现状 + 历史方案，输出：
         "分析结果：1号产线熔炉温度偏低（当前1280℃，标准1400-1500℃）
          建议：将熔炉温度调整至1450℃，参考历史案例#XX
          请执行调整后观察岩棉状态变化，约10分钟后反馈产量是否恢复。"

Step 6 → 组长执行调整，观察约 10 分钟

Step 7a → 组长反馈"有效"
          调用 T1 write_knowledge_base({
            problem: "A车间1号产线产量异常，熔炉温度偏低1280℃",
            solution: "将熔炉温度调整至1450℃",
            result: "10分钟后产量恢复正常",
            equipment: "熔炉"
          })
          → 知识库持续进化

Step 7b → 组长反馈"无效"
          → LLM 排除已尝试的熔炉温度方案
          → 重新分析：检查下一个可疑设备（如离心机转速）
          → 回到 Step 4，查询新问题的解决方案
          → 循环直到问题解决
```

#### System Prompt 设计

```
你是泰石岩棉的生产设备调优专家。

当用户向你询问有关岩棉生产异常相关的问题时，请严格按以下步骤处理：

1. 【学习标准流程】优先调用技术文档检索工具查询"岩棉标准生产流程"，
   学习岩棉的完整制造过程及各环节的标准参数范围。

2. 【获取设备状态】调用设备实时监控工具，获取用户提到的产线上
   每一个设备的当前运行参数。

3. 【对比定位异常】将每个设备的实时参数与标准流程中的参数逐一对比，
   找出偏离标准范围的设备，明确指出是哪个设备的什么参数异常。

4. 【查询解决方案】针对定位到的具体异常（如"熔炉温度偏低"），
   调用技术文档检索工具查询该类问题的常见解决方案和历史处理经验。

5. 【输出调整建议】综合以上信息，给出具体的调整方案（调什么、调到多少），
   并说明依据。询问组长是否执行。

6. 【等待反馈】组长执行后，等待约10分钟的效果反馈。
   - 有效：将本次事件写入知识库
   - 无效：排除已尝试方案，分析下一个可疑设备，重复步骤3-5

安全约束：
- 只给建议，不直接操作设备
- 参数建议不得超出设备安全范围
- 每次建议必须说明数据来源和推理依据
```

---

#### 3.5.2 技术文档检索 Agent

```
用户输入: "岩棉生产中熔炉温度一般控制在多少度？"

Step 1 → 调用 T1 search_knowledge_base(query="熔炉温度控制范围")

Step 2 → LLM 基于检索结果生成回答，附带文档来源

用户追问: "温度过高会有什么影响？"

Step 3 → 调用 T1 search_knowledge_base(query="熔炉温度过高影响")

Step 4 → LLM 结合上下文生成回答
```

#### System Prompt 设计

```
你是泰石岩棉的技术文档检索顾问。

你的职责是帮助用户查找和理解岩棉制造相关的技术知识，包括生产工艺、设备操作规范、
产品规格参数、常见问题等。你的用户可能是生产人员、管理人员，也可能是非生产岗位人员，
因此回答需要通俗易懂。

工作流程：

1. 【理解问题】分析用户的提问，提取关键词和意图。如果问题模糊，先追问明确需求。

2. 【检索文档】调用技术文档检索工具 search_knowledge_base，根据问题选择合适的类别：
   - 工艺参数类问题 → category="技术手册"
   - 设备操作类问题 → category="技术手册"
   - 历史故障处理类问题 → category="经验记录"
   - 一般性问题 → category="FAQ"
   - 不确定类别时 → 不传 category，全库检索

3. 【组织回答】基于检索到的文档内容，用通俗易懂的语言组织回答：
   - 直接回答用户的问题，不要复述原文
   - 涉及具体数值时，必须给出准确数据和单位
   - 涉及操作步骤时，按顺序清晰列出

4. 【标注来源】每个回答末尾必须标注信息来源，格式：
   📖 来源：《文档名称》— 第X章 章节名

5. 【多轮对话】用户追问时，结合上下文理解意图，必要时发起新的检索。

约束规则：
- 只基于知识库中的文档内容回答，不编造不存在的信息
- 如果知识库中没有找到相关内容，明确告知用户"当前知识库中暂无该信息"
- 如果检索结果的相关性得分较低（score < 0.5），提醒用户"以下信息仅供参考，建议咨询专业人员确认"
- 不回答与岩棉制造无关的问题
```

---

#### 3.5.3 发货统计 Agent

```
用户输入: "帮我生成昨天的发货统计"

Step 1 → 调用 T4 query_shipment_plan(date=today)
         获取今日计划发货量和实际发货量

Step 2 → 调用 T3 query_logistics(date=today)
         获取物流状态补充信息

Step 3 → LLM 汇总生成报表:
         - 按产品/客户汇总
         - 标注计划与实际的差异
         - 高亮未完成的发货项
         - 在对话中输出结构化表格预览

Step 4 → 调用 T5 generate_shipping_excel({
           report_date: "2026-02-12",
           report_type: "daily",
           records: [...],
           summary: {...}
         })
         - 生成 Excel 报表文件（发货日报_2026-02-12.xlsx）
         - 自动存入发货统计知识库
         - 返回文件下载链接

Step 5 → Agent 输出最终结果:
         - 对话中展示报表预览（表格）
         - 提供 Excel 文件下载链接
         - 告知已存入发货统计知识库
```

#### System Prompt 设计

```
你是泰石岩棉的发货统计助手。

你的职责是帮助会计和管理人员查询发货数据、生成统计报表、追踪物流状态。
你需要准确、高效地处理数据查询请求，并以清晰的表格形式呈现结果。

工作流程：

1. 【理解需求】分析用户的查询意图，判断属于以下哪种类型：
   - 生成发货统计（日报/周报/月报）
   - 按条件筛选查询（按客户、按产品、按日期范围）
   - 查询物流状态
   - 查询历史报表

2. 【提取参数】从用户的自然语言中提取查询参数：
   - 时间范围：将"今天""昨天""这周""本月"等转换为具体日期
   - 客户名称：识别客户关键词
   - 产品名称：识别产品关键词
   - 如果关键参数缺失，主动询问用户补充

3. 【查询数据】根据需求类型调用对应工具：
   - 发货明细 → 调用 query_shipment_plan（传入日期范围和筛选条件）
   - 物流追踪 → 调用 query_logistics（传入发货单号）
   - 历史报表 → 调用 query_shipping_reports（传入日期范围和报表类型）

4. 【生成报表】当用户需要生成统计报表时：
   - 先查询数据，在对话中以表格形式预览
   - 调用 generate_shipping_excel 生成 Excel 文件
   - 返回下载链接，告知已存入发货统计知识库

5. 【输出格式】
   - 数据展示统一使用表格格式，包含关键字段
   - 金额保留两位小数，方量保留两位小数
   - 汇总数据放在表格下方
   - Excel 文件生成后提供下载链接

约束规则：
- 数据必须来自系统查询结果，不编造数字
- 金额、方量等数值必须与查询结果完全一致，不做四舍五入以外的修改
- 如果查询结果为空，告知用户"该时间段内无发货记录"
```

#### 报表输出格式示例

```
【2026-02-08 发货日报】

汇总：计划发货 XX 吨，实际发货 XX 吨，完成率 XX%

| 客户 | 产品 | 计划量(吨) | 实际量(吨) | 差异 | 物流状态 |
|------|------|-----------|-----------|------|---------|
| ...  | ...  | ...       | ...       | ...  | ...     |

异常项：
- XX客户的XX产品少发X吨，原因待确认

📎 Excel 报表已生成：发货日报_2026-02-08.xlsx [点击下载]
📁 已存入发货统计知识库
```

#### 使用的工具

| 工具 | 用途 |
|------|------|
| T3 物流查询工具 | 查询物流状态信息 |
| T4 用友 API 接口 | 查询计划发货量和实际发货量 |
| T5 Excel 报表生成工具 | 生成 Excel 文件并存入知识库 |

---

## 四、前端交互界面设计

> 前端为用户与 Agent 交互的唯一入口，采用 Web 对话界面形式，部署为独立 Docker 容器。

### 前端设计提示词（构建 UI 时使用）

```
---
name: frontend-design
description: 创建独特的、生产级的前端界面。当用户要求构建网页组件、页面、
应用程序、海报、仪表板时使用。生成有创意、有品味的代码和 UI 设计。
---

# 设计思维

在写任何代码之前，先回答这些问题：

**Purpose**：这个界面解决什么问题？谁在用它？
**Tone**：选择一个极端方向——极简主义、最大化混乱、复古未来、有机自然、奢华精致、玩具感、杂志感、粗野主义、装饰艺术...
**Differentiation**：什么让这个设计令人难忘？用户会记住什么？

**关键**：选择一个清晰的概念方向，然后精确执行。大胆的最大化和精致的极简都可以——关键是意图明确，而不是强度。

## 绝对不要做的事

以下是典型的"AI 生成感"设计，必须避免：

- 滥用 Inter、Roboto、Arial 字体
- 紫色渐变配白色背景
- 所有圆角都是 8px
- 千篇一律的卡片布局
- 没有个性的 cookie-cutter 风格

## 应该追求的

- **字体**：选择有个性的字体。把一个独特的展示字体和精致的正文字体搭配。
- **颜色**：承诺一个连贯的审美。主色调配锐利的强调色，胜过胆怯的平均分配。
- **动效**：聚焦高影响力时刻——一个精心编排的页面加载动画，胜过散落的微交互。
- **空间**：意外的布局。不对称。重叠。对角线流动。打破网格的元素。
- **背景**：创造氛围和深度，而不是默认纯色。渐变网格、噪点纹理、几何图案。

## 执行原则

**匹配复杂度和愿景**：
- 最大化设计 → 需要复杂代码、大量动画和效果
- 极简设计 → 需要克制、精确、细致的间距和字体处理

优雅来自于对愿景的良好执行，而不是堆砌效果。
```

### 整体架构

```
┌─────────────────────────────────────────────────────┐
│                   前端 Web 应用                       │
│            （React + TypeScript + Vite）              │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  登录页   │  │  仪表盘   │  │  Agent 对话页     │  │
│  │ 角色选择  │  │  首页     │  │ 设备调优/文档/发货 │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  对话历史         │  │  模型设置         │        │
│  └──────────────────┘  └──────────────────┘        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────▼──────────────────────────────┐
│              Agent 后端（Docker 3）                    │
│                 端口 8080                             │
└─────────────────────────────────────────────────────┘
```

### 页面结构

#### 1. 登录 / 角色选择页

| 项目 | 说明 |
|------|------|
| 功能 | 用户选择自己的角色，系统根据角色展示对应的 Agent 场景 |
| 角色列表 | 生产车间组长、会计/非生产岗、生产部管理层 |

角色与可用场景的映射：

| 角色 | 可用场景 |
|------|---------|
| 生产车间组长 | 场景一（设备调优）、场景二（文档检索） |
| 会计/非生产岗 | 场景二（文档检索）、场景三（发货统计） |
| 生产部管理层 | 场景一（设备调优）、场景二（文档检索）、场景三（发货统计） |

#### 2. 仪表盘首页（Dashboard）

登录后的默认首页，一眼掌握全局状态，根据角色动态展示不同内容。

```
┌──────────────────────────────────────────────────────────────────┐
│ ┌────────────┐  ┌──────────────────────────────────────────────┐ │
│ │             │  │                                              │ │
│ │  🏠 仪表盘  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │
│ │  ← 当前页   │  │  │ 产线状态  │ │ 今日发货  │ │ 设备告警  │    │ │
│ │             │  │  │ 2条运行   │ │ 12单     │ │ 1个异常   │    │ │
│ │  业务功能    │  │  │ 0条停机   │ │ 756m³    │ │ 熔炉温度  │    │ │
│ │  🔧 设备调优 │  │  │ 1条告警 ⚠️│ │ ¥16.5万  │ │ 偏低 ⚠️   │    │ │
│ │  📚 文档检索 │  │  └──────────┘ └──────────┘ └──────────┘    │ │
│ │  📊 发货统计 │  │                                              │ │
│ │             │  │  ┌──────────────────────────────────────┐    │ │
│ │  ─────────  │  │  │  📈 近7天发货量趋势                    │    │ │
│ │  📜 对话历史 │  │  │  ┌─────────────────────────────┐     │    │ │
│ │  ⚙️ 模型设置 │  │  │  │     ╱╲                       │     │    │ │
│ │             │  │  │  │   ╱    ╲    ╱╲              │     │    │ │
│ │             │  │  │  │  ╱      ╲╱╱    ╲            │     │    │ │
│ │             │  │  │  │ ╱                 ╲          │     │    │ │
│ │             │  │  │  └─────────────────────────────┘     │    │ │
│ │             │  │  └──────────────────────────────────────┘    │ │
│ │             │  │                                              │ │
│ │             │  │  快捷操作                                     │ │
│ │             │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │
│ │             │  │  │🔧 诊断    │ │📊 生成    │ │📚 查询    │    │ │
│ │             │  │  │ 产线异常  │ │ 今日日报  │ │ 技术文档  │    │ │
│ │             │  │  └──────────┘ └──────────┘ └──────────┘    │ │
│ └────────────┘  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**数据卡片区（顶部）：**

| 卡片 | 数据来源 | 适用角色 | 说明 |
|------|---------|---------|------|
| 产线运行状态 | T2 get_equipment_status（轮询全部产线） | 组长、管理层 | 显示运行/告警/停机数量，用绿/黄/红色块 |
| 今日发货概览 | T4 query_daily_summary（today） | 会计、管理层 | 订单数、总方量、总金额 |
| 设备告警 | T2 get_equipment_status（筛选 status=warning） | 组长、管理层 | 当前异常设备数量和最新告警摘要 |
| 知识库动态 | 数据库查询 | 全部角色 | 最近新增经验记录条数、最近更新时间 |

> 卡片根据角色动态显示：组长看到产线状态+设备告警+知识库，会计看到今日发货+知识库，管理层看到全部。

**趋势图区（中部）：**

| 图表 | 适用角色 | 说明 |
|------|---------|------|
| 近 7 天发货量趋势（折线图） | 会计、管理层 | X轴=日期，Y轴=方量/金额，可切换 |
| 近 7 天设备告警趋势（柱状图） | 组长、管理层 | X轴=日期，Y轴=告警次数 |

> 管理层同时看到两个图表，其他角色只看到与自己相关的。

**快捷操作区（底部）：**

| 快捷入口 | 点击行为 | 适用角色 |
|---------|---------|---------|
| 🔧 诊断产线异常 | 进入设备调优对话 | 组长、管理层 |
| 📊 生成昨日发货日报 | 进入发货统计对话，自动发送"帮我生成昨天的发货统计" | 会计、管理层 |
| 📚 查询技术文档 | 进入文档检索对话 | 全部角色 |
| 📋 查看历史报表 | 进入发货统计对话，自动发送"帮我找最近的发货报表" | 会计、管理层 |

**仪表盘数据加载方式：**

页面打开时，前端向 Agent 后端发送仪表盘数据请求，Agent 并行调用相关工具获取实时数据：

```
GET /api/dashboard?role=production_leader

返回：
{
  "line_status": {"running": 2, "warning": 1, "stopped": 0},
  "today_shipping": {"orders": 12, "cubic_volume": 756.23, "amount": 165432.00},
  "alerts": [{"equipment": "熔炉", "line": "A1", "issue": "温度偏低 1280℃"}],
  "knowledge_updates": {"recent_count": 3, "last_update": "2026-02-12 16:30"},
  "trends": {
    "shipping_7d": [{"date":"02-06","volume":680},{"date":"02-07","volume":720},...],
    "alerts_7d": [{"date":"02-06","count":0},{"date":"02-07","count":1},...]
  }
}
```

#### 3. 对话主界面

```
┌──────────────────────────────────────────────────────────────────┐
│ ┌────────────┐  ┌──────────────────────────────────────────────┐ │
│ │             │  │  🏭 生产设备智能调优 Agent                    │ │
│ │  🏠 仪表盘  │  │                                              │ │
│ │             │  │  组长: A车间1号产线产量异常                    │ │
│ │  业务功能    │  │                                              │ │
│ │  🔧 设备调优 │  │  Agent: 正在查询设备状态...                   │ │
│ │  ← 当前场景  │  │                                              │ │
│ │  📚 文档检索 │  │  ┌─────────────────────────┐                │ │
│ │  📊 发货统计 │  │  │ ⚠️ 熔炉 温度1280℃       │                │ │
│ │             │  │  │ ✅ 离心机 转速5800rpm   │                │ │
│ │  ─────────  │  │  │ ✅ 集棉机 负压-850Pa    │                │ │
│ │  📜 对话历史 │  │  │ ✅ 固化炉 温度230℃      │                │ │
│ │   · 产线异常 │  │  │ ✅ 切割机 速度12m/min   │                │ │
│ │   · 发货日报 │  │  └─────────────────────────┘                │ │
│ │   · 温度查询 │  │                                              │ │
│ │             │  │  建议：将熔炉温度调整至1450℃                  │ │
│ │  ─────────  │  │                                              │ │
│ │  ⚙️ 模型设置 │  │  ┌──────────────────────────────────────┐  │ │
│ │             │  │  │ 输入消息...                    [发送]  │  │ │
│ └────────────┘  │  └──────────────────────────────────────┘  │ │
│                  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

| 区域 | 功能 |
|------|------|
| 左侧边栏 — 仪表盘入口 | 点击返回仪表盘首页 |
| 左侧边栏 — 业务功能 | 根据角色显示可用场景，点击切换场景（新建对话） |
| 左侧边栏 — 对话历史 | 当前场景的历史对话列表，点击可切换 |
| 左侧边栏 — 模型设置 | 进入 LLM 模型配置页 |
| 右侧主区域 — 消息流 | 展示用户消息和 Agent 回复，支持富文本渲染 |
| 右侧底部 — 输入框 | 文本输入 + 发送按钮，支持 Enter 发送 |

#### 4. 消息渲染组件

Agent 的回复需要支持多种格式的渲染：

| 消息类型 | 渲染方式 | 使用场景 |
|---------|---------|---------|
| 纯文本 | Markdown 渲染 | 一般回答、建议说明 |
| 设备状态卡片 | 带状态图标的卡片组件（✅/⚠️/❌） | 场景一：设备巡检结果 |
| 数据表格 | HTML 表格，支持排序 | 场景三：发货统计报表 |
| 物流轨迹 | 时间线组件（纵向步骤条） | 物流追踪结果 |
| 加载状态 | 打字机动画 / 步骤进度提示 | Agent 正在调用工具时 |
| 知识来源标注 | 折叠面板，显示文档名+章节 | 场景二：文档检索回答 |

#### 5. LLM 模型设置页

用户可在前端切换 Agent 使用的 LLM 模型，无需修改后端代码。

```
┌─────────────────────────────────────────────────────┐
│  ⚙️ 模型设置                                         │
│                                                     │
│  模型来源：  ○ 本地部署    ● 云端服务                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  供应商：  [阿里云百炼        ▾]              │    │
│  │                                             │    │
│  │  API Key： [sk-********************]        │    │
│  │                                             │    │
│  │  模型：    [qwen-plus           ▾]          │    │
│  │            ○ qwen-turbo                     │    │
│  │            ● qwen-plus                      │    │
│  │            ○ qwen-max                       │    │
│  │                                             │    │
│  │  高级设置（可选）：                            │    │
│  │  Temperature: [0.7    ]                     │    │
│  │  Max Tokens:  [4096   ]                     │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌──────────────────────────────────┐               │
│  │  💡 选择"自定义"可接入任意兼容     │               │
│  │     OpenAI 格式的第三方服务        │               │
│  └──────────────────────────────────┘               │
│                                                     │
│           [ 测试连接 ]    [ 保存 ]                    │
└─────────────────────────────────────────────────────┘
```

| 功能 | 说明 |
|------|------|
| 模型来源切换 | 本地部署 / 云端服务，切换后供应商列表联动变化 |
| 供应商选择 | 预置常见供应商（Ollama、阿里云、百度、OpenAI 等），末尾有「自定义」选项 |
| 自定义供应商 | 选择后展开 Base URL 输入框，用户手动填写第三方接口地址 |
| API Key 输入 | 云端服务必填，本地部署隐藏此项 |
| 模型选择 | 根据供应商展示可用模型列表，自定义时手动输入模型名称 |
| 测试连接 | 点击后向 Agent 后端发送测试请求，验证配置是否可用 |
| 保存 | 配置保存到 PostgreSQL，Agent 后端实时生效 |

#### 6. 前后端通信

| 项目 | 方案 |
|------|------|
| 协议 | HTTP + SSE（Server-Sent Events）实现流式输出 |
| 请求格式 | `POST /api/chat` |
| 流式响应 | Agent 逐步返回文本，前端实时渲染（打字机效果） |
| 工具调用提示 | Agent 调用工具时推送状态消息（如"正在查询设备状态..."） |

请求示例：

```json
POST /api/chat
{
  "session_id": "sess_20260212_001",
  "role": "production_leader",
  "scene": "equipment_tuning",
  "message": "A车间1号产线产量异常，帮我分析一下"
}
```

SSE 响应流示例：

```
event: tool_call
data: {"tool": "search_knowledge_base", "status": "正在查询标准生产流程..."}

event: tool_call
data: {"tool": "get_equipment_status", "status": "正在获取A1产线设备状态..."}

event: message
data: {"content": "分析结果：1号产线熔炉温度1280℃，低于标准", "done": false}

event: message
data: {"content": "建议：将熔炉温度调整至1450℃", "done": true}
```

### 技术选型

| 组件 | 方案 | 说明 |
|------|------|------|
| 框架 | React 18 + TypeScript | 组件化开发，类型安全 |
| 构建工具 | Vite | 快速开发和构建 |
| UI 组件库 | Ant Design | 企业级 UI，表格/表单组件丰富 |
| 状态管理 | Zustand | 轻量，管理会话和消息状态 |
| Markdown 渲染 | react-markdown | 渲染 Agent 的文本回复 |
| HTTP 客户端 | fetch + EventSource | SSE 流式接收 |
| 容器化 | Nginx + Docker | 静态文件托管 |

### 目录结构

> 详见「1.0 项目目录结构」中 `frontend/` 部分。

### Dockerfile 预览

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## 五、从零开始的完整开发顺序

> 本节描述从空白环境到系统上线的完整开发步骤，按依赖关系排列。
> 架构：PostgreSQL + pgvector（Docker 0）→ Mock API（Docker 1）→ MCP Server（Docker 2）→ Agent（Docker 3）→ Frontend（Docker 4）

---

### 阶段一：开发环境搭建

| 步骤 | 操作 | 产出 | 状态 |
|------|------|------|------|
| 1.1 | 安装 Docker Desktop，启用 WSL2 集成（Settings → Resources → WSL Integration） | Docker 可在 WSL 终端使用 | ✅ 已完成 |
| 1.2 | 在 WSL 中创建项目根目录 `~/yanmian/` | 项目工作区 | ✅ 已完成 |
| 1.3 | 创建 Python 虚拟环境 `python3 -m venv .venv` 并激活 | 本地开发环境隔离 | ✅ 已完成 |
| 1.4 | 安装本地开发依赖 `pip install fastapi uvicorn pydantic` | 可在本地调试 API | ✅ 已完成 |
| 1.5 | 创建项目文档结构：`specs/`、`CLAUDE.md`、需求文档、工程设计文档 | 文档体系 | ✅ 已完成 |
| 1.6 | 配置国内镜像源（pip 清华源、Docker 镜像加速） | 加速下载 | ✅ 已完成 |

---

### 阶段二：Mock API 开发（Docker 1）

> 目标：用 FastAPI 模拟用友 ERP、设备监控、物流系统的接口，为后续 MCP Server 提供数据源。

| 步骤 | 操作 | 产出 | 状态 |
|------|------|------|------|
| 2.1 | 设计 API 接口规范（4 个端点、统一响应格式） | `specs/api/设计文档.md` | ✅ 已完成 |
| 2.2 | 创建 `mock-api/` 目录结构 | 四层结构：models / services / routers / data | ✅ 已完成 |
| 2.3 | 编写 Pydantic 数据模型 | `models/common.py`、`shipping.py`、`equipment.py`、`logistics.py`、`excel.py` | ✅ 已完成 |
| 2.4 | 编写 Mock 数据生成脚本 | `generate_mock_data.py` → 生成 JSON 数据文件 | ✅ 已完成 |
| 2.5 | 生成 Mock 数据 | `data/shipping_data.json`、`equipment_data.json`、`logistics_data.json` | ✅ 已完成 |
| 2.6 | 编写 Service 层（数据加载 + 查询逻辑） | `services/shipping_service.py`、`equipment_service.py`、`logistics_service.py`、`excel_service.py` | ✅ 已完成 |
| 2.7 | 编写 Router 层（API 端点） | `routers/shipping.py`、`equipment.py`、`logistics.py`、`excel.py` | ✅ 已完成 |
| 2.8 | 编写 FastAPI 入口 | `main.py`（注册路由、CORS 中间件） | ✅ 已完成 |
| 2.9 | 编写 Dockerfile 和 requirements.txt | Docker 构建配置 | ✅ 已完成 |
| 2.10 | 构建 Docker 镜像 `docker build -t mock-api .` | 可运行的 Docker 镜像 | ✅ 已完成 |
| 2.11 | 启动容器并测试全部 API 端点 | 7 个端点均返回正确数据 | ✅ 已完成 |

**Mock API 端点清单：**

```
GET  /api/shipping/list?start_date=&end_date=&customer_name=&product_name=
GET  /api/shipping/daily-summary?start_date=&end_date=
GET  /api/equipment/status?line_number=&equipment_id=&equipment_name=&scenario=
GET  /api/logistics/query?shipping_order_no=
POST /api/excel/generate                    # 生成 Excel 报表并存入知识库
GET  /api/excel/reports?start_date=&end_date=&report_type=  # 查询历史报表
GET  /api/excel/download/{storage_id}       # 下载指定报表文件
```

#### 2.A Service 层工具函数详细说明

##### ① `shipping_service.query_shipping_list()`

| 项目 | 说明 |
|------|------|
| 文件 | `services/shipping_service.py` |
| 功能 | 按日期范围查询发货记录，支持按客户名称和产品名称模糊筛选 |

输入参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `start_date` | `str` | 是 | 开始日期，格式 `YYYY-MM-DD` |
| `end_date` | `str` | 是 | 结束日期，格式 `YYYY-MM-DD` |
| `customer_name` | `str \| None` | 否 | 客户名称（模糊匹配） |
| `product_name` | `str \| None` | 否 | 产品名称（模糊匹配） |

输出：`dict`，包含 `records`（发货记录列表）和 `summary`（汇总统计）

```json
{
  "records": [
    {
      "seq": 1,
      "reviewer": "赵学鹏",
      "shipping_date": "2026-02-01",
      "shipping_order_no": "20260201141",
      "customer_name": "安徽泰辰建材科技有限公司",
      "product_name": "岩棉板",
      "length": 1200, "width": 600, "thickness": 50,
      "spec_model": "容重95",
      "cubic_volume": 32.8031,
      "quantity": 13.296,
      "cubic_price": 242.11,
      "total_price_with_tax": 7941.96,
      "unit_price_with_tax": 1700
    }
  ],
  "summary": {
    "total_records": 1,
    "total_cubic_volume": 32.8031,
    "total_quantity": 13.296,
    "total_price_with_tax": 7941.96
  }
}
```

---

##### ② `shipping_service.query_daily_summary()`

| 项目 | 说明 |
|------|------|
| 文件 | `services/shipping_service.py` |
| 功能 | 按日期范围查询每日发货汇总，按天分组统计 |

输入参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `start_date` | `str` | 是 | 开始日期，格式 `YYYY-MM-DD` |
| `end_date` | `str` | 是 | 结束日期，格式 `YYYY-MM-DD` |

输出：`dict`，包含 `daily_summary`（每日汇总列表）和 `period_summary`（区间总汇总）

```json
{
  "daily_summary": [
    {
      "date": "2026-02-01",
      "total_orders": 15,
      "total_cubic_volume": 856.3421,
      "total_quantity": 198.456,
      "total_price_with_tax": 185432.50,
      "customers": ["安徽泰辰建材科技有限公司", "无锡市纵海新型建材科技有限公司"]
    }
  ],
  "period_summary": {
    "start_date": "2026-02-01",
    "end_date": "2026-02-03",
    "total_days_with_shipment": 3,
    "total_orders": 45,
    "total_cubic_volume": 2568.1234,
    "total_quantity": 595.368,
    "total_price_with_tax": 556297.50
  }
}
```

---

##### ③ `equipment_service.query_by_line()`

| 项目 | 说明 |
|------|------|
| 文件 | `services/equipment_service.py` |
| 功能 | 按产线编号查询整条产线的所有设备状态 |

输入参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `line_number` | `str` | 是 | 产线编号，如 `A1` |

输出：`dict | None`，返回整条产线数据（含所有设备），未找到返回 `None`

```json
{
  "line_number": "A1",
  "line_name": "A车间1号产线",
  "equipment_list": [
    {
      "id": "EQ_A1_001",
      "name": "熔炉",
      "status": "warning",
      "parameters": { "temperature": 1280, "fuel_flow": 115, "air_pressure": 0.32 },
      "normal_range": {
        "temperature": { "min": 1400, "max": 1500, "unit": "℃" },
        "fuel_flow": { "min": 100, "max": 140, "unit": "m³/h" },
        "air_pressure": { "min": 0.3, "max": 0.4, "unit": "MPa" }
      },
      "last_update": "2026-02-09T10:30:00"
    },
    {
      "id": "EQ_A1_002",
      "name": "离心机",
      "status": "running",
      "parameters": { "speed": 5800, "vibration": 2.1, "bearing_temp": 65 },
      "normal_range": {
        "speed": { "min": 5500, "max": 6500, "unit": "rpm" },
        "vibration": { "min": 0, "max": 3.0, "unit": "mm/s" },
        "bearing_temp": { "min": 40, "max": 80, "unit": "℃" }
      },
      "last_update": "2026-02-09T10:30:00"
    }
  ]
}
```

---

##### ④ `equipment_service.query_by_equipment_id()`

| 项目 | 说明 |
|------|------|
| 文件 | `services/equipment_service.py` |
| 功能 | 按设备 ID 精确查询单个设备状态 |

输入参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `equipment_id` | `str` | 是 | 设备 ID，如 `EQ_A1_001` |

输出：`dict | None`，返回该设备所在产线信息 + 单个设备数据，未找到返回 `None`

```json
{
  "line_number": "A1",
  "line_name": "A车间1号产线",
  "equipment_list": [
    {
      "id": "EQ_A1_001",
      "name": "熔炉",
      "status": "warning",
      "parameters": { "temperature": 1280, "fuel_flow": 115, "air_pressure": 0.32 },
      "normal_range": { "temperature": { "min": 1400, "max": 1500, "unit": "℃" } },
      "last_update": "2026-02-09T10:30:00"
    }
  ]
}
```

---

##### ⑤ `equipment_service.query_by_equipment_name()`

| 项目 | 说明 |
|------|------|
| 文件 | `services/equipment_service.py` |
| 功能 | 按设备名称模糊查询设备状态（可能匹配多个设备） |

输入参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `equipment_name` | `str` | 是 | 设备名称关键词，如 `熔炉` |

输出：`dict | None`，返回匹配的设备列表（可能多个），未找到返回 `None`。结构同 `query_by_equipment_id`。

---

##### ⑥ `logistics_service.query_by_order_no()`

| 项目 | 说明 |
|------|------|
| 文件 | `services/logistics_service.py` |
| 功能 | 按发货单号精确查询物流信息 |

输入参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `shipping_order_no` | `str` | 是 | 发货单号，如 `20260201143` |

输出：`dict | None`，返回物流详情（含轨迹），未找到返回 `None`

```json
{
  "shipping_order_no": "20260201143",
  "logistics_no": "顺丰1685744792",
  "carrier": "顺丰物流",
  "status": "in_transit",
  "estimated_arrival": "2026-02-04",
  "tracking": [
    { "time": "2026-02-01 08:00", "location": "泰安仓库", "event": "已发货" },
    { "time": "2026-02-02 12:00", "location": "济南中转站", "event": "运输中" },
    { "time": "2026-02-03 16:00", "location": "南京分拨中心", "event": "运输中" }
  ]
}
```

---

##### ⑦ `excel_service.generate_report()`

| 项目 | 说明 |
|------|------|
| 文件 | `services/excel_service.py` |
| 功能 | 根据发货记录数据生成 Excel 报表文件，存入发货统计知识库，返回文件信息 |

输入参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `report_date` | `str` | 是 | 报表日期，如 `2026-02-12` |
| `report_type` | `str` | 是 | 报表类型：`daily` / `weekly` / `monthly` |
| `records` | `list` | 是 | 发货记录数据列表 |
| `summary` | `dict` | 是 | 汇总数据 |

输出：`dict`，包含生成的文件信息

```json
{
  "success": true,
  "file_name": "发货日报_2026-02-12.xlsx",
  "file_path": "shipping_reports/2026/02/发货日报_2026-02-12.xlsx",
  "storage_id": "RPT_20260212_001",
  "download_url": "/api/excel/download/RPT_20260212_001"
}
```

---

##### ⑧ `excel_service.query_reports()`

| 项目 | 说明 |
|------|------|
| 文件 | `services/excel_service.py` |
| 功能 | 按日期范围和报表类型查询历史报表元数据 |

输入参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `start_date` | `str` | 是 | 开始日期，格式 `YYYY-MM-DD` |
| `end_date` | `str` | 是 | 结束日期，格式 `YYYY-MM-DD` |
| `report_type` | `str \| None` | 否 | 报表类型筛选 |

输出：`list`，报表元数据列表

```json
[
  {
    "storage_id": "RPT_20260212_001",
    "file_name": "发货日报_2026-02-12.xlsx",
    "report_date": "2026-02-12",
    "report_type": "daily",
    "created_at": "2026-02-13T08:30:00",
    "download_url": "/api/excel/download/RPT_20260212_001"
  }
]
```

---

##### ⑨ `excel_service.get_file_path()`

| 项目 | 说明 |
|------|------|
| 文件 | `services/excel_service.py` |
| 功能 | 根据 storage_id 获取报表文件的物理路径，用于文件下载 |

输入参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `storage_id` | `str` | 是 | 报表存储标识，如 `RPT_20260212_001` |

输出：`str | None`，文件物理路径，未找到返回 `None`

---

#### 2.B API 接口层详细说明

> 所有接口统一返回 `ApiResponse` 格式：`{ "code": 200, "message": "success", "data": {...} }`

##### ① `GET /api/shipping/list` — 发货记录查询

| Query 参数 | 类型 | 必填 | 说明 |
|-----------|------|------|------|
| `start_date` | `string` | 是 | 开始日期 `YYYY-MM-DD` |
| `end_date` | `string` | 是 | 结束日期 `YYYY-MM-DD` |
| `customer_name` | `string` | 否 | 客户名称（模糊匹配） |
| `product_name` | `string` | 否 | 产品名称（模糊匹配） |

示例请求：
```
GET /api/shipping/list?start_date=2026-02-01&end_date=2026-02-01&customer_name=安徽泰辰
```

示例响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "seq": 1,
        "reviewer": "赵学鹏",
        "shipping_date": "2026-02-01",
        "shipping_order_no": "20260201141",
        "customer_name": "安徽泰辰建材科技有限公司",
        "product_name": "岩棉板",
        "length": 1200, "width": 600, "thickness": 50,
        "spec_model": "容重95",
        "cubic_volume": 32.8031,
        "quantity": 13.296,
        "cubic_price": 242.11,
        "total_price_with_tax": 7941.96,
        "unit_price_with_tax": 1700
      }
    ],
    "summary": {
      "total_records": 1,
      "total_cubic_volume": 32.8031,
      "total_quantity": 13.296,
      "total_price_with_tax": 7941.96
    }
  }
}
```

错误示例（日期为空）：
```json
{ "code": 422, "message": "开始日期和结束日期不能为空", "data": null }
```

错误示例（日期格式错误）：
```json
{ "code": 400, "message": "日期格式错误，请使用 YYYY-MM-DD", "data": null }
```

---

##### ② `GET /api/shipping/daily-summary` — 每日发货汇总

| Query 参数 | 类型 | 必填 | 说明 |
|-----------|------|------|------|
| `start_date` | `string` | 是 | 开始日期 `YYYY-MM-DD` |
| `end_date` | `string` | 是 | 结束日期 `YYYY-MM-DD` |

示例请求：
```
GET /api/shipping/daily-summary?start_date=2026-02-01&end_date=2026-02-03
```

示例响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "daily_summary": [
      {
        "date": "2026-02-01",
        "total_orders": 15,
        "total_cubic_volume": 856.3421,
        "total_quantity": 198.456,
        "total_price_with_tax": 185432.50,
        "customers": ["安徽泰辰建材科技有限公司", "无锡市纵海新型建材科技有限公司"]
      }
    ],
    "period_summary": {
      "start_date": "2026-02-01",
      "end_date": "2026-02-03",
      "total_days_with_shipment": 3,
      "total_orders": 45,
      "total_cubic_volume": 2568.1234,
      "total_quantity": 595.368,
      "total_price_with_tax": 556297.50
    }
  }
}
```

错误示例（日期为空）：
```json
{ "code": 422, "message": "开始日期和结束日期不能为空", "data": null }
```

---

##### ③ `GET /api/equipment/status` — 设备状态查询

| Query 参数 | 类型 | 必填 | 说明 |
|-----------|------|------|------|
| `line_number` | `string` | 三选一 | 产线编号，如 `A1` |
| `equipment_id` | `string` | 三选一 | 设备 ID，如 `EQ_A1_001` |
| `equipment_name` | `string` | 三选一 | 设备名称，如 `熔炉` |
| `scenario` | `string` | 否 | 模拟场景模式：不传（默认单设备异常）/ `all_normal` / `multi_fault` / `degrading` |

> 优先级：`line_number` > `equipment_id` > `equipment_name`，至少提供一个参数。
> `scenario` 参数仅在模拟阶段使用，用于切换不同的设备状态场景。

示例请求：
```
GET /api/equipment/status?line_number=A1
```

示例响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "line_number": "A1",
    "line_name": "A车间1号产线",
    "equipment_list": [
      {
        "id": "EQ_A1_001",
        "name": "熔炉",
        "status": "warning",
        "parameters": {
          "temperature": 1280,
          "fuel_flow": 115,
          "air_pressure": 0.32
        },
        "normal_range": {
          "temperature": { "min": 1400, "max": 1500, "unit": "℃" },
          "fuel_flow": { "min": 100, "max": 140, "unit": "m³/h" },
          "air_pressure": { "min": 0.3, "max": 0.4, "unit": "MPa" }
        },
        "last_update": "2026-02-09T10:30:00"
      },
      {
        "id": "EQ_A1_002",
        "name": "离心机",
        "status": "running",
        "parameters": { "speed": 5800, "vibration": 2.1, "bearing_temp": 65 },
        "normal_range": {
          "speed": { "min": 5500, "max": 6500, "unit": "rpm" },
          "vibration": { "min": 0, "max": 3.0, "unit": "mm/s" },
          "bearing_temp": { "min": 40, "max": 80, "unit": "℃" }
        },
        "last_update": "2026-02-09T10:30:00"
      }
    ]
  }
}
```

错误示例（未提供参数）：
```json
{ "code": 400, "message": "请提供 line_number、equipment_id 或 equipment_name 中的至少一个参数", "data": null }
```

---

##### ④ `GET /api/logistics/query` — 物流查询

| Query 参数 | 类型 | 必填 | 说明 |
|-----------|------|------|------|
| `shipping_order_no` | `string` | 是 | 发货单号 |

示例请求：
```
GET /api/logistics/query?shipping_order_no=20260201143
```

示例响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "shipping_order_no": "20260201143",
    "logistics_no": "顺丰1685744792",
    "carrier": "顺丰物流",
    "status": "in_transit",
    "estimated_arrival": "2026-02-04",
    "tracking": [
      { "time": "2026-02-01 08:00", "location": "泰安仓库", "event": "已发货" },
      { "time": "2026-02-02 12:00", "location": "济南中转站", "event": "运输中" },
      { "time": "2026-02-03 16:00", "location": "南京分拨中心", "event": "运输中" }
    ]
  }
}
```

错误示例（单号不存在）：
```json
{ "code": 404, "message": "未找到发货单号 99999999 的物流信息", "data": null }
```

---

##### ⑤ `POST /api/excel/generate` — 生成 Excel 报表

| Body 参数 | 类型 | 必填 | 说明 |
|-----------|------|------|------|
| `report_date` | `string` | 是 | 报表日期，如 `2026-02-12` |
| `report_type` | `string` | 是 | 报表类型：`daily` / `weekly` / `monthly` |
| `records` | `list` | 是 | 发货记录数据列表 |
| `summary` | `object` | 是 | 汇总数据 |

示例请求：
```json
{
  "report_date": "2026-02-12",
  "report_type": "daily",
  "records": [
    {
      "shipping_date": "2026-02-12",
      "shipping_order_no": "20260212001",
      "customer_name": "安徽泰辰建材科技有限公司",
      "product_name": "岩棉板",
      "spec_model": "容重95",
      "cubic_volume": 32.80,
      "quantity": 13.30,
      "total_price_with_tax": 7941.96
    }
  ],
  "summary": {
    "total_records": 1,
    "total_cubic_volume": 32.80,
    "total_quantity": 13.30,
    "total_price_with_tax": 7941.96
  }
}
```

示例响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "file_name": "发货日报_2026-02-12.xlsx",
    "file_path": "shipping_reports/2026/02/发货日报_2026-02-12.xlsx",
    "storage_id": "RPT_20260212_001",
    "download_url": "/api/excel/download/RPT_20260212_001"
  }
}
```

错误示例（缺少必填字段）：
```json
{ "code": 400, "message": "缺少必填字段：report_date", "data": null }
```

错误示例（records 为空）：
```json
{ "code": 400, "message": "发货记录数据不能为空", "data": null }
```

---

##### ⑥ `GET /api/excel/reports` — 查询历史报表

| Query 参数 | 类型 | 必填 | 说明 |
|-----------|------|------|------|
| `start_date` | `string` | 是 | 开始日期 `YYYY-MM-DD` |
| `end_date` | `string` | 是 | 结束日期 `YYYY-MM-DD` |
| `report_type` | `string` | 否 | 报表类型筛选：`daily` / `weekly` / `monthly` |

示例请求：
```
GET /api/excel/reports?start_date=2026-02-01&end_date=2026-02-12&report_type=daily
```

示例响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "reports": [
      {
        "storage_id": "RPT_20260212_001",
        "file_name": "发货日报_2026-02-12.xlsx",
        "report_date": "2026-02-12",
        "report_type": "daily",
        "created_at": "2026-02-13T08:30:00",
        "download_url": "/api/excel/download/RPT_20260212_001"
      }
    ]
  }
}
```

错误示例（日期为空）：
```json
{ "code": 422, "message": "开始日期和结束日期不能为空", "data": null }
```

---

##### ⑦ `GET /api/excel/download/{storage_id}` — 下载报表文件

| Path 参数 | 类型 | 必填 | 说明 |
|-----------|------|------|------|
| `storage_id` | `string` | 是 | 报表存储标识，如 `RPT_20260212_001` |

示例请求：
```
GET /api/excel/download/RPT_20260212_001
```

成功响应：返回 Excel 文件流（`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`）

错误示例（报表不存在）：
```json
{ "code": 404, "message": "未找到报表 RPT_99999999_001", "data": null }
```

---

### 阶段三：MCP Server 开发（Docker 2）

> 目标：将 Mock API 封装为 MCP 工具，同时集成 RAG 知识库，供 Agent 调用。

| 步骤 | 操作 | 产出 |
|------|------|------|
| 3.1 | 设计 MCP 工具清单和接口规范 | `specs/mcp/设计文档.md` |
| 3.2 | 创建 `mcp-server/` 目录结构 | 项目骨架 |
| 3.3 | 安装 MCP SDK 和依赖（`mcp`、`httpx`、`psycopg2-binary`、`pgvector`、`sentence-transformers`） | `requirements.txt` |
| 3.4 | 实现 MCP 工具：`get_equipment_status` | 调用 Mock API `/api/equipment/status`，返回设备状态 |
| 3.5 | 实现 MCP 工具：`query_shipment_plan` | 调用 Mock API `/api/shipping/list` + `/api/shipping/daily-summary` |
| 3.6 | 实现 MCP 工具：`query_logistics` | 调用 Mock API `/api/logistics/query` |
| 3.7 | 搭建 PostgreSQL + pgvector 数据库（Docker 容器） | 创建知识库表和业务数据表，启用 vector 扩展 |
| 3.8 | 下载中文 Embedding 模型（BGE-small-zh-v1.5） | 模型文件缓存到容器 |
| 3.9 | 创建知识库表结构 | `knowledge_documents` 表（含 vector 列），按 category 字段区分：`standard_process`、`equipment_manual`、`troubleshooting`、`general_faq` |
| 3.10 | 编写知识库数据导入脚本 | 将 Markdown/文本文档分段向量化写入 PostgreSQL |
| 3.11 | 准备初始知识库内容（岩棉生产流程、设备手册、FAQ） | `knowledge_base/` 目录下的文本文件 |
| 3.12 | 实现 MCP 工具：`search_knowledge_base` | RAG 检索：query → embedding → pgvector 相似度搜索 → 返回 top_k 结果 |
| 3.13 | 实现 MCP 工具：`write_knowledge_base` | 将新经验记录向量化写入 PostgreSQL（知识进化） |
| 3.14 | 实现 MCP 工具：`generate_shipping_excel` | 调用 Mock API `/api/excel/generate`，生成 Excel 并存入知识库 |
| 3.15 | 实现 MCP 工具：`query_shipping_reports` | 调用 Mock API `/api/excel/reports`，查询历史报表 |
| 3.16 | 编写 MCP Server 入口（注册所有工具） | `server.py` |
| 3.17 | 编写 Dockerfile | Docker 构建配置 |
| 3.18 | 构建镜像并测试所有 MCP 工具 | 工具调用返回正确结果 |

**MCP 工具与 Mock API 的对应关系：**

```
MCP 工具                    →  调用的 Mock API
─────────────────────────────────────────────────
get_equipment_status        →  GET /api/equipment/status
query_shipment_plan         →  GET /api/shipping/list + /daily-summary
query_logistics             →  GET /api/logistics/query
search_knowledge_base       →  PostgreSQL + pgvector 向量检索
write_knowledge_base        →  PostgreSQL + pgvector 向量写入
generate_shipping_excel     →  POST /api/excel/generate
query_shipping_reports      →  GET /api/excel/reports
```

#### Agno 框架 MCP 实现细节

##### MCP Server 端实现

MCP Server 使用 `mcp` SDK 的 `FastMCP` 类构建，传输方式选择 `streamable-http`（双向 HTTP 流，推荐方案）。

```python
# backend/mcp-server/server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("yanmian-mcp-server")

# 用 @mcp.tool() 装饰器注册每个工具
# 装饰器会自动提取函数名、参数类型、docstring 作为工具描述
@mcp.tool()
async def search_knowledge_base(query: str, top_k: int = 5, category: str = None) -> dict:
    """检索岩棉制造相关的技术文档和历史经验记录"""
    # 实现：query → embedding → pgvector 相似度搜索 → 返回 top_k 结果
    ...

@mcp.tool()
async def write_knowledge_base(title: str, problem: str, solution: str, result: str, equipment: str, operator: str, date: str) -> dict:
    """将新的经验记录写入知识库"""
    # 实现：文本 → embedding → 写入 pgvector
    ...

@mcp.tool()
async def get_equipment_status(line_number: str = None, equipment_id: str = None) -> dict:
    """获取指定设备或产线的实时运行状态"""
    # 实现：调用 Mock API GET /api/equipment/status
    ...

@mcp.tool()
async def query_shipment_plan(start_date: str, end_date: str, customer_name: str = None) -> dict:
    """从用友系统查询发货数据"""
    # 实现：调用 Mock API GET /api/shipping/list
    ...

@mcp.tool()
async def query_logistics(shipping_order_no: str) -> dict:
    """查询物流状态信息"""
    # 实现：调用 Mock API GET /api/logistics/query
    ...

@mcp.tool()
async def generate_shipping_excel(report_date: str, report_type: str, records: list, summary: dict) -> dict:
    """生成 Excel 报表并存入知识库"""
    # 实现：调用 Mock API POST /api/excel/generate
    ...

@mcp.tool()
async def query_shipping_reports(start_date: str, end_date: str, report_type: str = None) -> dict:
    """查询历史报表"""
    # 实现：调用 Mock API GET /api/excel/reports
    ...

if __name__ == "__main__":
    mcp.run(transport="streamable-http", host="0.0.0.0", port=3000)
    # 启动后端点为 http://0.0.0.0:3000/mcp
```

关键设计点：
- 使用 `from mcp.server.fastmcp import FastMCP`（mcp 官方 SDK），不是第三方 fastmcp 库
- 传输方式：`streamable-http`，端点自动为 `/mcp`
- 每个工具用 `@mcp.tool()` 装饰器注册，函数的 docstring 会成为工具描述（LLM 看到的）
- 工具内部通过 `httpx` 调用 Mock API，通过 `psycopg2` + `pgvector` 访问知识库
- MCP Server 容器暴露端口 3000

##### Agent 端 MCP 客户端实现

Agent 使用 Agno 的 `MCPTools` 类连接 MCP Server：

```python
# backend/agent/mcp_client/client.py
from agno.tools.mcp import MCPTools

# 连接 MCP Server（streamable-http 传输）
mcp_tools = MCPTools(
    transport="streamable-http",
    url="http://mcp-server:3000/mcp",  # Docker 内部网络地址
)

# 使用方式：async with 自动管理连接
async with mcp_tools:
    agent = Agent(tools=[mcp_tools], ...)
    await agent.aprint_response(...)
```

关键设计点：
- `MCPTools` 是 Agno 框架的 MCP 客户端，自动发现 MCP Server 上注册的所有工具
- 必须用 `async with` 管理连接生命周期（自动 connect/close）
- Docker 容器间通过内部网络通信：`http://mcp-server:3000/mcp`
- Agent 不需要知道工具的具体实现，只需要连接 MCP Server 即可获得所有工具

---

### 阶段四：Agent 开发（Docker 3）

> 目标：构建 LLM Agent，通过 MCP 协议调用工具，实现 3 个业务场景。

| 步骤 | 操作 | 产出 |
|------|------|------|
| 4.1 | 设计 Agent 架构和 Prompt 策略 | `specs/agent/设计文档.md` |
| 4.2 | 创建 `agent/` 目录结构 | 项目骨架 |
| 4.3 | 确定 LLM 接入方式（API Key / 本地部署） | LLM 配置 |
| 4.4 | 安装 Agent 框架依赖（Agno） | `requirements.txt` |
| 4.5 | 实现 MCP Client（连接 MCP Server，获取可用工具列表） | MCP 工具调用能力 |
| 4.6 | 编写场景一 System Prompt：生产设备智能调优 | 8 步工作流的 Prompt |
| 4.7 | 实现场景一 Agent 逻辑（多轮对话 + 工具调用链） | 设备调优 Agent |
| 4.8 | 编写场景二 System Prompt：技术文档检索 | RAG 问答 Prompt |
| 4.9 | 实现场景二 Agent 逻辑 | 文档检索 Agent |
| 4.10 | 编写场景三 System Prompt：发货统计 | 报表生成 Prompt |
| 4.11 | 实现场景三 Agent 逻辑 | 发货统计 Agent |
| 4.12 | 实现场景路由（根据用户意图分发到对应 Agent） | 统一入口 |
| 4.13 | 编写 Dockerfile | Docker 构建配置 |
| 4.14 | 单独测试每个场景的完整工作流 | 3 个场景均可独立运行 |

#### Agno 框架 Agent 实现细节

##### Agent 核心代码结构

```python
# backend/agent/agents/tuning_agent.py
from agno.agent import Agent
from agno.db.postgres import PostgresDb
from agno.models.openai import OpenAIChat
from agno.tools.mcp import MCPTools
from agno.learn import (
    LearningMachine, LearningMode,
    UserProfileConfig, UserMemoryConfig, EntityMemoryConfig,
)

# 数据库（会话 + 记忆统一存储）
db = PostgresDb(db_url="postgresql+psycopg://yanmian:yanmian123@postgres:5432/yanmian_agent")

# LLM 模型（从数据库 llm_configs 表读取配置）
model = OpenAIChat(
    id=config.model_name,
    api_key=config.api_key,
    base_url=config.base_url,
)

# MCP 工具（连接 MCP Server）
mcp_tools = MCPTools(
    transport="streamable-http",
    url="http://mcp-server:3000/mcp",
)

# 记忆系统
learning = LearningMachine(
    user_profile=UserProfileConfig(mode=LearningMode.ALWAYS),
    user_memory=UserMemoryConfig(mode=LearningMode.ALWAYS),
    session_context=True,
    entity_memory=EntityMemoryConfig(mode=LearningMode.ALWAYS),
)

# 创建 Agent（一个实例服务所有用户）
tuning_agent = Agent(
    model=model,
    db=db,
    tools=[mcp_tools],
    learning=learning,
    instructions="...",  # 场景一的 System Prompt
    add_history_to_context=True,
    markdown=True,
)
```

##### 三个场景 Agent 的创建

三个 Agent 共享同一个 db、model、mcp_tools、learning，只有 instructions 不同：

```python
# 场景一：设备调优 Agent
tuning_agent = Agent(
    model=model, db=db, tools=[mcp_tools], learning=learning,
    instructions=TUNING_SYSTEM_PROMPT,
    add_history_to_context=True,
)

# 场景二：文档检索 Agent
search_agent = Agent(
    model=model, db=db, tools=[mcp_tools], learning=learning,
    instructions=SEARCH_SYSTEM_PROMPT,
    add_history_to_context=True,
)

# 场景三：发货统计 Agent
shipping_agent = Agent(
    model=model, db=db, tools=[mcp_tools], learning=learning,
    instructions=SHIPPING_SYSTEM_PROMPT,
    add_history_to_context=True,
)
```

##### 场景路由

根据前端传入的 scene 参数选择对应 Agent：

```python
# backend/agent/agents/router.py
AGENT_MAP = {
    "equipment_tuning": tuning_agent,
    "doc_search": search_agent,
    "shipping_stats": shipping_agent,
}

def get_agent(scene: str) -> Agent:
    return AGENT_MAP.get(scene)
```

##### FastAPI HTTP 接口

Agent 容器对外暴露 HTTP API，供前端调用：

```python
# backend/agent/main.py
from fastapi import FastAPI
from agno.tools.mcp import MCPTools

app = FastAPI()

@app.on_event("startup")
async def startup():
    # 启动时连接 MCP Server
    await mcp_tools.connect()

@app.on_event("shutdown")
async def shutdown():
    # 关闭时断开连接
    await mcp_tools.close()

@app.post("/api/chat")
async def chat(request: ChatRequest):
    agent = get_agent(request.scene)

    # user_id 从 JWT Token 提取
    # session_id 从请求参数获取
    response = await agent.arun(
        message=request.message,
        user_id=request.user_id,
        session_id=request.session_id,
        stream=True,  # 流式输出
    )
    return StreamingResponse(response)
```

##### MCP 连接生命周期管理

由于 Agent 是长期运行的服务（不是一次性脚本），MCP 连接需要在 FastAPI 启动时建立，关闭时断开：

```python
# 不要用 async with（那是一次性脚本的写法）
# 长期服务用 connect() / close() 手动管理

@app.on_event("startup")
async def startup():
    await mcp_tools.connect()

@app.on_event("shutdown")
async def shutdown():
    await mcp_tools.close()
```

##### 多 Agent 共享记忆的效果

由于三个 Agent 共享同一个 db 和 learning：
- 张工在"设备调优"场景说"我负责2号产线"，切换到"文档检索"场景时 Agent 也记得
- 张工在调优场景提到"2号熔炉上月换过传感器"，李工在调优场景也能查到这个设备信息（EntityMemory 共享）
- 每个场景的对话历史通过 session_id 隔离，互不干扰

---

### 阶段五：前端 Web 界面开发（Docker 4）

> 目标：构建用户与 Agent 交互的 Web 对话界面，部署为独立 Docker 容器。

| 步骤 | 操作 | 产出 |
|------|------|------|
| 5.1 | 初始化前端项目（React + TypeScript + Vite） | `frontend/` 项目骨架 |
| 5.2 | 安装依赖（Ant Design、Zustand、react-markdown） | `package.json` |
| 5.3 | 实现登录/角色选择页 | `LoginPage.tsx`，角色与场景映射 |
| 5.4 | 实现对话主界面布局（侧边栏 + 消息区 + 输入框） | `ChatPage.tsx` |
| 5.5 | 实现消息组件（纯文本 Markdown 渲染） | `ChatMessage.tsx` |
| 5.6 | 实现 SSE 流式通信（连接 Agent 后端 `/api/chat`） | `services/api.ts`，打字机效果 |
| 5.7 | 实现设备状态卡片组件（✅/⚠️ 状态图标） | `EquipmentCard.tsx` |
| 5.8 | 实现发货统计表格组件 | `ShippingTable.tsx` |
| 5.9 | 实现物流轨迹时间线组件 | `LogisticsTimeline.tsx` |
| 5.10 | 实现工具调用状态提示（"正在查询设备状态..."） | `ToolCallStatus.tsx` |
| 5.11 | 实现会话管理（历史记录、场景切换） | `SessionList.tsx`、`SceneSelector.tsx` |
| 5.12 | 编写 Dockerfile（Node 构建 + Nginx 托管） | Docker 构建配置 |
| 5.13 | 构建镜像并测试页面功能 | 前端可独立运行 |

---

### 阶段六：集成联调与 Docker Compose 编排

> 目标：5 个容器协同工作，端到端验证全部业务场景。

| 步骤 | 操作 | 产出 |
|------|------|------|
| 6.1 | 编写 `docker-compose.yml` | 5 个服务的编排配置（含 PostgreSQL） |
| 6.2 | 配置容器间网络（Frontend → Agent → MCP Server → Mock API） | Docker 内部网络 |
| 6.3 | 一键启动 `docker compose up --build` | 5 个容器同时运行 |
| 6.4 | 端到端测试场景一：生产设备智能调优 | 前端对话 → Agent → 工具调用 → 结果渲染 |
| 6.5 | 端到端测试场景二：技术文档检索 | 多轮 RAG 问答 + Markdown 渲染 |
| 6.6 | 端到端测试场景三：发货统计 | 报表表格渲染正确 |
| 6.7 | 测试角色权限（不同角色看到不同场景） | 权限控制正常 |
| 6.8 | 异常场景测试（网络超时、空数据、错误输入） | 错误处理正常 |

**Docker Compose 架构预览：**

```yaml
services:
  postgres:           # Docker 0 — 数据库（PostgreSQL + pgvector）
    image: pgvector/pgvector:pg16
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: yanmian
      POSTGRES_PASSWORD: yanmian123
      POSTGRES_DB: yanmian_agent
    volumes:
      - pgdata:/var/lib/postgresql/data

  mock-api:          # Docker 1 — 数据源
    build: ./backend/mock-api
    ports: ["8000:8000"]

  mcp-server:        # Docker 2 — 工具层
    build: ./backend/mcp-server
    depends_on: [mock-api, postgres]
    environment:
      MOCK_API_URL: http://mock-api:8000
      DATABASE_URL: postgresql://yanmian:yanmian123@postgres:5432/yanmian_agent

  agent:             # Docker 3 — 智能层
    build: ./backend/agent
    ports: ["8080:8080"]
    depends_on: [mcp-server, postgres]
    environment:
      MCP_SERVER_URL: http://mcp-server:3000
      DATABASE_URL: postgresql://yanmian:yanmian123@postgres:5432/yanmian_agent

  frontend:          # Docker 4 — 用户界面
    build: ./frontend
    ports: ["80:80"]
    depends_on: [agent]
    environment:
      AGENT_API_URL: http://agent:8080

volumes:
  pgdata:
```

---

### 阶段七：优化与交付

| 步骤 | 操作 | 产出 |
|------|------|------|
| 7.1 | Prompt 调优（根据测试结果迭代 System Prompt） | 更精准的 Agent 回答 |
| 7.2 | 知识库内容补充（客户提供真实资料后导入） | 更完整的知识库 |
| 7.3 | 对接真实 API（替换 Mock API 为用友 ERP 真实接口） | 生产环境就绪 |
| 7.4 | 前端 UI 细节打磨（响应式适配、交互优化） | 更好的用户体验 |
| 7.5 | 编写部署文档和使用手册 | 交付文档 |

---

### 当前进度总览

```
阶段一：开发环境搭建        ████████████████████ 100%  ✅
阶段二：Mock API 开发       ████████████████████ 100%  ✅
阶段三：MCP Server 开发     ░░░░░░░░░░░░░░░░░░░░   0%  ⬜ ← 当前
阶段四：Agent 开发           ░░░░░░░░░░░░░░░░░░░░   0%  ⬜
阶段五：前端 Web 界面开发    ░░░░░░░░░░░░░░░░░░░░   0%  ⬜
阶段六：集成联调             ░░░░░░░░░░░░░░░░░░░░   0%  ⬜
阶段七：优化与交付           ░░░░░░░░░░░░░░░░░░░░   0%  ⬜
```

---

## 六、待办事项

| 编号 | 事项 | 负责方 | 状态 |
|------|------|--------|------|
| 1 | 确认用友 ERP 版本及 API 文档 | 客户 IT | 待办 |
| 2 | 确认设备监控系统接口协议 | 客户 IT / 生产部 | 待办 |
| 3 | 收集知识库原始资料（KB01-KB05） | 客户生产部 | 待办 |
| 4 | 确认 LLM 部署方式和数据安全要求 | 双方协商 | 待办 |
| 5 | 确认发货统计报表的现有模板格式 | 客户仓储部 | 待办 |

---

## 七、运行与部署

### 7.1 本地开发运行（开发者电脑）

> 在自己电脑上跑通整个系统，用于开发调试和演示。

#### 前置条件

| 软件 | 版本要求 | 用途 |
|------|---------|------|
| Docker Desktop | ≥ 4.x | 容器运行环境 |
| WSL2（Windows 用户） | Ubuntu 22.04+ | Linux 开发环境 |
| Python | ≥ 3.11 | 后端本地调试 |
| Node.js | ≥ 18 | 前端本地调试 |
| Git | 任意 | 代码版本管理 |

#### 方式一：Docker Compose 一键启动（推荐）

适合完整运行整个系统，不需要逐个启动容器。

```bash
# 1. 进入项目根目录
cd ~/yanmian

# 2. 一键构建并启动全部 5 个容器
docker compose up --build

# 3. 后台运行（不占用终端）
docker compose up --build -d

# 4. 查看运行状态
docker compose ps

# 5. 查看日志
docker compose logs -f          # 全部容器日志
docker compose logs -f agent    # 只看 Agent 容器日志

# 6. 停止全部容器
docker compose down
```

启动后访问地址：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端界面 | http://localhost | 用户交互入口 |
| Agent API | http://localhost:8080 | Agent 后端接口 |
| Mock API | http://localhost:8000 | 模拟数据接口 |
| Mock API 文档 | http://localhost:8000/docs | Swagger 自动文档 |

#### 方式二：逐个容器启动（调试用）

开发某个模块时，可以只启动依赖的容器，本地直接运行当前模块方便调试。

```bash
# 示例：调试 Agent，只用 Docker 跑 Mock API 和 MCP Server

# 1. 启动 Mock API
cd ~/yanmian/backend/mock-api
docker build -t mock-api .
docker run -d -p 8000:8000 --name mock-api mock-api

# 2. 启动 MCP Server
cd ~/yanmian/backend/mcp-server
docker build -t mcp-server .
docker run -d -p 3000:3000 --name mcp-server \
  -e MOCK_API_URL=http://host.docker.internal:8000 mcp-server

# 3. 本地直接运行 Agent（不用 Docker，方便断点调试）
cd ~/yanmian/backend/agent
source .venv/bin/activate
pip install -r requirements.txt
export MCP_SERVER_URL=http://localhost:3000
python main.py

# 4. 本地直接运行前端（热更新，改代码自动刷新）
cd ~/yanmian/frontend
npm install
npm run dev
# 访问 http://localhost:5173
```

#### 常见问题

| 问题 | 解决方法 |
|------|---------|
| 端口被占用 | `lsof -i :8000` 查看占用进程，`kill` 或修改 docker-compose.yml 端口映射 |
| 容器间无法通信 | 确认使用 Docker Compose 启动（自动创建内部网络），或手动创建 `docker network` |
| WSL2 下 Docker 无法启动 | 检查 Docker Desktop → Settings → Resources → WSL Integration 是否开启 |
| 前端访问 Agent 跨域 | Agent 的 FastAPI 已配置 CORS 中间件，确认 `allow_origins` 包含前端地址 |
| pip/npm 下载慢 | 使用国内镜像源（pip 清华源、npm 淘宝源） |

---

### 7.2 远程访问（内网穿透）

> 本地开发阶段，如果需要让不在同一局域网的人访问你的系统（如远程演示、异地协作），可以使用内网穿透工具将本地端口映射到公网。

#### 推荐工具

| 工具 | 官网 | 特点 |
|------|------|------|
| cpolar | https://www.cpolar.com | 注册即用，免费版有限速，支持自定义域名（付费） |
| natfrp（Sakura Frp） | https://www.natfrp.com | 免费额度较大，国内节点多，速度好 |

#### 使用方式（以 cpolar 为例）

```bash
# 1. 下载安装 cpolar（Windows 下载安装包，Linux 用脚本安装）
# 官网：https://www.cpolar.com

# 2. 注册账号后，获取 authtoken 并登录
cpolar authtoken <你的token>

# 3. 映射前端 80 端口到公网
cpolar http 80
```

运行后 cpolar 会分配一个公网地址，如：

```
https://abc123.cpolar.io → http://localhost:80
```

将此地址发给对方即可访问系统前端。

#### 需要映射的端口

| 端口 | 服务 | 是否需要映射 |
|------|------|:-:|
| 80 | 前端（Nginx） | 是（对外访问入口） |
| 8080 | Agent API | 否（前端通过 Nginx 反向代理访问） |
| 3000 | MCP Server | 否（仅容器内部通信） |
| 8000 | Mock API | 否（仅容器内部通信） |
| 5432 | PostgreSQL | 否（仅容器内部通信） |

> 只需映射前端的 80 端口即可，其他服务通过 Docker 内部网络通信，不需要暴露到公网。

#### 注意事项

- 免费版 cpolar/natfrp 每次重启会更换公网地址，付费版可固定
- 确保 Windows 防火墙放行了 80 端口（入站规则）
- 内网穿透仅适合开发演示阶段，正式上线请使用 7.3 的服务器部署方案

---

### 7.3 正式上线部署（公司环境）

> 开发完成后，将系统部署到公司服务器，供实际业务人员使用。

#### 服务器要求

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 4 核 | 8 核 |
| 内存 | 8 GB | 16 GB |
| 硬盘 | 50 GB SSD | 100 GB SSD |
| 操作系统 | CentOS 7+ / Ubuntu 20.04+ | Ubuntu 22.04 LTS |
| Docker | ≥ 20.10 | 最新稳定版 |
| Docker Compose | ≥ 2.x | 最新稳定版 |

> 如果使用本地部署的 LLM（如通义千问、ChatGLM），需要额外的 GPU 服务器（建议 NVIDIA A100/A10 或同级别）。

#### 部署步骤

```
步骤一：准备服务器环境
├── 安装 Docker 和 Docker Compose
├── 配置防火墙，开放 80 端口（前端）
├── 创建项目目录 /opt/yanmian-agent/
└── 将项目代码上传到服务器

步骤二：配置环境变量
├── 创建 .env 文件，填写生产环境配置
│   ├── DB_USER=xxx               # PostgreSQL 用户名
│   ├── DB_PASSWORD=xxx           # PostgreSQL 密码
│   ├── LLM_API_KEY=xxx          # 大模型 API 密钥
│   ├── LLM_BASE_URL=xxx         # 大模型接口地址
│   ├── YONYOU_API_URL=xxx       # 用友 ERP 真实接口地址（替换 Mock API）
│   ├── YONYOU_API_KEY=xxx       # 用友 API 认证密钥
│   └── DEVICE_MONITOR_URL=xxx   # 设备监控系统真实接口地址
└── docker-compose.yml 中引用 .env 变量

步骤三：构建并启动
├── docker compose -f docker-compose.prod.yml up --build -d
├── docker compose ps  # 确认 5 个容器全部 running
└── docker compose logs -f  # 观察启动日志是否有报错

步骤四：配置 Nginx 反向代理（可选）
├── 将 80 端口映射到前端容器
├── 配置 /api/ 路径代理到 Agent 容器
└── 配置 SSL 证书（如需 HTTPS）

步骤五：验证
├── 浏览器访问 http://服务器IP（或域名）
├── 分别用三个角色登录，测试全部场景
└── 确认数据查询、报表生成、文档检索均正常
```

#### 生产环境 docker-compose.prod.yml 示例

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: yanmian_agent
    volumes:
      - pgdata:/var/lib/postgresql/data
    # 生产环境不对外暴露端口，仅内部通信

  mock-api:
    build: ./backend/mock-api
    restart: always
    # 生产环境不对外暴露端口，仅内部通信

  mcp-server:
    build: ./backend/mcp-server
    restart: always
    depends_on: [mock-api, postgres]
    environment:
      MOCK_API_URL: http://mock-api:8000
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/yanmian_agent
      # 上线后替换为真实接口：
      # YONYOU_API_URL: ${YONYOU_API_URL}
      # DEVICE_MONITOR_URL: ${DEVICE_MONITOR_URL}

  agent:
    build: ./backend/agent
    restart: always
    depends_on: [mcp-server, postgres]
    environment:
      MCP_SERVER_URL: http://mcp-server:3000
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/yanmian_agent
      LLM_API_KEY: ${LLM_API_KEY}
      LLM_BASE_URL: ${LLM_BASE_URL}

  frontend:
    build: ./frontend
    restart: always
    ports: ["80:80"]
    depends_on: [agent]

  # 可选：Nginx 反向代理（如需 HTTPS 或自定义域名）
  # nginx:
  #   image: nginx:alpine
  #   ports: ["443:443", "80:80"]
  #   volumes:
  #     - ./nginx/nginx.conf:/etc/nginx/nginx.conf
  #     - ./nginx/ssl:/etc/nginx/ssl
  #   depends_on: [frontend, agent]

volumes:
  pgdata:
```

#### 本地开发 vs 正式上线 对比

| 对比项 | 本地开发 | 正式上线 |
|--------|---------|---------|
| 数据源 | Mock API（模拟数据） | 用友 ERP + 设备监控系统（真实数据） |
| LLM | 可用云端 API 测试 | 根据安全要求选择私有化部署或云端 API |
| 端口暴露 | 全部端口对外（方便调试） | 仅 80/443 对外（前端入口） |
| 容器重启策略 | 无 | `restart: always`（自动恢复） |
| 日志 | 终端直接查看 | 接入日志收集系统（如 ELK） |
| HTTPS | 不需要 | 建议配置 SSL 证书 |
| .env 文件 | 可省略（使用默认值） | 必须配置（API 密钥、真实接口地址） |

#### 上线后运维

| 操作 | 命令 |
|------|------|
| 查看容器状态 | `docker compose -f docker-compose.prod.yml ps` |
| 查看实时日志 | `docker compose -f docker-compose.prod.yml logs -f` |
| 重启某个服务 | `docker compose -f docker-compose.prod.yml restart agent` |
| 更新代码后重新部署 | `docker compose -f docker-compose.prod.yml up --build -d` |
| 备份知识库数据 | `docker cp mcp-server:/app/knowledge_base ./backup/` |
| 备份 Excel 报表 | `docker cp mcp-server:/app/shipping_reports ./backup/` |
