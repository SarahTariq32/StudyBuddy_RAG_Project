from app.llm.factory import get_llm_client


def generate_multi_queries(question: str, n: int) -> list[str]:
    """
    Ask the LLM for n differently-phrased versions of the question.
    Returns one query string per non-empty line in the response.
    """
    if n <= 0:
        return []

    prompt = (
        f"Generate {n} differently-phrased versions of the following question, "
        f"one per line. Do not number them. Do not add anything else.\n\n"
        f"Question: {question}"
    )
    response = get_llm_client().generate(prompt)
    lines = [line.strip(" -\t") for line in response.split("\n") if line.strip()]

    # Keep unique, non-trivial rewrites and cap at n.
    rewrites: list[str] = []
    seen: set[str] = set()
    for line in lines:
        if len(line) < 4:
            continue
        normalized = line.lower()
        if normalized in seen:
            continue
        seen.add(normalized)
        rewrites.append(line)
        if len(rewrites) >= n:
            break
    return rewrites
