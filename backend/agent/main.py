"""泰石岩棉 Agent 服务入口"""
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agents.factory import mcp_tools
from agents.router import get_agent, AGENT_MAP
from auth import USERS, verify_password, create_token, get_current_user


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


# ── 数据模型 ──

class LoginRequest(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    scene: str
    message: str
    user_id: str = "default_user"
    session_id: str | None = None


# ── 认证接口 ──

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    user = USERS.get(request.username)
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = create_token(
        user["user_id"], request.username, user["role"], user["display_name"]
    )
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "username": request.username,
            "display_name": user["display_name"],
            "role": user["role"],
        },
    }


@app.get("/api/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user


# ── 健康检查 ──

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "agents": list(AGENT_MAP.keys()),
        "mcp_connected": mcp_tools is not None,
    }


# ── 仪表盘 ──

@app.get("/api/dashboard")
async def dashboard(user: dict = Depends(get_current_user)):
    role = user["role"]
    data: dict = {}

    if role in ("production_leader", "manager"):
        data["line_status"] = {
            "running": 2, "warning": 1, "stopped": 0,
            "lines": [
                {"line_number": "A1", "line_name": "A车间1号产线", "status": "warning"},
                {"line_number": "A2", "line_name": "A车间2号产线", "status": "running"},
                {"line_number": "B1", "line_name": "B车间1号产线", "status": "running"},
            ],
        }
        data["alerts"] = [
            {"equipment": "熔炉", "line": "A1", "issue": "温度偏低 1280℃", "severity": "warning"},
        ]
        data["alerts_7d"] = [
            {"date": "02-09", "count": 1}, {"date": "02-10", "count": 0},
            {"date": "02-11", "count": 2}, {"date": "02-12", "count": 0},
            {"date": "02-13", "count": 1}, {"date": "02-14", "count": 0},
            {"date": "02-15", "count": 1},
        ]

    if role in ("accountant", "manager", "logistics"):
        data["today_shipping"] = {
            "orders": 12, "cubic_volume": 756.23, "amount": 165432.00,
        }
        data["shipping_7d"] = [
            {"date": "02-09", "volume": 680.5, "amount": 148200},
            {"date": "02-10", "volume": 720.3, "amount": 156800},
            {"date": "02-11", "volume": 695.1, "amount": 151300},
            {"date": "02-12", "volume": 810.7, "amount": 176500},
            {"date": "02-13", "volume": 756.2, "amount": 164700},
            {"date": "02-14", "volume": 690.0, "amount": 150200},
            {"date": "02-15", "volume": 756.2, "amount": 165400},
        ]

    data["knowledge_updates"] = {"recent_count": 3, "last_update": "2026-02-14 16:30"}
    return data


# ── 对话接口 ──

def _inject_time(message: str) -> str:
    """在用户消息前注入当前时间"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    return f"[当前时间: {now}]\n{message}"


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """对话接口（流式响应）"""
    try:
        agent = get_agent(request.scene)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    full_message = _inject_time(request.message)

    async def stream_response():
        response_stream = agent.arun(
            full_message,
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

    full_message = _inject_time(request.message)

    run_response = await agent.arun(
        full_message,
        user_id=request.user_id,
        session_id=request.session_id,
        stream=False,
    )

    return {
        "scene": request.scene,
        "message": request.message,
        "response": run_response.content,
    }
