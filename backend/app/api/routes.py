from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.agents import ALL_AGENTS
from app.core.orchestrator import run_quorum, run_quorum_stream
from app.models.schemas import AgentMeta, CaseInput, QuorumVerdict

router = APIRouter()


@router.get("/agents", response_model=list[AgentMeta])
async def list_agents() -> list[AgentMeta]:
    return [AgentMeta(name=a.name, specialty=a.specialty) for a in ALL_AGENTS]


@router.post("/case/analyze", response_model=QuorumVerdict)
async def analyze_case(case: CaseInput) -> QuorumVerdict:
    try:
        return await run_quorum(case)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/case/analyze/stream")
async def analyze_case_stream(case: CaseInput) -> StreamingResponse:
    return StreamingResponse(run_quorum_stream(case), media_type="text/event-stream")
