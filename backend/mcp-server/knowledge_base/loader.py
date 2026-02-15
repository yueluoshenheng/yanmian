"""知识库文档加载器：读取 Markdown → 分段 → 向量化 → 写入 pgvector"""
import os
import re
from config import KNOWLEDGE_DOCS_DIR, CHUNK_SIZE, CHUNK_OVERLAP
from embedding import embed_texts
from db import insert_document, count_documents

# 文件名 → category 映射
FILE_CATEGORY_MAP = {
    "standard_process.md": "standard_process",
    "equipment_manual_furnace.md": "equipment_manual",
    "equipment_manual_centrifuge.md": "equipment_manual",
    "equipment_manual_collector.md": "equipment_manual",
    "equipment_manual_curing.md": "equipment_manual",
    "equipment_manual_cutter.md": "equipment_manual",
    "troubleshooting_records.md": "troubleshooting",
    "faq.md": "faq",
    "product_specs.md": "product_specs",
}


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """递归分段：按段落 → 句子 → 字符切分"""
    if len(text) <= chunk_size:
        return [text.strip()] if text.strip() else []

    # 按优先级尝试分隔符
    separators = ["\n\n", "\n", "。", "；", " "]
    for sep in separators:
        parts = text.split(sep)
        if len(parts) > 1:
            chunks = []
            current = ""
            for part in parts:
                candidate = current + sep + part if current else part
                if len(candidate) > chunk_size and current:
                    chunks.append(current.strip())
                    # 保留重叠
                    current = current[-overlap:] + sep + part if overlap else part
                else:
                    current = candidate
            if current.strip():
                chunks.append(current.strip())
            return [c for c in chunks if c]

    # 最后按字符硬切
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i:i + chunk_size]
        if chunk.strip():
            chunks.append(chunk.strip())
    return chunks


def extract_section(text: str, chunk: str) -> str | None:
    """尝试从上下文提取章节标题"""
    pos = text.find(chunk[:50])
    if pos < 0:
        return None
    # 向前查找最近的标题行
    before = text[:pos]
    lines = before.split("\n")
    for line in reversed(lines):
        line = line.strip()
        if line.startswith("#"):
            return re.sub(r"^#+\s*", "", line)
    return None


def load_documents(force_reload: bool = False):
    """加载所有知识库文档到 pgvector"""
    existing = count_documents()
    if existing > 0 and not force_reload:
        print(f"知识库已有 {existing} 条记录，跳过加载（使用 force_reload=True 强制重新加载）")
        return

    if force_reload and existing > 0:
        from db import get_conn
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("DELETE FROM knowledge_documents")
        print(f"已清空 {existing} 条旧记录")

    total_chunks = 0
    for filename, category in FILE_CATEGORY_MAP.items():
        filepath = os.path.join(KNOWLEDGE_DOCS_DIR, filename)
        if not os.path.exists(filepath):
            print(f"警告：文件不存在，跳过 {filename}")
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # 提取文档标题
        title = filename.replace(".md", "")
        first_line = content.strip().split("\n")[0]
        if first_line.startswith("#"):
            title = re.sub(r"^#+\s*", "", first_line)

        # 分段
        chunks = chunk_text(content)
        if not chunks:
            continue

        # 批量向量化
        embeddings = embed_texts(chunks)

        # 写入数据库
        for chunk, emb in zip(chunks, embeddings):
            section = extract_section(content, chunk)
            insert_document(
                category=category,
                title=title,
                content=chunk,
                source_file=filename,
                section=section,
                embedding=emb,
            )

        total_chunks += len(chunks)
        print(f"已加载 {filename} → {len(chunks)} 个切片（category: {category}）")

    print(f"知识库加载完成，共 {total_chunks} 个切片")


if __name__ == "__main__":
    load_documents(force_reload=True)
