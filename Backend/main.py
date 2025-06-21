from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from services.code_analyzer import CodeAnalyzer
import asyncio
import time

# Initialize analyzer globally
analyzer = CodeAnalyzer()

def get_analyzer():
    return analyzer

app = FastAPI(
    title="AI Code Reviewer API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url=None
)

# Timeout configuration
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
        process_time = time.time() - start_time
        print(f"Request completed in {process_time:.2f}s")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "analyzer_ready": True}

# Import and include routes
try:
    from routes import endpoints
    app.include_router(endpoints.router, prefix="/api/v1")
except ImportError:
    print("Warning: Could not import routes module. API endpoints may not be available.")
    print("Make sure you're running the server using: python run_server.py")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        timeout_keep_alive=60
    )