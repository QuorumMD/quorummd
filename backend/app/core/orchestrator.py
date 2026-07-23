import asyncio
import json
import os
import time
import uuid
from typing import AsyncGenerator

from groq import AsyncGroq

from app.agents import ALL_AGENTS
from app.models.schemas import DISCLAIMER, AgentVerdict, CaseInput, QuorumVerdict

_client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
_SYNTH_MODEL = "llama-3.3-70b-versatile"  # confirm against your current Groq model list
_SYNTH_TIMEOUT_S = 6.0


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
        completion = await asyncio.wait_for(
            _client.chat.completions.create(
                model=_SYNTH_MODEL,
                messages=[{"role": "user", "content": prompt}],
            ),
            timeout=_SYNTH_TIMEOUT_S,
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

    except asyncio.TimeoutError:
        return (
            f"Synthesis timed out after {_SYNTH_TIMEOUT_S:.0f}s.",
            ["Review each specialist's findings above individually."],
        )
    except Exception as e:
        return (
            f"Synthesis unavailable: {e}",
            ["Review each specialist's findings above individually."],
        )


async def _run_agents(case: CaseInput, start_time: float) -> list[AgentVerdict]:
    return list(await asyncio.gather(*[agent.analyze(case, start_time) for agent in ALL_AGENTS]))


def _sse(event: str, data: dict) -> bytes:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n".encode("utf-8")


async def run_quorum(case: CaseInput) -> QuorumVerdict:
    """
    Runs all specialist agents in parallel, then synthesizes their findings
    into a single unified verdict. Non-streaming counterpart to run_quorum_stream.
    """
    start_time = time.monotonic()
    verdicts = await _run_agents(case, start_time)

    avg_confidence = sum(v.confidence for v in verdicts) / len(verdicts) if verdicts else 0.0
    synthesized, actions = await _synthesize(case, verdicts)

    return QuorumVerdict(
        case_id=str(uuid.uuid4()),
        synthesized_verdict=synthesized,
        agent_verdicts=verdicts,
        confidence_score=round(avg_confidence, 2),
        recommended_actions=actions,
        total_elapsed_ms=int((time.monotonic() - start_time) * 1000),
    )


async def run_quorum_stream(case: CaseInput) -> AsyncGenerator[bytes, None]:
    """
    Same pipeline as run_quorum, but yields Server-Sent Events as each agent finishes so the
    frontend can render results live instead of waiting on one blocking response:
      roster -> agent_verdict (x N, in completion order) -> synthesis -> done
    """
    start_time = time.monotonic()
    case_id = str(uuid.uuid4())

    roster = [{"name": a.name, "specialty": a.specialty} for a in ALL_AGENTS]
    yield _sse("roster", {"agents": roster})

    order = {agent.name: i for i, agent in enumerate(ALL_AGENTS)}
    tasks = [asyncio.create_task(agent.analyze(case, start_time)) for agent in ALL_AGENTS]

    verdicts: list[AgentVerdict] = []
    for coro in asyncio.as_completed(tasks):
        verdict = await coro
        verdicts.append(verdict)
        yield _sse("agent_verdict", verdict.model_dump())

    verdicts.sort(key=lambda v: order[v.agent_name])

    synthesized, actions = await _synthesize(case, verdicts)
    yield _sse("synthesis", {"synthesized_verdict": synthesized, "recommended_actions": actions})

    avg_confidence = sum(v.confidence for v in verdicts) / len(verdicts) if verdicts else 0.0
    yield _sse("done", {
        "case_id": case_id,
        "confidence_score": round(avg_confidence, 2),
        "total_elapsed_ms": int((time.monotonic() - start_time) * 1000),
        "disclaimer": DISCLAIMER,
    })
