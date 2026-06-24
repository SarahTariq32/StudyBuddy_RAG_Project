def create_parent_chunks(text: str, parent_size: int, overlap: int) -> list[str]:
    """
    Slide a window of `parent_size` characters across `text`, advancing by
    (parent_size - overlap) each step. Returns a list of chunk strings.
    """
    if parent_size <= 0:
        raise ValueError("parent_size must be > 0")
    if overlap < 0 or overlap >= parent_size:
        raise ValueError("overlap must be >= 0 and < parent_size")

    chunks = []
    step = parent_size - overlap
    start = 0
    while start < len(text):
        chunks.append(text[start : start + parent_size])
        start += step
    return chunks


def create_child_chunks(
    parent_chunks: list[str], child_size: int, overlap: int
) -> tuple[list[str], list[int]]:
    """
    For each parent chunk, slide a smaller window of `child_size` across it.
    Returns:
      child_chunks   — flat list of all child strings
      parent_mapping — parallel list where parent_mapping[i] is the index of the
                       parent that child_chunks[i] came from
    """
    if child_size <= 0:
        raise ValueError("child_size must be > 0")
    if overlap < 0 or overlap >= child_size:
        raise ValueError("overlap must be >= 0 and < child_size")

    child_chunks = []
    parent_mapping = []
    step = child_size - overlap

    for parent_index, parent_text in enumerate(parent_chunks):
        start = 0
        while start < len(parent_text):
            child = parent_text[start : start + child_size]
            if child.strip():
                child_chunks.append(child)
                parent_mapping.append(parent_index)
            start += step

    return child_chunks, parent_mapping
