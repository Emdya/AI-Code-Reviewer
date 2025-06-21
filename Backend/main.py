from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from services.code_analyzer import CodeAnalyzer

# Initialize the analyzer globally
analyzer = CodeAnalyzer()

app = FastAPI()

# Dependency function to get the analyzer instance
def get_analyzer():
    return analyzer

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes with dependency injection
from routes import endpoints
app.include_router(endpoints.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)