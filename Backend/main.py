from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import endpoints
import uvicorn

app = FastAPI(
    title="AI Code Reviewer API",
    description="Backend for analyzing and improving AI-generated code",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(endpoints.router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)