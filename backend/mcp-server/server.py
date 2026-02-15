"""泰石岩棉 MCP Server 入口"""
from mcp.server.fastmcp import FastMCP
from mcp.server.fastmcp.server import TransportSecuritySettings

from tools.knowledge import search_knowledge_base, write_knowledge_base
from tools.equipment import get_equipment_status
from tools.shipping import query_shipment_plan
from tools.logistics import query_logistics
from tools.excel import generate_shipping_excel, query_shipping_reports

mcp = FastMCP(
    "yanmian-mcp-server",
    host="0.0.0.0",
    port=3000,
    transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=False),
)

# 注册 7 个 MCP 工具
mcp.tool()(search_knowledge_base)
mcp.tool()(write_knowledge_base)
mcp.tool()(get_equipment_status)
mcp.tool()(query_shipment_plan)
mcp.tool()(query_logistics)
mcp.tool()(generate_shipping_excel)
mcp.tool()(query_shipping_reports)


def init_knowledge_base():
    """启动时初始化知识库"""
    try:
        from knowledge_base.loader import load_documents
        print("正在检查知识库...")
        load_documents(force_reload=False)
    except Exception as e:
        print(f"知识库初始化失败（可稍后重试）: {e}")


if __name__ == "__main__":
    print("正在加载 Embedding 模型...")
    from embedding import get_model
    get_model()
    print("Embedding 模型加载完成")

    init_knowledge_base()

    print("启动 MCP Server (streamable-http, port 3000)...")
    mcp.run(transport="streamable-http")
