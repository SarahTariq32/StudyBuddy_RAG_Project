from app.config import TOP_K, NUM_MULTI_QUERIES, MAX_CONTEXT_PARENTS
from app.rag.embeddings import create_embeddings
from app.rag.query_rewrite import generate_multi_queries
from app.rag import vector_store


def retrieve_context(question: str) -> list[str]:
    """
    Multi-query retrieval: rewrite the question, search Chroma for each variant,
    dedupe parent chunks, and return up to MAX_CONTEXT_PARENTS unique parents.
    """
    queries = [question] + generate_multi_queries(question, NUM_MULTI_QUERIES)
    queries = [q for q in queries if q]
    if not queries:
        return []

    seen: set[str] = set()
    parents: list[str] = []

    # Embed all query variants in one batch — faster than one call per query.
    for embedding in create_embeddings(queries):
        hits = vector_store.search(embedding, TOP_K)
        for meta in hits:
            parent_text = meta.get("parent_text", "")
            if parent_text and parent_text not in seen:
                seen.add(parent_text)
                parents.append(parent_text)
                if len(parents) >= MAX_CONTEXT_PARENTS:
                    return parents

    return parents
