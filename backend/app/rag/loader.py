from pypdf import PdfReader


def load_single_pdf(path: str, max_pages: int | None = None) -> str:
    """
    Open a PDF at the given file path, extract text from every page,
    join all pages with a newline, and return as one string.
    """
    reader = PdfReader(path)
    pages_source = reader.pages if max_pages is None else reader.pages[:max_pages]
    pages = []
    for i, page in enumerate(pages_source):
        text = page.extract_text() or ""
        if not text.strip():
            print(f"WARNING: No extractable text on PDF page {i + 1} for {path}")
        pages.append(text)
    return "\n".join(pages)
