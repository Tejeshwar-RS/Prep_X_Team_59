from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.adaptive_engine import AdaptiveEngine
from core.question_generator import QuestionGenerator

router = APIRouter(prefix="/api/practice", tags=["Practice"])

adaptive_engine = AdaptiveEngine()
question_generator = QuestionGenerator()

# --- Request Models ---

class GenerateQuestionRequest(BaseModel):
    user_id: str
    topic: str


class SubmitAnswerRequest(BaseModel):
    user_id: str
    topic: str
    selected_option: str
    correct_answer: str


# --- Routes ---

@router.post("/generate")
def generate_question(data: GenerateQuestionRequest):
    mastery = adaptive_engine.get_mastery(data.user_id, data.topic)
    difficulty = adaptive_engine.get_difficulty(mastery)

    try:
        question = question_generator.generate_question(
            topic=data.topic,
            difficulty=difficulty,
            user_id=data.user_id  # Pass user_id for history tracking
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "topic": data.topic,
        "difficulty": difficulty,
        "question": question
    }


@router.post("/submit")
def submit_answer(data: SubmitAnswerRequest):
    is_correct = data.selected_option == data.correct_answer
    score = 100 if is_correct else 0
    
    # Get current mastery to determine difficulty
    mastery = adaptive_engine.get_mastery(data.user_id, data.topic)
    current_difficulty = adaptive_engine.get_difficulty(mastery)

    # Update mastery with difficulty-aware formula
    new_mastery = adaptive_engine.update_mastery(
        user_id=data.user_id,
        topic=data.topic,
        score=score,
        difficulty=current_difficulty
    )

    next_difficulty = adaptive_engine.get_difficulty(new_mastery)

    return {
        "correct": is_correct,
        "score": score,
        "updated_mastery": new_mastery * 100,  # Convert to percentage
        "next_difficulty": next_difficulty
    }
