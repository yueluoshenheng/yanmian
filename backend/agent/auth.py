"""JWT 认证模块"""
import jwt
import bcrypt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "yanmian-agent-secret-2026"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

# 演示用户（密码均为 123456 的 bcrypt 哈希，与 init.sql 一致）
USERS = {
    "zhangsan": {
        "user_id": 1,
        "password_hash": "$2b$12$TvMc5oQ6tTkO4XjYYSPvY.3GvGEV0YhvsfD/tE6qQr7aGkVnz1JKW",
        "display_name": "张师傅",
        "role": "production_leader",
    },
    "lihui": {
        "user_id": 2,
        "password_hash": "$2b$12$TvMc5oQ6tTkO4XjYYSPvY.3GvGEV0YhvsfD/tE6qQr7aGkVnz1JKW",
        "display_name": "李会计",
        "role": "accountant",
    },
    "wangzhu": {
        "user_id": 3,
        "password_hash": "$2b$12$TvMc5oQ6tTkO4XjYYSPvY.3GvGEV0YhvsfD/tE6qQr7aGkVnz1JKW",
        "display_name": "王主任",
        "role": "manager",
    },
    "zhaoliu": {
        "user_id": 4,
        "password_hash": "$2b$12$TvMc5oQ6tTkO4XjYYSPvY.3GvGEV0YhvsfD/tE6qQr7aGkVnz1JKW",
        "display_name": "赵物流",
        "role": "logistics",
    },
}

security = HTTPBearer(auto_error=False)


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(user_id: int, username: str, role: str, display_name: str) -> str:
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "display_name": display_name,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="未提供认证信息")
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token 已过期")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="无效 Token")
