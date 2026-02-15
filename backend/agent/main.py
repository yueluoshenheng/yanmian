"""泰石岩棉 Agent 服务入口"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agents.factory import mcp_tools
from agents.router import get_agent, AGENT_MAP


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时连接 MCP，关闭时断开"""
    print("正在连接 MCP Server...")
    await mcp_tools.connect()
    print("MCP Server 已连接")
    yield
    print("正在断开 MCP Server...")
    await mcp_tools.close()


app = FastAPI(title="泰石岩棉 Agent API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    scene: str
    message: str
    user_id: str = "default_user"
    session_id: str | None = None


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "agents": list(AGENT_MAP.keys()),
        "mcp_connected": mcp_tools is not None,
    }


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """对话接口（流式响应）"""
    try:
        agent = get_agent(request.scene)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    async def stream_response():
        response_stream = agent.arun(
            request.message,
            user_id=request.user_id,
            session_id=request.session_id,
            stream=True,
        )
        async for chunk in response_stream:
            if hasattr(chunk, 'content') and chunk.content:
                yield chunk.content

    return StreamingResponse(stream_response(), media_type="text/plain; charset=utf-8")


@app.post("/api/chat/sync")
async def chat_sync(request: ChatRequest):
    """对话接口（同步响应，用于测试）"""
    try:
        agent = get_agent(request.scene)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    run_response = await agent.arun(
        request.message,
        user_id=request.user_id,
        session_id=request.session_id,
        stream=False,
    )

    return {
        "scene": request.scene,
        "message": request.message,
        "response": run_response.content,
    }
