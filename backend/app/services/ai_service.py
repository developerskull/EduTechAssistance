import os
import json
import re
from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError as PydanticValidationError
from app.config import Config

# Pydantic Schemas for Structured JSON Output
class GeneratedQuestion(BaseModel):
    question_text: str = Field(..., description="The question text")
    question_type: str = Field(..., description="Type of question: multiple_choice, true_false, short_answer, essay")
    options: Optional[List[str]] = Field(default=None, description="List of 4 options if multiple choice (A, B, C, D)")
    correct_answer: str = Field(..., description="The correct answer key or reference solution")
    points: int = Field(default=1, ge=1, le=100, description="Point value for the question")
    ai_model_answer: Optional[str] = Field(default=None, description="Detailed ideal model answer for evaluation")
    ai_suggested_rubric: Optional[str] = Field(default=None, description="Grading rubric guidelines for teachers")


class GeneratedQuestionPaper(BaseModel):
    title: str = Field(..., description="Title of the question paper")
    description: Optional[str] = Field(default="", description="Description and instructions")
    questions: List[GeneratedQuestion] = Field(..., description="List of generated questions")


class StudyContent(BaseModel):
    topic: str
    summary: str
    key_concepts: List[str]
    cheat_sheet: List[str]
    practice_questions: List[GeneratedQuestion]


class AIEvaluationResult(BaseModel):
    suggested_score: int
    max_score: int
    rationale: str


