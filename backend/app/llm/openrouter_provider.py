# from openai import OpenAI
# from app.config import OPENROUTER_API_KEY, OPENROUTER_MODEL
# from app.llm.base import LLMProvider


# class OpenRouterProvider(LLMProvider):
#     def __init__(self):
#         self.client = OpenAI(
#             api_key=OPENROUTER_API_KEY,
#             base_url="https://openrouter.ai/api/v1",
#         )

#     def generate(self, prompt: str) -> str:
#         response = self.client.chat.completions.create(
#             model=OPENROUTER_MODEL,
#             messages=[{"role": "user", "content": prompt}],
#         )
#         return response.choices[0].message.content


# ...existing code...
from openai import (
    OpenAI,
    NotFoundError,
    AuthenticationError,
    RateLimitError,
    APIConnectionError,
    APIStatusError,
)
from app.config import OPENROUTER_API_KEY, OPENROUTER_MODEL
from app.llm.base import LLMProvider


class OpenRouterProvider(LLMProvider):
    def __init__(self):
        self.client = OpenAI(
            api_key=OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
        )

    def generate(self, prompt: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=[{"role": "user", "content": prompt}],
            )
        except NotFoundError as exc:
            raise RuntimeError(
                f"OpenRouter model not available: {OPENROUTER_MODEL}"
            ) from exc
        except AuthenticationError as exc:
            raise RuntimeError("Invalid OPENROUTER_API_KEY") from exc
        except RateLimitError as exc:
            raise RuntimeError("OpenRouter rate limit exceeded") from exc
        except APIConnectionError as exc:
            raise RuntimeError("Cannot reach OpenRouter API") from exc
        except APIStatusError as exc:
            raise RuntimeError(f"OpenRouter API error: {exc.status_code}") from exc

        content = response.choices[0].message.content if response.choices else ""
        if not content:
            raise RuntimeError("LLM returned empty response.")
        return content.strip()
# ...existing code...