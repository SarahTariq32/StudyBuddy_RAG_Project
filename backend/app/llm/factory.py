from app.config import LLM_PROVIDER

_client = None

def get_llm_client():
    global _client
    if _client is not None:
        return _client

    if LLM_PROVIDER == "gemini":
        from app.llm.gemini_provider import GeminiProvider

        _client = GeminiProvider()
    elif LLM_PROVIDER == "groq":
        from app.llm.groq_provider import GroqProvider

        _client = GroqProvider()
    elif LLM_PROVIDER == "openrouter":
        from app.llm.openrouter_provider import OpenRouterProvider

        _client = OpenRouterProvider()
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {LLM_PROVIDER}")
    return _client