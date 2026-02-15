"""Agent 配置管理"""
import os

LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.zetatechs.com/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://yanmian:yanmian123@postgres:5432/yanmian_agent")
MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://mcp-server:3000/mcp")
