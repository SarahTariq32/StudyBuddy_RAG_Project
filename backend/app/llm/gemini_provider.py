from google import genai
from google.genai import errors as genai_errors

from app.config import GEMINI_API_KEY, GEMINI_MODEL
from app.llm.base import LLMProvider


class GeminiProvider(LLMProvider):
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is missing. Add it to your .env file.")
        self.client = genai.Client(api_key=GEMINI_API_KEY)

    def generate(self, prompt: str) -> str:
        try:
            response = self.client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
            )
        except genai_errors.ClientError as exc:
            raise RuntimeError(
                f"Gemini request failed for model '{GEMINI_MODEL}'. "
                f"Check GEMINI_MODEL in .env. Details: {exc}"
            ) from exc

        text = response.text
        if not text:
            raise RuntimeError("Gemini returned an empty response.")
        return text
