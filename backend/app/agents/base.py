from app.models.schemas import CaseInput, AgentVerdict


class SpecialistAgent:
    """
    Base class for a specialist clinical agent.
    Each specialty subclasses this and overrides `specialty` and `analyze`.
    """

    name: str = "Specialist"
    specialty: str = "general"

    async def analyze(self, case: CaseInput) -> AgentVerdict:
        # TODO: Hersh — replace with real Qwen / Azure OpenAI inference call.
        # This stub lets the pipeline run end-to-end during frontend/backend integration.
        return AgentVerdict(
            agent_name=self.name,
            specialty=self.specialty,
            reasoning=f"[stub] {self.name} reviewed the case description and found no immediate red flags for {self.specialty}.",
            confidence=0.5,
        )
