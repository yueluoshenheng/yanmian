"""场景路由：根据 scene 参数分发到对应 Agent"""
from agno.agent import Agent
from agents.factory import tuning_agent, search_agent, shipping_agent

AGENT_MAP: dict[str, Agent] = {
    "equipment_tuning": tuning_agent,
    "doc_search": search_agent,
    "shipping_stats": shipping_agent,
}


def get_agent(scene: str) -> Agent:
    """根据场景名获取对应 Agent"""
    agent = AGENT_MAP.get(scene)
    if not agent:
        raise ValueError(f"未知场景: {scene}，可选值: {list(AGENT_MAP.keys())}")
    return agent
