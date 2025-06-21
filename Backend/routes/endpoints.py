from fastapi import APIRouter, Depends
from pydantic import BaseModel
from Backend.main import get_analyzer
from services.code_analyzer import CodeAnalyzer
from typing import Optional

router = APIRouter()

class CodeAnalysisRequest(BaseModel):
    code: str
    language: str
    context: Optional[str] = None

# Use dependency injection in your endpoints
@router.post("/analyze")
async def analyze_code(
    request: CodeAnalysisRequest,
    analyzer: CodeAnalyzer = Depends(get_analyzer)  # Injected here
):
    return analyzer.analyze(
        request.code,
        request.language,
        request.context
    )

@router.post("/optimize")
async def optimize_code(
    request: CodeAnalysisRequest,
    analyzer: CodeAnalyzer = Depends(get_analyzer)  # Injected here
):
    return analyzer.optimize(
        request.code,
        request.language
    )