from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

# Uses Chroma's ONNX-based default embedding model (CPU-friendly and lighter
# than installing full PyTorch + sentence-transformers in container builds).
_embedder = DefaultEmbeddingFunction()


def create_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Encode a list of strings into normalized embedding vectors.
    Returns a list of float lists (one per input text).
    """
    return _embedder(texts)
