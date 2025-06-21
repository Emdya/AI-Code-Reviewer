from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from Backend.main import get_analyzer
from services.code_analyzer import CodeAnalyzer

router = APIRouter()

class CodeAnalysisRequest(BaseModel):
    code: str
    language: str
    context: Optional[str] = None

class CodeAnalysisResponse(BaseModel):
    analysis_id: Optional[str]
    issues: list
    optimized_code: Optional[str]
    explanation: Optional[str]
    score: Optional[float]
    message: Optional[str]
    changes: Optional[dict]

@router.post("/analyze", response_model=CodeAnalysisResponse)
async def analyze_code(
    request: CodeAnalysisRequest,
    analyzer: CodeAnalyzer = Depends(get_analyzer)
):
    """Analyze code for issues"""
    try:
        result = analyzer.analyze(request.code, request.language)
        return CodeAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/optimize", response_model=CodeAnalysisResponse)
async def optimize_code(
    request: CodeAnalysisRequest,
    analyzer: CodeAnalyzer = Depends(get_analyzer)
):
    """Optimize the given code"""
    try:
        result = analyzer.optimize(request.code, request.language)
        return CodeAnalysisResponse(
            optimized_code=result["optimized_code"],
            message=result["message"],
            changes=result.get("changes", {}),
            issues=[]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )