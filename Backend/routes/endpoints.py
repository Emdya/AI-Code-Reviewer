from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from Backend.main import get_analyzer
from services.code_analyzer import CodeAnalyzer

router = APIRouter() 

class CodeAnalysisRequest(BaseModel):
    code: str
    language: str
    context: Optional[str] = None
    edit_history: Optional[List[Dict]] = None

class CodeAnalysisResponse(BaseModel):
    analysis_id: Optional[str]
    issues: list
    optimized_code: Optional[str]
    explanation: Optional[str]
    score: Optional[float]
    message: Optional[str]
    changes: Optional[dict]
    ai_detection: Optional[dict]

class AIDetectionRequest(BaseModel):
    code: str
    language: str
    edit_history: Optional[List[Dict]] = None

class AIDetectionResponse(BaseModel):
    ai_detected: bool
    ai_confidence: float
    issues: list
    suggestions: list
    fixes: list

@router.post("/analyze", response_model=CodeAnalysisResponse)
async def analyze_code(
    request: CodeAnalysisRequest,
    analyzer: CodeAnalyzer = Depends(get_analyzer)
):
    """Analyze code for issues including AI-generated code detection"""
    try:
        result = analyzer.analyze(request.code, request.language, request.edit_history)
        return CodeAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/detect-ai", response_model=AIDetectionResponse)
async def detect_ai_generated_code(
    request: AIDetectionRequest,
    analyzer: CodeAnalyzer = Depends(get_analyzer)
):
    """Specifically detect AI-generated code patterns"""
    try:
        result = analyzer.detect_ai_generated(request.code, request.language, request.edit_history)
        return AIDetectionResponse(**result)
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
            analysis_id=None,
            optimized_code=result["optimized_code"],
            message=result["message"],
            changes=result.get("changes", {}),
            issues=[],
            explanation="Code optimization completed",
            score=1.0,
            ai_detection=None
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )