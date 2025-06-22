import sys
import os
sys.path.append(os.path.dirname(__file__))
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from services.code_analyzer import CodeAnalyzer
import asyncio
import time

# ✅ Analyzer instance and DI function
analyzer = CodeAnalyzer()

def get_analyzer():
    return analyzer

# ✅ Create FastAPI instance
app = FastAPI(
    title="AI Code Reviewer API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url=None
)

# ✅ Timeout Middleware for long tasks
ANALYSIS_TIMEOUT = 30  # seconds

@app.middleware("http")
async def timeout_middleware(request: Request, call_next):
    start_time = time.time()
    try:
        if request.url.path in ["/api/v1/analyze", "/api/v1/optimize"]:
            async with asyncio.timeout(ANALYSIS_TIMEOUT):
                return await call_next(request)
        return await call_next(request)
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail=f"Operation timed out after {ANALYSIS_TIMEOUT} seconds"
        )
    finally:
        duration = time.time() - start_time
        print(f"⏱️ Request to {request.url.path} completed in {duration:.2f} seconds")

# ✅ CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify domains: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Basic health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "analyzer_ready": True
    }

# ✅ Include API routes if available
try:
    from routes import endpoints
    app.include_router(endpoints.router, prefix="/api/v1")
except ImportError as e:
    print("⚠️ Warning: Could not import routes module.")
    print("   → Detail:", e)
    print("   → Make sure to run from the project root: `python run_server.py`")

# ✅ CLI Entry Point (for python main.py)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        timeout_keep_alive=60
    )
