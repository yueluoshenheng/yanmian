"""MCP 工具：知识库检索与写入"""
import httpx
from embedding import embed_text
from db import search_vectors, insert_document


async def search_knowledge_base(query: str, top_k: int = 5, category: str = None) -> dict:
    """检索岩棉制造相关的技术文档和历史经验记录

    Args:
        query: 自然语言查询内容，如"熔炉温度偏低怎么调整"
        top_k: 返回结果数量，默认5
        category: 按分类筛选，可选值：standard_process/equipment_manual/troubleshooting/faq/product_specs
    """
    if not query or not query.strip():
        return {"code": 400, "message": "查询内容不能为空"}

    try:
        query_embedding = embed_text(query)
    except Exception as e:
        return {"code": 500, "message": f"向量化服务异常: {str(e)}"}

    results = search_vectors(query_embedding, top_k, category)

    return {
        "results": [
            {
                "content": r["content"],
                "source": r["source_file"],
                "section": r.get("section"),
                "category": r["category"],
                "score": round(float(r["score"]), 4),
            }
            for r in results
        ]
    }


async def write_knowledge_base(title: str, problem: str, solution: str,
                                result: str, equipment: str, operator: str, date: str) -> dict:
    """将新的设备调优经验记录写入知识库（知识进化）

    Args:
        title: 事件标题，如"熔炉温度偏低导致产量下降"
        problem: 异常描述
        solution: 调整方案
        result: 调整结果
        equipment: 涉及设备
        operator: 操作人
        date: 日期（YYYY-MM-DD）
    """
    required = {"title": title, "problem": problem, "solution": solution,
                "result": result, "equipment": equipment, "operator": operator, "date": date}
    for field, value in required.items():
        if not value or not str(value).strip():
            return {"code": 400, "message": f"缺少必填字段：{field}"}

    # 拼接完整文本用于向量化
    full_text = f"标题：{title}\n问题：{problem}\n解决方案：{solution}\n结果：{result}\n设备：{equipment}\n操作人：{operator}\n日期：{date}"

    try:
        embedding = embed_text(full_text)
    except Exception as e:
        return {"code": 500, "message": f"知识库写入失败: {str(e)}"}

    # 生成记录 ID
    import re
    from db import get_conn
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM knowledge_documents WHERE category = 'troubleshooting'")
        count = cur.fetchone()[0]
    record_id = f"EXP-{date.replace('-', '')}-{count + 1:03d}"

    doc_id = insert_document(
        category="troubleshooting",
        title=title,
        content=full_text,
        source_file=f"agent_experience/{record_id}",
        section=equipment,
        embedding=embedding,
    )

    return {"success": True, "record_id": record_id, "doc_id": doc_id}
