"""
Local AI Fallback Service
Provides rule-based offline generation when Gemini API is unavailable.
"""
class LocalAIFallback:
    @staticmethod
    def generate_fallback_questions(topic="General", num_questions=3):
        return [
            {
                "question": f"Explain the fundamental mechanism of {topic}.",
                "type": "short_answer",
                "correct_answer": f"{topic} operates based on core foundational principles.",
                "points": 2
            },
            {
                "question": f"{topic} is essential in modern computing.",
                "type": "true_false",
                "correct_answer": "True",
                "points": 1
            }
        ]

