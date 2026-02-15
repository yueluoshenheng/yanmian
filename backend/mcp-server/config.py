"""MCP Server 配置"""
import os

# Mock API 地址
MOCK_API_BASE_URL = os.getenv("MOCK_API_BASE_URL", "http://localhost:8000")

# PostgreSQL 连接
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://yanmian:yanmian123@localhost:5432/yanmian_agent")

# Embedding 模型
EMBEDDING_MODEL_NAME = "BAAI/bge-small-zh-v1.5"
EMBEDDING_DIMENSION = 512

# 知识库文档目录
KNOWLEDGE_DOCS_DIR = os.path.join(os.path.dirname(__file__), "knowledge_base", "documents")

# 文档分段参数
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
