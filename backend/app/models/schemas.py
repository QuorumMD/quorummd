from typing import Optional
from pydantic import BaseModel, Field


class CaseInput(BaseModel):
    case_description: str = Field(..., min_length=1)
    patient_age: Optional[int] = None
    biological_sex: Optional[str] = None
    additional_context: Optional[str] = None


class AgentVerdict(BaseModel):
    agent_name: str
    specialty: str
    reasoning: str
    confidence: float


class QuorumVerdict(BaseModel):
    case_id: str
    synthesized_verdict: str
    agent_verdicts: list[AgentVerdict]
    confidence_score: float
    recommended_actions: list[str]
