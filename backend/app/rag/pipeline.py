from app.config import TOP_K, NUM_MULTI_QUERIES, MAX_CONTEXT_PARENTS
from app.rag.embeddings import create_embeddings
from app.rag.query_rewrite import generate_multi_queries
from app.rag import vector_store


def _ranked_parent_hits(queries: list[str], seen: set[str]) -> list[str]:
    """
    Retrieve parents for a query batch and rank candidates by vector distance
    (lower is better). Returns new unique parent texts only.
    """
    if not queries:
        return []

    scored: list[tuple[float, str]] = []
    for embedding in create_embeddings(queries):
        hits = vector_store.search(embedding, TOP_K)
        for hit in hits:
            parent_text = hit.get("parent_text", "")
            distance = float(hit.get("distance", 1e9))
            if parent_text and parent_text not in seen:
                scored.append((distance, parent_text))

    scored.sort(key=lambda x: x[0])

    ordered_unique: list[str] = []
    local_seen: set[str] = set()
    for _, parent_text in scored:
        if parent_text in local_seen:
            continue
        local_seen.add(parent_text)
        ordered_unique.append(parent_text)
    return ordered_unique


def retrieve_context(question: str) -> list[str]:
    """
    Multi-query retrieval: rewrite the question, search Chroma for each variant,
    dedupe parent chunks, and return up to MAX_CONTEXT_PARENTS unique parents.
    """
    question = (question or "").strip()
    if not question:
        return []

    seen: set[str] = set()
    parents: list[str] = []

    # First pass: direct retrieval from the original question only.
    primary = _ranked_parent_hits([question], seen)
    for parent_text in primary:
        seen.add(parent_text)
        parents.append(parent_text)
        if len(parents) >= MAX_CONTEXT_PARENTS:
            return parents

    # Fast path: if direct retrieval already found enough context, skip
    # LLM-based query rewriting to reduce latency.
    enough_without_rewrite = min(3, MAX_CONTEXT_PARENTS)
    if len(parents) >= enough_without_rewrite or NUM_MULTI_QUERIES <= 0:
        return parents

    # Second pass: broaden recall using rewritten variants; tolerate rewrite
    # failures so /ask still works with direct retrieval.
    try:
        rewrites = [q for q in generate_multi_queries(question, NUM_MULTI_QUERIES) if q]
    except Exception as exc:
        print(f"Query rewrite failed; falling back to direct retrieval: {exc}")
        rewrites = []

    expanded = _ranked_parent_hits(rewrites, seen)
    for parent_text in expanded:
        seen.add(parent_text)
        parents.append(parent_text)
        if len(parents) >= MAX_CONTEXT_PARENTS:
            return parents

    return parents
