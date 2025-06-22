from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from dependencies import get_analyzer
from services.code_analyzer import CodeAnalyzer
from quantum_similarity import quantum_similarity
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

router = APIRouter()

# ================== Models ==================
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

class QuantumInput(BaseModel):
    vec1: List[float]
    vec2: List[float]

class QuantumSimilarityResponse(BaseModel):
    similarity: float

class ExplainRequest(BaseModel):
    selected: str
    context: str

# ================== Models Loaded Once ==================
tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5-base")
model = AutoModelForSeq2SeqLM.from_pretrained("Salesforce/codet5-base")

# ================== Routes ==================
@router.get("/health")
async def versioned_health_check():
    return {"status": "healthy (v1)", "ok": True}

@router.post("/analyze", response_model=CodeAnalysisResponse)
async def analyze_code(
    request: CodeAnalysisRequest,
    analyzer: CodeAnalyzer = Depends(get_analyzer)
):
    try:
        result = analyzer.analyze(request.code, request.language, request.edit_history)
        return CodeAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-ai", response_model=AIDetectionResponse)
async def detect_ai_generated_code(
    request: AIDetectionRequest,
    analyzer: CodeAnalyzer = Depends(get_analyzer)
):
    try:
        result = analyzer.detect_ai_generated(request.code, request.language, request.edit_history)
        return AIDetectionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize", response_model=CodeAnalysisResponse)
async def optimize_code(
    request: CodeAnalysisRequest,
    analyzer: CodeAnalyzer = Depends(get_analyzer)
):
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
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quantum-similarity", response_model=QuantumSimilarityResponse)
async def run_quantum_similarity(data: QuantumInput):
    try:
        score = quantum_similarity(data.vec1, data.vec2)
        return {"similarity": score}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Quantum similarity failed: {str(e)}")

@router.post("/explain")
async def explain_code(data: ExplainRequest):
    try:
        prompt = f"Explain what the following line does in context:\n\nLine: {data.selected}\n\nContext:\n{data.context}"
        inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
        outputs = model.generate(**inputs, max_length=128)
        explanation = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return {"explanation": explanation.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM explanation failed: {str(e)}")
