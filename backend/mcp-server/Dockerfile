FROM python:3.11-slim

WORKDIR /app

# 替换 apt 源为清华镜像
RUN sed -i 's|deb.debian.org|mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list.d/debian.sources

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# 先装 CPU-only 版 PyTorch（约 200MB，比默认的 2GB 小很多）
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# 安装其他依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# 预下载 Embedding 模型（构建时缓存，避免运行时下载）
ENV HF_ENDPOINT=https://hf-mirror.com
ENV SENTENCE_TRANSFORMERS_HOME=/app/models
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-small-zh-v1.5')"

ENV MOCK_API_BASE_URL=http://mock-api:8000
ENV DATABASE_URL=postgresql://yanmian:yanmian123@postgres:5432/yanmian_agent

COPY . .

EXPOSE 3000

CMD ["python", "server.py"]
