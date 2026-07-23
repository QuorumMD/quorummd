from typing import Optional
from pydantic import BaseModel, Field

DISCLAIMER = (
    "QuorumMD is a clinical decision support tool. All outputs must be "
    "verified by a licensed medical professional."
)


class CaseInput(BaseModel):
    case_description: str = Field(..., min_length=1)
    patient_age: Optional[int] = None
    biological_sex: Optional[str] = None
    additional_context: Optional[str] = None


class AgentVerdict(BaseModel):
    agent_name: str
    specialty: str
    finding: str
    sources: list[str] = []
    confidence: float
    self_reported_confidence: float = 0.0
    relevance_score: float = 0.0
    elapsed_ms: int = 0


class AgentMeta(BaseModel):
    name: str
    specialty: str


class QuorumVerdict(BaseModel):
    case_id: str
    synthesized_verdict: str
    agent_verdicts: list[AgentVerdict]
    confidence_score: float
    recommended_actions: list[str]
    total_elapsed_ms: int = 0
    disclaimer: str = DISCLAIMER