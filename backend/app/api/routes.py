from fastapi import APIRouter, HTTPException

from app.core.orchestrator import run_quorum
from app.models.schemas import CaseInput, QuorumVerdict

router = APIRouter()


@router.post("/case/analyze", response_model=QuorumVerdict)
async def analyze_case(case: CaseInput) -> QuorumVerdict:
    try:
        return await run_quorum(case)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
