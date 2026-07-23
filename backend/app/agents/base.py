import asyncio
import os
import re
import time

from groq import AsyncGroq
from openai import AsyncOpenAI

from app.core.scoring import blend_confidence, relevance_score
from app.models.schemas import CaseInput, AgentVerdict

_PROVIDER_TIMEOUT_S = 8.0

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
            "After the bullets, on its own final line, first write one short clause (max 12 "
            "words) naming the single strongest reason this case does or doesn't sit squarely "
            "in your specialty, then immediately follow it with CONFIDENCE: <integer 0-100>, "
            "your genuine confidence in this assessment based on how strongly the case actually "
            "implicates your specialty.",
            f"Case description: {case.case_description}",
        ]
        if case.patient_age is not None:
            parts.append(f"Patient age: {case.patient_age}")
        if case.biological_sex:
            parts.append(f"Biological sex: {case.biological_sex}")
        if case.additional_context:
            parts.append(f"Additional context: {case.additional_context}")
        return "\n".join(parts)

    async def analyze(self, case: CaseInput, start_time: float | None = None) -> AgentVerdict:
        if start_time is None:
            start_time = time.monotonic()

        relevance = relevance_score(case, self.specialty)
        self_reported = 0.0

        try:
            messages = [{"role": "user", "content": self._build_prompt(case)}]

            if _PROVIDER == "huggingface":
                call = _hf_client.chat.completions.create(
                    model=_HF_MODEL, messages=messages, temperature=0.8
                )
            else:
                call = _groq_client.chat.completions.create(
                    model=_GROQ_MODEL, messages=messages, temperature=0.8
                )

            completion = await asyncio.wait_for(call, timeout=_PROVIDER_TIMEOUT_S)
            raw = completion.choices[0].message.content
            finding, self_reported = self._extract_confidence(raw)
            confidence = blend_confidence(self_reported, relevance)
        except asyncio.TimeoutError:
            finding = (
                f"[timeout] {self.name} did not respond within "
                f"{_PROVIDER_TIMEOUT_S:.0f}s."
            )
            confidence = 0.0
        except Exception as e:
            finding = f"[error] {self.name} could not complete analysis ({_PROVIDER}): {e}"
            confidence = 0.0

        return AgentVerdict(
            agent_name=self.name,
            specialty=self.specialty,
            finding=finding,
            sources=[],
            confidence=confidence,
            self_reported_confidence=self_reported,
            relevance_score=relevance,
            elapsed_ms=int((time.monotonic() - start_time) * 1000),
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
        line_start = raw.rfind("\n", 0, match.start())
        finding = raw[:line_start].strip() if line_start != -1 else raw[:match.start()].strip()
        return finding, round(score / 100, 2)