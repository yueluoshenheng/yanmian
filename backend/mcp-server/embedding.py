"""Embedding 模型封装"""
from sentence_transformers import SentenceTransformer
from config import EMBEDDING_MODEL_NAME

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _model


def embed_text(text: str) -> list[float]:
    """将文本转为向量"""
    model = get_model()
    return model.encode(text, normalize_embeddings=True).tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """批量将文本转为向量"""
    model = get_model()
    return model.encode(texts, normalize_embeddings=True).tolist()
