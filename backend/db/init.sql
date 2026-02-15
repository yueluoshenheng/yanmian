-- 泰石岩棉 Agent 系统 — 数据库初始化脚本
-- 文件：backend/db/init.sql

-- 1. 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 用户信息表
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100) NOT NULL,
    role          VARCHAR(30) NOT NULL CHECK (role IN ('production_leader', 'accountant', 'manager', 'logistics')),
    avatar        VARCHAR(255),
    created_at    TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- 3. 会话表
CREATE TABLE sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(user_id),
    scene      VARCHAR(30) NOT NULL CHECK (scene IN ('equipment_tuning', 'doc_search', 'shipping_stats')),
    title      VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_scene ON sessions(user_id, scene, updated_at DESC);

-- 4. 消息记录表
CREATE TABLE messages (
    message_id   VARCHAR(36) PRIMARY KEY,
    session_id   VARCHAR(36) NOT NULL REFERENCES sessions(session_id),
    role         VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
    content      TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    tool_calls   JSONB,
    attachments  JSONB,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id, created_at ASC);

-- 5. 模型配置表
CREATE TABLE llm_configs (
    config_id         SERIAL PRIMARY KEY,
    provider_type     VARCHAR(10) NOT NULL CHECK (provider_type IN ('local', 'cloud')),
    provider_name     VARCHAR(30) NOT NULL,
    base_url          VARCHAR(500) NOT NULL,
    api_key_encrypted VARCHAR(500),
    model_name        VARCHAR(100) NOT NULL,
    temperature       DECIMAL(3,2) DEFAULT 0.70,
    max_tokens        INTEGER DEFAULT 4096,
    is_active         BOOLEAN DEFAULT FALSE,
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- 6. 知识库文档表（pgvector）
CREATE TABLE knowledge_documents (
    doc_id      SERIAL PRIMARY KEY,
    category    VARCHAR(30) NOT NULL,
    title       VARCHAR(200) NOT NULL,
    content     TEXT NOT NULL,
    source_file VARCHAR(200) NOT NULL,
    section     VARCHAR(200),
    embedding   VECTOR(512) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    created_by  INTEGER REFERENCES users(user_id)
);

CREATE INDEX idx_knowledge_embedding ON knowledge_documents
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

CREATE INDEX idx_knowledge_category ON knowledge_documents(category);

-- 7. 发货报表元数据表
CREATE TABLE shipping_reports (
    report_id   SERIAL PRIMARY KEY,
    storage_id  VARCHAR(50) UNIQUE NOT NULL,
    file_name   VARCHAR(200) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    report_date DATE NOT NULL,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
    created_by  INTEGER REFERENCES users(user_id),
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_date_type ON shipping_reports(report_date DESC, report_type);

-- 8. 插入默认 LLM 配置
INSERT INTO llm_configs (provider_type, provider_name, base_url, model_name, is_active)
VALUES ('local', 'ollama', 'http://localhost:11434/v1', 'qwen2.5', TRUE);

-- 9. 插入演示用户（开发环境，密码均为 123456 的 bcrypt 哈希）
INSERT INTO users (username, password_hash, display_name, role) VALUES
('zhangsan', '$2b$12$TvMc5oQ6tTkO4XjYYSPvY.3GvGEV0YhvsfD/tE6qQr7aGkVnz1JKW', '张师傅', 'production_leader'),
('lihui',    '$2b$12$TvMc5oQ6tTkO4XjYYSPvY.3GvGEV0YhvsfD/tE6qQr7aGkVnz1JKW', '李会计', 'accountant'),
('wangzhu',  '$2b$12$TvMc5oQ6tTkO4XjYYSPvY.3GvGEV0YhvsfD/tE6qQr7aGkVnz1JKW', '王主任', 'manager'),
('zhaoliu',  '$2b$12$TvMc5oQ6tTkO4XjYYSPvY.3GvGEV0YhvsfD/tE6qQr7aGkVnz1JKW', '赵物流', 'logistics');
