from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.code_analyzer import CodeAnalyzer
from services.feedback_logger import log_feedback
from typing import Optional

router = APIRouter()
analyzer = CodeAnalyzer()

class CodeAnalysisRequest(BaseModel):
    code: str
    language: str
    context: Optional[str] = None

class CodeAnalysisResponse(BaseModel):
    issues: list
    optimized_code: Optional[str]
    explanation: Optional[str]
    score: float

class FeedbackRequest(BaseModel):
    analysis_id: str
    vote: int  # 1 for positive, -1 for negative
    comment: Optional[str]

@router.post("/analyze", response_model=CodeAnalysisResponse)
async def analyze_code(request: CodeAnalysisRequest):
    try:
        analysis = analyzer.analyze(
            request.code,
            request.language,
            request.context
        )
        return CodeAnalysisResponse(**analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize", response_model=CodeAnalysisResponse)
async def optimize_code(request: CodeAnalysisRequest):
    try:
        optimized = analyzer.optimize(
            request.code,
            request.language
        )
        return CodeAnalysisResponse(**optimized)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    try:
        log_feedback(
            request.analysis_id,
            request.vote,
            request.comment
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))