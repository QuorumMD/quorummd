import asyncio
import os
import uuid

from groq import AsyncGroq

from app.agents import ALL_AGENTS
from app.models.schemas import CaseInput, QuorumVerdict

_client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
_SYNTH_MODEL = "llama-3.3-70b-versatile"  # confirm against your current Groq model list


async def _synthesize(case: CaseInput, verdicts) -> tuple[str, list[str]]:
    """
    Reconciles the specialist verdicts into a single synthesized opinion
    and a short list of recommended actions. Swap for Azure OpenAI GPT-4o
    when that integration is ready, keeping the same return shape.
    """
    findings_block = "\n\n".join(
        f"{v.specialty.upper()} ({v.agent_name}):\n{v.finding}" for v in verdicts
    )
    prompt = (
        "You are reconciling independent specialist opinions on a clinical case into a single "
        "synthesized second opinion for a physician. Do not repeat each specialist verbatim -- "
        "identify points of agreement, points of disagreement or omission, and the most "
        "clinically significant considerations across all specialists. End with 2-4 concrete, "
        "concise recommended next actions as a plain list, one per line, prefixed with '- '.\n\n"
        f"Case: {case.case_description}\n\n"
        f"Specialist findings:\n{findings_block}\n\n"
        "Respond in two parts: first a short synthesized paragraph, then a line that says "
        "'ACTIONS:' followed by the action list."
    )

    try:
        completion = await _client.chat.completions.create(
            model=_SYNTH_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        text = completion.choices[0].message.content

        if "ACTIONS:" in text:
            summary, actions_block = text.split("ACTIONS:", 1)
            actions = [
                line.strip("- ").strip()
                for line in actions_block.strip().splitlines()
                if line.strip()
            ]
        else:
            summary, actions = text, []

        return summary.strip(), actions or ["Review specialist findings above and verify with the treating physician."]

    except Exception as e:
        return (
            f"Synthesis unavailable: {e}",
            ["Review each specialist's findings above individually."],
        )


async def run_quorum(case: CaseInput) -> QuorumVerdict:
    """
    Runs all specialist agents in parallel, then synthesizes their findings
    into a single unified verdict.
    """
    verdicts = await asyncio.gather(*[agent.analyze(case) for agent in ALL_AGENTS])

    avg_confidence = sum(v.confidence for v in verdicts) / len(verdicts) if verdicts else 0.0
    synthesized, actions = await _synthesize(case, verdicts)

    return QuorumVerdict(
        case_id=str(uuid.uuid4()),
        synthesized_verdict=synthesized,
        agent_verdicts=list(verdicts),
        confidence_score=avg_confidence,
        recommended_actions=actions,
    )