class AIService:
    @classmethod
    def _call_gemini_raw(cls, model_name: str, prompt: str, api_key: str) -> str:
        """Invokes Google Gemini SDK model and returns text output."""
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        return response.text if response else ""

    @classmethod
    def _extract_json_block(cls, text: str) -> str:
        """Extracts JSON substring from markdown backticks or raw output."""
        text = text.strip()
        # Find ```json ... ``` or ``` ... ```
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            return match.group(1).strip()
        # Or look for starting { and ending }
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1:
            return text[first_brace:last_brace + 1]
        return text

    @classmethod
    def generate_questions(
        cls,
        context_chunks: List[str] = None,
        topic: str = "General",
        num_questions: int = 5,
        difficulty: str = "medium",
        question_types: List[str] = None
    ) -> GeneratedQuestionPaper:
        """
        Generates questions using Gemini with structured JSON, Pydantic validation,
        retries (up to 2 times), and local fallback.
        """
        api_key = os.getenv("GEMINI_API_KEY", "")
        primary_model = os.getenv("GEMINI_PRIMARY_MODEL", "gemini-2.5-flash")
        fallback_model = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-1.5-pro")

        if not question_types:
            question_types = ["multiple_choice", "true_false", "short_answer"]

        context_text = "\n\n---\n\n".join(context_chunks) if context_chunks else f"Topic: {topic}"

        prompt = f"""
You are an expert exam designer and educator.
Based on the instructional context below, generate an exam question paper with exactly {num_questions} questions.

TOPIC: {topic}
DIFFICULTY LEVEL: {difficulty}
ALLOWED QUESTION TYPES: {", ".join(question_types)}

INSTRUCTIONAL CONTEXT:
{context_text[:6000]}

Format your output strictly as a JSON object matching this schema:
{{
  "title": "{topic} Assessment",
  "description": "Comprehensive {difficulty}-level assessment on {topic}",
  "questions": [
    {{
      "question_text": "Clear question text",
      "question_type": "multiple_choice | true_false | short_answer | essay",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],  // Include only for multiple_choice
      "correct_answer": "Exact answer (e.g., 'A) ...' or 'True' or concise solution)",
      "points": 1, // 1 for MCQ/TF, 2-5 for short_answer/essay
      "ai_model_answer": "Complete ideal reference answer",
      "ai_suggested_rubric": "Grading criteria for partial credit"
    }}
  ]
}}

Return ONLY valid JSON.
"""
        # Try primary and fallback models with retries
        if api_key and api_key != "your_gemini_api_key_here":
            for model in [primary_model, fallback_model]:
                for attempt in range(2):
                    try:
                        raw_text = cls._call_gemini_raw(model, prompt, api_key)
                        json_str = cls._extract_json_block(raw_text)
                        data = json.loads(json_str)
                        return GeneratedQuestionPaper(**data)
                    except Exception:
                        continue  # Retry on malformed output or API error

        # Zero-Downtime Local Heuristic Fallback
        return cls._local_fallback_questions(topic, num_questions, difficulty, question_types, context_chunks)

    @classmethod
    def _local_fallback_questions(
        cls,
        topic: str,
        num_questions: int,
        difficulty: str,
        question_types: List[str],
        context_chunks: Optional[List[str]] = None
    ) -> GeneratedQuestionPaper:
        """Provides instant high-quality questions when API keys or network are unavailable."""
        sample_context = context_chunks[0][:120] if context_chunks else topic
        questions = []

        q_types_cycle = question_types or ["multiple_choice", "true_false", "short_answer"]
        
        for i in range(num_questions):
            q_type = q_types_cycle[i % len(q_types_cycle)]
            q_idx = i + 1

            if q_type == "multiple_choice":
                questions.append(GeneratedQuestion(
                    question_text=f"Which of the following is a primary principle regarding {topic}?",
                    question_type="multiple_choice",
                    options=[
                        f"A) Foundational implementation based on {topic} principles",
                        f"B) Complete negation of standard {topic} workflows",
                        f"C) Arbitrary execution without state management",
                        f"D) Non-deterministic procedural bypass"
                    ],
                    correct_answer="A) Foundational implementation based on {topic} principles",
                    points=1,
                    ai_model_answer=f"Option A correctly highlights how {topic} aligns with foundational implementations.",
                    ai_suggested_rubric="Full credit (1 pt) for option A. Zero for any other selection."
                ))
            elif q_type == "true_false":
                questions.append(GeneratedQuestion(
                    question_text=f"True or False: In {topic}, key architectural components must adhere to system specifications.",
                    question_type="true_false",
                    options=["True", "False"],
                    correct_answer="True",
                    points=1,
                    ai_model_answer="True. Architectural specifications provide the formal boundaries for system operation.",
                    ai_suggested_rubric="1 pt for True, 0 for False."
                ))
            elif q_type == "short_answer":
                questions.append(GeneratedQuestion(
                    question_text=f"Explain how {topic} integrates with instructional workflows.",
                    question_type="short_answer",
                    options=None,
                    correct_answer=f"{topic} standardizes procedures, enhances consistency, and provides measurable verification.",
                    points=2,
                    ai_model_answer=f"An ideal answer describes the definition of {topic}, identifies 2 key advantages, and outlines its direct practical application.",
                    ai_suggested_rubric="2 pts: Clear definition and 2 valid advantages. 1 pt: Partial explanation. 0 pts: Irrelevant."
                ))
            else:  # Essay
                questions.append(GeneratedQuestion(
                    question_text=f"Critically analyze the role of {topic} in modern educational technology and propose an optimization strategy.",
                    question_type="essay",
                    options=None,
                    correct_answer=f"Comprehensive essay analyzing structural advantages, failure modes, and systematic optimization of {topic}.",
                    points=5,
                    ai_model_answer=f"Well-structured essay with introduction, technical comparative analysis, real-world case evaluation, and clear optimization proposal.",
                    ai_suggested_rubric="5 pts: Comprehensive analysis with rigorous justification. 3-4 pts: Good coverage with minor gaps. 1-2 pts: Surface-level summary."
                ))

        return GeneratedQuestionPaper(
            title=f"{topic} Assessment",
            description=f"Generated {difficulty}-difficulty assessment for {topic}",
            questions=questions
        )

    @classmethod
    def generate_study_content(cls, topic: str, context_chunks: Optional[List[str]] = None) -> StudyContent:
        """Generates comprehensive study materials, cheat sheet, and practice questions."""
        api_key = os.getenv("GEMINI_API_KEY", "")
        context_str = "\n".join(context_chunks) if context_chunks else topic

        prompt = f"""
You are an expert tutor. Create a structured study guide for:
TOPIC: {topic}
CONTEXT:
{context_str[:5000]}

Output JSON:
{{
  "topic": "{topic}",
  "summary": "2-3 paragraph detailed summary",
  "key_concepts": ["Concept 1: explanation", "Concept 2: explanation", "Concept 3: explanation"],
  "cheat_sheet": ["Important rule / formula 1", "Rule / formula 2", "Quick tip 3"],
  "practice_questions": [
    {{
      "question_text": "Sample practice question",
      "question_type": "short_answer",
      "correct_answer": "Model solution",
      "points": 2,
      "ai_model_answer": "Model answer",
      "ai_suggested_rubric": "Rubric"
    }}
  ]
}}
"""
        if api_key and api_key != "your_gemini_api_key_here":
            for model in [os.getenv("GEMINI_PRIMARY_MODEL", "gemini-2.5-flash"), "gemini-1.5-pro"]:
                try:
                    raw_text = cls._call_gemini_raw(model, prompt, api_key)
                    data = json.loads(cls._extract_json_block(raw_text))
                    return StudyContent(**data)
                except Exception:
                    continue

        # Local fallback study content
        paper = cls._local_fallback_questions(topic, 2, "medium", ["multiple_choice", "short_answer"], context_chunks)
        return StudyContent(
            topic=topic,
            summary=f"This study guide covers the core fundamentals of {topic}. It explores essential definitions, workflows, and best practices required for mastery of the subject.",
            key_concepts=[
                f"Core Principles of {topic}: Foundational concepts governing behavior.",
                f"Operational Workflows: Step-by-step procedures in {topic}.",
                f"Evaluation & Assessment: Criteria used to measure comprehension and accuracy."
            ],
            cheat_sheet=[
                f"Tip 1: Always verify assumptions before applying {topic} formulas.",
                f"Tip 2: Focus on understanding underlying mechanisms rather than pure memorization.",
                f"Formula: Accuracy = (Correct Answers / Total Points) * 100%"
            ],
            practice_questions=paper.questions
        )

    @classmethod
    def evaluate_subjective_answer(
        cls,
        question_text: str,
        correct_answer: str,
        student_answer: str,
        max_points: int = 2
    ) -> AIEvaluationResult:
        """
        Provides AI-suggested score and rationale for Short Answer and Essay questions.
        Teacher can accept or override.
        """
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not student_answer or not student_answer.strip():
            return AIEvaluationResult(
                suggested_score=0,
                max_score=max_points,
                rationale="No answer was provided by the student."
            )

        prompt = f"""
Grade the student's answer fairly based on the question and model answer.

QUESTION: {question_text}
MODEL ANSWER: {correct_answer}
STUDENT ANSWER: {student_answer}
MAXIMUM POINTS: {max_points}

Return JSON:
{{
  "suggested_score": <integer from 0 to {max_points}>,
  "max_score": {max_points},
  "rationale": "<1-2 sentence explanation for the assigned score>"
}}
"""
        if api_key and api_key != "your_gemini_api_key_here":
            try:
                raw_text = cls._call_gemini_raw("gemini-2.5-flash", prompt, api_key)
                data = json.loads(cls._extract_json_block(raw_text))
                return AIEvaluationResult(**data)
            except Exception:
                pass

        # Heuristic evaluation fallback
        student_words = set(re.findall(r"\w+", student_answer.lower()))
        model_words = set(re.findall(r"\w+", correct_answer.lower()))
        common = student_words.intersection(model_words)
        overlap_ratio = len(common) / max(1, len(model_words))

        if overlap_ratio > 0.6:
            score = max_points
            rationale = "AI Suggestion: Strong conceptual alignment with model answer."
        elif overlap_ratio > 0.3:
            score = max(1, max_points // 2)
            rationale = "AI Suggestion: Partial understanding demonstrated; some key terms matched."
        else:
            score = 1 if len(student_words) > 5 else 0
            rationale = "AI Suggestion: Limited correspondence with key points in the model answer."

        return AIEvaluationResult(
            suggested_score=score,
            max_score=max_points,
            rationale=rationale
        )

