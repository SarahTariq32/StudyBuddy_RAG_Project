from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
import time

# Uses Chroma's ONNX-based default embedding model (CPU-friendly and lighter
# than installing full PyTorch + sentence-transformers in container builds).
_embedder = DefaultEmbeddingFunction()


def create_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Encode a list of strings into normalized embedding vectors.
    Returns a list of float lists (one per input text).
    """
    cleaned = [text for text in texts if (text or "").strip()]
    if not cleaned:
        raise ValueError("No non-empty text provided for embeddings")

    last_exc = None
    for attempt in range(3):
        try:
            return _embedder(cleaned)
        except Exception as exc:
            last_exc = exc
            if attempt < 2:
                time.sleep(1.5)

    raise RuntimeError(f"Embedding generation failed after retries: {last_exc}") from last_exc
