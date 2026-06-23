from app.config import LLM_PROVIDER
from app.llm.gemini_provider import GeminiProvider
from app.llm.groq_provider import GroqProvider
from app.llm.openrouter_provider import OpenRouterProvider
_client = None

def get_llm_client():
    global _client
    if _client is not None:
        return _client

    if LLM_PROVIDER == "gemini":
        _client = GeminiProvider()
    elif LLM_PROVIDER == "groq":
        _client = GroqProvider()
    elif LLM_PROVIDER == "openrouter":
        _client = OpenRouterProvider()
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {LLM_PROVIDER}")
    return _client