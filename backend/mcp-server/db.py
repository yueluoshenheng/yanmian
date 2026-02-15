"""PostgreSQL + pgvector 操作封装"""
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DATABASE_URL

_conn = None


def get_conn():
    global _conn
    if _conn is None or _conn.closed:
        _conn = psycopg2.connect(DATABASE_URL)
        _conn.autocommit = True
    return _conn


def search_vectors(query_embedding: list[float], top_k: int = 5, category: str | None = None) -> list[dict]:
    """pgvector 余弦相似度搜索"""
    conn = get_conn()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        embedding_str = "[" + ",".join(str(v) for v in query_embedding) + "]"
        if category:
            cur.execute(
                """SELECT doc_id, category, title, content, source_file, section,
                          1 - (embedding <=> %s::vector) AS score
                   FROM knowledge_documents
                   WHERE category = %s
                   ORDER BY embedding <=> %s::vector
                   LIMIT %s""",
                (embedding_str, category, embedding_str, top_k),
            )
        else:
            cur.execute(
                """SELECT doc_id, category, title, content, source_file, section,
                          1 - (embedding <=> %s::vector) AS score
                   FROM knowledge_documents
                   ORDER BY embedding <=> %s::vector
                   LIMIT %s""",
                (embedding_str, embedding_str, top_k),
            )
        return cur.fetchall()


def insert_document(category: str, title: str, content: str, source_file: str,
                    section: str | None, embedding: list[float]) -> int:
    """插入一条知识库文档"""
    conn = get_conn()
    with conn.cursor() as cur:
        embedding_str = "[" + ",".join(str(v) for v in embedding) + "]"
        cur.execute(
            """INSERT INTO knowledge_documents (category, title, content, source_file, section, embedding)
               VALUES (%s, %s, %s, %s, %s, %s::vector)
               RETURNING doc_id""",
            (category, title, content, source_file, section, embedding_str),
        )
        return cur.fetchone()[0]


def count_documents() -> int:
    """统计知识库文档数量"""
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM knowledge_documents")
        return cur.fetchone()[0]
