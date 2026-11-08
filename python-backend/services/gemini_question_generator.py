"""
Gemini Question Generator Service
"""
class GeminiQuestionGenerator:
    def __init__(self, api_key=None):
        self.api_key = api_key

    def generate_questions(self, text, num_questions=5, difficulty="medium"):
        return [
            {
                "question": f"Sample concept question {i+1} on {text[:20]}...",
                "type": "multiple_choice",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A",
                "points": 1
            }
            for i in range(num_questions)
        ]

