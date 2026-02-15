"""Agent 工厂：创建 3 个场景 Agent"""
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.mcp import MCPTools
from agno.db.postgres import PostgresDb
from agno.memory import MemoryManager

from config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, DATABASE_URL, MCP_SERVER_URL
from prompts.equipment_tuning import EQUIPMENT_TUNING_PROMPT
from prompts.doc_search import DOC_SEARCH_PROMPT
from prompts.shipping_stats import SHIPPING_STATS_PROMPT

# 共享数据库（Agno 自动创建 session/memory 等表）
db = PostgresDb(db_url=DATABASE_URL)

# LLM 模型
model = OpenAIChat(
    id=LLM_MODEL,
    api_key=LLM_API_KEY,
    base_url=LLM_BASE_URL,
)

# MCP 工具（连接 MCP Server）
mcp_tools = MCPTools(
    url=MCP_SERVER_URL,
    transport="streamable-http",
)

# 记忆管理器
memory_manager = MemoryManager(
    model=model,
    db=db,
    memory_capture_instructions="""\
只提取与工作相关的信息，包括：
- 操作员负责的产线和设备
- 操作员的技术专长和经验
- 设备故障和处理经验
- 操作偏好（如偏好折线图还是表格）
忽略以下内容：
- 个人生活、爱好、闲聊
- 重复的寒暄和问候
""",
)


def create_agent(name: str, instructions: str) -> Agent:
    """创建一个场景 Agent"""
    return Agent(
        name=name,
        model=model,
        tools=[mcp_tools],
        instructions=instructions,
        db=db,
        memory_manager=memory_manager,
        add_history_to_context=True,
        num_history_runs=5,
        read_chat_history=True,
        store_history_messages=True,
        markdown=True,
    )


# 三个场景 Agent
tuning_agent = create_agent("设备调优专家", EQUIPMENT_TUNING_PROMPT)
search_agent = create_agent("文档检索顾问", DOC_SEARCH_PROMPT)
shipping_agent = create_agent("发货统计助手", SHIPPING_STATS_PROMPT)
