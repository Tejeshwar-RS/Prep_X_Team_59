class AdaptiveEngine:
    def __init__(self):
        # In-memory store (user_id -> topic -> mastery)
        self.user_state = {}
        
        # Difficulty multipliers for mastery updates
        self.difficulty_multipliers = {
            "easy": 0.6,
            "medium": 1.0,
            "hard": 1.5
        }
        
        # Base change per question (in percentage points)
        self.base_change = 5.0

    def get_mastery(self, user_id: str, topic: str) -> float:
        """Get current mastery score (0.0 to 1.0)"""
        return self.user_state.get(user_id, {}).get(topic, 0.5)  # Default to 50%

    def update_mastery(self, user_id: str, topic: str, score: float, difficulty: str = "medium"):
        """
        Update mastery score based on correctness and difficulty.
        
        Formula: New Mastery = Current Mastery + (Base Change × Difficulty Multiplier × Correctness)
        
        Args:
            user_id: User identifier
            topic: Topic being practiced
            score: 0-100, where 100 = correct, 0 = incorrect
            difficulty: "easy", "medium", or "hard"
        
        Returns:
            Updated mastery score (0.0 to 1.0)
        """
        current_mastery = self.get_mastery(user_id, topic)
        
        # Get difficulty multiplier
        multiplier = self.difficulty_multipliers.get(difficulty, 1.0)
        
        # Determine correctness factor (+1 for correct, -1 for incorrect)
        correctness = 1 if score >= 50 else -1
        
        # Calculate delta (change in mastery)
        # Convert to 0-1 scale by dividing by 100
        delta = (self.base_change * multiplier * correctness) / 100
        
        # Update mastery with bounds [0, 1]
        new_mastery = max(0.0, min(1.0, current_mastery + delta))
        
        # Store and return
        self.user_state.setdefault(user_id, {})[topic] = round(new_mastery, 4)
        return self.user_state[user_id][topic]

    def get_difficulty(self, mastery: float) -> str:
        """
        Determine question difficulty based on mastery level.
        
        Args:
            mastery: Current mastery score (0.0 to 1.0)
        
        Returns:
            Difficulty level: "easy", "medium", or "hard"
        """
        if mastery < 0.4:
            return "easy"
        elif mastery < 0.75:
            return "medium"
        else:
            return "hard"

