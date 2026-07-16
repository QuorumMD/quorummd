import os
import re

from groq import AsyncGroq
from openai import AsyncOpenAI

from app.models.schemas import CaseInput, AgentVerdict

# Toggle between providers without touching code -- set in .env.
# "groq"        -> fast, free-tier friendly, used for day-to-day dev
# "huggingface" -> Qwen via HF Inference Providers, costs credits, use when ready
_PROVIDER = os.environ.get("INFERENCE_PROVIDER", "groq").lower()

_groq_client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
_GROQ_MODEL = "llama-3.3-70b-versatile"

_hf_client = AsyncOpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ.get("HUGGINGFACE_API_KEY"),
    timeout=60.0,
)
_HF_MODEL = "Qwen/Qwen3.6-27B:featherless-ai"


class SpecialistAgent:
    name: str = "Specialist"
    specialty: str = "general"

    def _build_prompt(self, case: CaseInput) -> str:
        parts = [
            f"You are a {self.specialty} specialist reviewing a clinical case as part of a "
            "multi-agent second-opinion panel. Respond ONLY as a short list of 3-5 concise "
            "bullet points, each starting with a bolded 2-4 word label followed by a colon and "
            "one brief sentence (max 20 words). Do not write paragraphs. Do not repeat the case "
            "back. Do not give a final diagnosis or verdict -- flag the most clinically "
            "significant considerations, risks, and differentials relevant to your specialty only.\n"
            "Format each bullet exactly like this: **Label:** one short sentence.\n"
            "After the bullets, on its own final line, write your confidence in this specific "
            "assessment as CONFIDENCE: <integer 0-100>. Base it on how strongly the case "
            "presentation implicates your specialty specifically -- a case with no relevance to "
            "your specialty should score low, a case squarely in your specialty's domain should "
            "score high. Do not default to a round number like 50, 70, 75, 80, or 90 -- give your "
            "actual best estimate.",
            f"Case description: {case.case_description}",
        ]
        if case.patient_age is not None:
            parts.append(f"Patient age: {case.patient_age}")
        if case.biological_sex:
            parts.append(f"Biological sex: {case.biological_sex}")
        if case.additional_context:
            parts.append(f"Additional context: {case.additional_context}")
        return "\n".join(parts)

    async def analyze(self, case: CaseInput) -> AgentVerdict:
        try:
            messages = [{"role": "user", "content": self._build_prompt(case)}]

            if _PROVIDER == "huggingface":
                completion = await _hf_client.chat.completions.create(
                    model=_HF_MODEL, messages=messages
                )
            else:
                completion = await _groq_client.chat.completions.create(
                    model=_GROQ_MODEL, messages=messages
                )

            raw = completion.choices[0].message.content
            finding, confidence = self._extract_confidence(raw)
        except Exception as e:
            finding = f"[error] {self.name} could not complete analysis ({_PROVIDER}): {e}"
            confidence = 0.0

        return AgentVerdict(
            agent_name=self.name,
            specialty=self.specialty,
            finding=finding,
            sources=[],
            confidence=confidence,
        )

    @staticmethod
    def _extract_confidence(raw: str) -> tuple[str, float]:
        """
        Pulls a trailing 'CONFIDENCE: <0-100>' line out of the model's response.
        Returns the finding text with that line stripped, and confidence as a 0-1 float.
        Falls back to 0.5 if the model didn't include a parseable score.
        """
        match = re.search(r"CONFIDENCE:\s*(\d{1,3})", raw, re.IGNORECASE)
        if not match:
            return raw.strip(), 0.5

        score = max(0, min(100, int(match.group(1))))
        finding = raw[:match.start()].strip()
        return finding, round(score / 100, 2)