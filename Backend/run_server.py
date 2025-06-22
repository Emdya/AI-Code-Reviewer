#!/usr/bin/env python3
"""
Startup script for the AI Code Reviewer backend server
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from routes import endpoints
import uvicorn

# Include the routes
app.include_router(endpoints.router, prefix="/api/v1")

if __name__ == "__main__":
    print("Starting AI Code Reviewer Backend Server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/api/docs")
    print("Health check at: http://localhost:8000/health")
    print("\nPress Ctrl+C to stop the server")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        timeout_keep_alive=60
    ) 