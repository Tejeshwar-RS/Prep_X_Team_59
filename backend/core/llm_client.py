from groq import Groq
from config import settings


class LLMClient:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

        # Best free Groq model for structured reasoning
        self.model = "llama-3.1-8b-instant"

    def generate(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a strict JSON generator. "
                        "Return only valid JSON. "
                        "Do not add explanations."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7  # Increased for more diverse outputs
        )

        return response.choices[0].message.content
