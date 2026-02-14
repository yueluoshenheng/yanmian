from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import shipping, equipment, logistics, excel

app = FastAPI(
    title="泰石岩棉 Mock API",
    description="模拟用友 ERP、设备监控、物流系统的接口",
    version="1.0.0",
    swagger_ui_parameters={"tryItOutEnabled": True},
    docs_url=None,
    redoc_url=None,
)

# 替换 Swagger UI 的 CDN 为国内可访问的地址
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        swagger_js_url="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css",
    )

@app.get("/redoc", include_in_schema=False)
async def custom_redoc():
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=app.title + " - ReDoc",
        redoc_js_url="https://unpkg.com/redoc@next/bundles/redoc.standalone.js",
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shipping.router)
app.include_router(equipment.router)
app.include_router(logistics.router)
app.include_router(excel.router)

# 确保报表存储目录存在
Path(__file__).parent.joinpath("shipping_reports").mkdir(exist_ok=True)


@app.get("/")
def root():
    return {"message": "泰石岩棉 Mock API 运行中", "docs": "/docs"}
