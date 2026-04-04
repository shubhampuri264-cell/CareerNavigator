"""
Vercel serverless entry point for FastAPI backend.
This file is required for Vercel's Python runtime.
"""
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from main import app

# Vercel expects a variable named 'app' or a handler function
# We already have 'app' from main.py, so this just re-exports it
handler = app
