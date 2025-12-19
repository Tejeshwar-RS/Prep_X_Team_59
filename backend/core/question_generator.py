import json
import random
from typing import List, Set
from core.llm_client import LLMClient


class QuestionGenerator:
    def __init__(self):
        self.llm = LLMClient()
        # Track asked questions per user per topic to avoid repetition
        # Structure: {user_id: {topic: set(question_hashes)}}
        self.question_history = {}
        
        # Diverse question aspects to vary
        self.question_aspects = [
            "theoretical concepts",
            "practical applications",
            "problem-solving scenarios",
            "real-world examples",
            "edge cases and exceptions",
            "comparisons and contrasts",
            "best practices",
            "common mistakes",
            "advanced techniques",
            "fundamental principles"
        ]
        
        self.question_formats = [
            "What is the best approach to",
            "Which of the following correctly describes",
            "In the context of {topic}, what happens when",
            "Consider a scenario where",
            "Which statement is true about",
            "What is the primary purpose of",
            "How does {topic} handle",
            "What would be the result of"
        ]

    def _get_question_hash(self, question: str) -> str:
        """Create a simple hash of the question for duplicate detection"""
        # Use first 50 chars as a simple fingerprint
        return question.lower().strip()[:50]

    def _has_asked_before(self, user_id: str, topic: str, question: str) -> bool:
        """Check if this question was asked before"""
        q_hash = self._get_question_hash(question)
        if user_id not in self.question_history:
            return False
        if topic not in self.question_history[user_id]:
            return False
        return q_hash in self.question_history[user_id][topic]

    def _mark_as_asked(self, user_id: str, topic: str, question: str):
        """Mark this question as asked"""
        q_hash = self._get_question_hash(question)
        if user_id not in self.question_history:
            self.question_history[user_id] = {}
        if topic not in self.question_history[user_id]:
            self.question_history[user_id][topic] = set()
        self.question_history[user_id][topic].add(q_hash)

    def _get_previous_questions(self, user_id: str, topic: str) -> int:
        """Get count of previous questions for this user/topic"""
        if user_id not in self.question_history:
            return 0
        if topic not in self.question_history[user_id]:
            return 0
        return len(self.question_history[user_id][topic])

    def generate_question(self, topic: str, difficulty: str, user_id: str = None) -> dict:
        """Generate a unique, diverse question"""
        
        # Select random aspect and format for variety
        aspect = random.choice(self.question_aspects)
        question_count = self._get_previous_questions(user_id, topic) if user_id else 0
        
        # Build enhanced prompt with diversity instructions
        prompt = f"""Generate ONE unique exam-style MCQ question about {topic}.

CRITICAL REQUIREMENTS:
- Difficulty: {difficulty}
- Focus on: {aspect}
- Question number: {question_count + 1} (ensure this is DIFFERENT from previous questions)
- Must be a UNIQUE question - do NOT repeat common examples
- Use specific, detailed scenarios
- Avoid generic or textbook questions

DIVERSITY GUIDELINES:
- If this is question #{question_count + 1}, explore a DIFFERENT sub-topic or angle
- Use varied contexts: industry applications, debugging scenarios, optimization, design patterns
- Include specific numbers, names, or scenarios to make it unique
- Avoid starting with "What is..." if possible - use scenario-based questions

QUESTION REQUIREMENTS:
- Type: Multiple Choice (MCQ)
- Exactly 4 options (A, B, C, D)
- One correct answer
- Make wrong answers plausible but clearly incorrect
- Provide a detailed explanation

Return ONLY valid JSON in this exact schema:
{{
  "question": "Detailed, specific question text with context",
  "options": {{
    "A": "First option",
    "B": "Second option",
    "C": "Third option",
    "D": "Fourth option"
  }},
  "correct_answer": "A|B|C|D",
  "explanation": "Clear explanation of why the answer is correct and why others are wrong"
}}

IMPORTANT: Make this question UNIQUE and SPECIFIC. Use real-world scenarios, specific examples, or edge cases."""

        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                raw = self.llm.generate(prompt)
                
                start = raw.find("{")
                end = raw.rfind("}") + 1
                
                if start == -1 or end == -1:
                    raise ValueError("No JSON found in question generation response")
                
                question_data = json.loads(raw[start:end])
                
                # Validate required fields
                required_fields = ["question", "options", "correct_answer", "explanation"]
                if not all(field in question_data for field in required_fields):
                    raise ValueError("Missing required fields in question")
                
                # Check if we've asked this before (if user_id provided)
                if user_id and self._has_asked_before(user_id, topic, question_data["question"]):
                    if attempt < max_attempts - 1:
                        # Try again with more explicit diversity instruction
                        prompt += f"\n\nNOTE: Question attempt {attempt + 1} was too similar to a previous question. Generate something COMPLETELY DIFFERENT."
                        continue
                
                # Mark as asked
                if user_id:
                    self._mark_as_asked(user_id, topic, question_data["question"])
                
                return question_data
                
            except json.JSONDecodeError as e:
                if attempt == max_attempts - 1:
                    raise ValueError(f"Invalid JSON from LLM after {max_attempts} attempts: {e}")
                continue
            except Exception as e:
                if attempt == max_attempts - 1:
                    raise ValueError(f"Error generating question: {e}")
                continue
        
        raise ValueError("Failed to generate unique question after maximum attempts")
