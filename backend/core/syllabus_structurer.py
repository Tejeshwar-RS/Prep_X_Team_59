import json
from core.llm_client import LLMClient


class SyllabusStructurer:
    def __init__(self):
        self.llm = LLMClient()

    def structure(self, syllabus_text: str) -> dict:
        if not syllabus_text or len(syllabus_text.strip()) < 200:
            raise ValueError("Syllabus text too short")

        prompt = f"""
Extract the syllabus structure.

Return ONLY valid JSON.

Schema:
{{
  "modules": [
    {{
      "name": "Module Name",
      "topics": [
        {{
          "name": "Topic Name",
          "difficulty_hint": "easy|medium|hard",
          "subtopics": ["Subtopic 1", "Subtopic 2"]
        }}
      ]
    }}
  ]
}}

Syllabus:
\"\"\"
{syllabus_text}
\"\"\"
"""

        raw = self.llm.generate(prompt)

        # Safe JSON extraction
        start = raw.find("{")
        end = raw.rfind("}") + 1

        if start == -1 or end == -1:
            raise ValueError("No JSON found in LLM response")

        try:
            parsed = json.loads(raw[start:end])
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON from LLM: {e}")

        if "modules" not in parsed:
            raise ValueError("Missing 'modules' key")

        return parsed
