import asyncio
import uuid
from app.agents import ALL_AGENTS
from app.models.schemas import CaseInput, QuorumVerdict

async def run_quorum(case: CaseInput) -> QuorumVerdict:
    """
    Runs all specialist agents in parallel.
    Collects their verdicts and synthesizes a unified response.
    """
    # Run all agents concurrently
    verdicts = await asyncio.gather(*[agent.analyze(case) for agent in ALL_AGENTS])

    # TODO: Hersh — replace this with real synthesis via Azure OpenAI GPT-4o
    avg_confidence = sum(v.confidence for v in verdicts) / len(verdicts) if verdicts else 0.0
    synthesized = (
        "Agents have completed their analysis. "
        "Azure OpenAI-based synthesis pending integration."
    )
    actions = ["Await Azure OpenAI integration for actionable recommendations."]

    return QuorumVerdict(
        case_id=str(uuid.uuid4()),
        synthesized_verdict=synthesized,
        agent_verdicts=list(verdicts),
        confidence_score=avg_confidence,
        recommended_actions=actions,
    )
