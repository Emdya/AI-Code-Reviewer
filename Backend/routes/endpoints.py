from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List


from Backend.services.code_analyzer import CodeAnalyzer
from ..main import get_analyzer
router = APIRouter()

# ✨ Define Issue model for strong typing + Swagger docs
class Issue(BaseModel):
    message: str
    category: str
    severity: str
    range: List[int]  # Assuming range is a list of integers representing line numbers or character positions

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
    message: Optional[str] = None  
    changes: Optional[dict] = None
    


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
            analysis_id=result.get("analysis_id", "N/A"),
            explanation=result.get("explanation", "Optimization complete."),
            score=result.get("score", 1.0),
            message=result.get("message", ""),
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
    