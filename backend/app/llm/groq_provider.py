from groq import Groq

from app.config import GROQ_API_KEY, GROQ_MODEL
from app.llm.base import LLMProvider


class GroqProvider(LLMProvider):
    def __init__(self):
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is missing. Add it to your .env file.")
        self.client = Groq(api_key=GROQ_API_KEY)

    def generate(self, prompt: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
            )
        except Exception as exc:
            raise RuntimeError(
                f"Groq request failed for model '{GROQ_MODEL}'. "
                f"Check GROQ_API_KEY and GROQ_MODEL in .env. Details: {exc}"
            ) from exc

        content = response.choices[0].message.content
        if not content:
            raise RuntimeError("Groq returned an empty response.")
        return content
